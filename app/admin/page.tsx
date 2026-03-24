"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Check, X, FileText, CheckCircle, XCircle, Mail } from "lucide-react"
import { AdminSidebarLayout } from "@/components/admin-sidebar-layout"
import { cn } from "@/lib/utils"
import { getAllUsers, updateUserStatus } from "@/lib/firebase-admin"

type VerificationStatus = "pending" | "verified" | "rejected" | "disabled"

interface User {
  id: string
  name: string
  email: string
  status: VerificationStatus
  documentUrl: string
  submittedAt: string | null
  verifiedAt: string | null
  disabledAt: string | null
}

const statusConfig = {
  pending: { label: "Pending",     icon: Shield,      bg: "bg-zinc-900 border-white/5", text: "text-zinc-400" },
  verified:{ label: "Verified",    icon: CheckCircle, bg: "bg-blue-600/10 border-blue-500/20", text: "text-blue-500" },
  rejected:{ label: "Rejected",    icon: XCircle,     bg: "bg-red-900/20 border-red-500/20",       text: "text-red-500" },
  disabled:{ label: "Disabled",    icon: XCircle,     bg: "bg-orange-900/20 border-orange-500/20", text: "text-orange-500" },
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem("admin_token") !== "true") {
      router.push("/admin/login")
    } else {
      setIsAuthorized(true)
      
      // Fetch users from Firebase
      const fetchUsers = async () => {
        const result = await getAllUsers()
        if (result.success) {
          const formattedUsers = result.users.map((u: any) => ({
            ...u,
            documentUrl: u.govIdImage || '#',
            submittedAt: u.submittedAt || u.createdAt || new Date().toISOString(),
            verifiedAt: u.verifiedAt || null,
            disabledAt: u.disabledAt || null
          }))
          setUsers(formattedUsers)
        }
      }
      
      fetchUsers()
    }
  }, [router])

  if (!isAuthorized) return null

  const updateUserStatusHandler = async (userId: string, newStatus: VerificationStatus) => {
    setProcessingId(userId)
    
    const result = await updateUserStatus(userId, newStatus)
    
    if (result.success) {
      const timestamp = new Date().toISOString()
      
      setUsers(users.map((u) => {
        if (u.id === userId) {
          const updates: any = { ...u, status: newStatus }
          if (newStatus === "verified") {
            updates.verifiedAt = timestamp
          } else if (newStatus === "disabled") {
            updates.disabledAt = timestamp
          }
          return updates
        }
        return u
      }))

      // Update localStorage for current user if they're viewing their own profile
      const currentUserStr = localStorage.getItem('currentUser')
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        if (currentUser.id === userId) {
          currentUser.status = newStatus
          if (newStatus === "verified") {
            currentUser.verifiedAt = timestamp
          } else if (newStatus === "disabled") {
            currentUser.disabledAt = timestamp
          }
          localStorage.setItem('currentUser', JSON.stringify(currentUser))
        }
      }
    }
    
    setProcessingId(null)
  }

  const pendingCount = users.filter((u) => u.status === "pending").length

  return (
    <AdminSidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] px-8 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("admin_token")
              router.push("/admin/login")
            }}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-zinc-500">
                {pendingCount} pending verification{pendingCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/admin/support">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-sm font-medium text-white transition-colors">
                <Mail className="w-4 h-4" />
                Support Messages
              </button>
            </Link>
          </div>

          {/* User List */}
          <div className="space-y-4 w-full">
            {users.map((user) => {
              const status = statusConfig[user.status]
              const StatusIcon = status.icon
              const isProcessing = processingId === user.id

              return (
                <div key={user.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{user.name}</h3>
                        <p className="text-xs text-zinc-400">{user.email}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold", status.bg, status.text)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">ID Uploaded</p>
                      <p className="text-xs text-white">
                        {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Verified On</p>
                      <p className="text-xs text-white">
                        {user.status === "verified" && user.verifiedAt 
                          ? new Date(user.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                        {user.status === "disabled" ? "Disabled On" : "Status Date"}
                      </p>
                      <p className="text-xs text-white">
                        {user.status === "disabled" && user.disabledAt
                          ? new Date(user.disabledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setViewingId(user.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View ID
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {user.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateUserStatusHandler(user.id, "verified")}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <><Check className="w-3.5 h-3.5" /> Approve</>
                            )}
                          </button>
                          <button
                            onClick={() => updateUserStatusHandler(user.id, "rejected")}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {user.status !== "disabled" && user.status !== "pending" && (
                        <button
                          onClick={() => updateUserStatusHandler(user.id, "disabled")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Disable
                        </button>
                      )}
                      {user.status === "disabled" && (
                        <button
                          onClick={() => updateUserStatusHandler(user.id, "verified")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Enable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ID Viewing Modal */}
      {viewingId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setViewingId(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Government ID</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  {users.find(u => u.id === viewingId)?.name} • {users.find(u => u.id === viewingId)?.email}
                </p>
              </div>
              <button
                onClick={() => setViewingId(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {users.find(u => u.id === viewingId)?.documentUrl && 
             users.find(u => u.id === viewingId)?.documentUrl !== '#' ? (
              <div className="bg-zinc-800 rounded-xl overflow-hidden">
                <img 
                  src={users.find(u => u.id === viewingId)?.documentUrl} 
                  alt="Government ID" 
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="bg-zinc-800 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm mb-2">No ID Document Uploaded</p>
                <p className="text-xs text-zinc-500">
                  The user has not uploaded their government ID yet.
                </p>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-zinc-500 mb-1">Uploaded On</p>
                  <p className="text-white">
                    {users.find(u => u.id === viewingId)?.submittedAt 
                      ? new Date(users.find(u => u.id === viewingId)!.submittedAt!).toLocaleString("en-US", { 
                          month: "short", 
                          day: "numeric", 
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Status</p>
                  <p className="text-white capitalize">{users.find(u => u.id === viewingId)?.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebarLayout>
  )
}
