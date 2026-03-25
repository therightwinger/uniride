"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Check, X, Eye, Calendar, AlertTriangle } from "lucide-react"
import { AdminSidebarLayout } from "@/components/admin-sidebar-layout"
import { cn } from "@/lib/utils"
import { getPendingVerifications, updateUserStatus } from "@/lib/firebase-admin"

export default function ApprovalsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    const user = userStr ? JSON.parse(userStr) : null
    
    if (user?.role !== "admin") {
      router.push("/rides")
    } else {
      setIsAuthorized(true)
      fetchPendingUsers()
    }
  }, [router])

  const fetchPendingUsers = async () => {
    const result = await getPendingVerifications()
    if (result.success) {
      setUsers(result.users)
    }
  }

  const handleApprove = async (userId: string) => {
    setProcessingId(userId)
    const result = await updateUserStatus(userId, "verified")
    
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId))
      
      // Update localStorage if it's the current user
      const currentUserStr = localStorage.getItem("currentUser")
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        if (currentUser.id === userId) {
          currentUser.status = "verified"
          localStorage.setItem("currentUser", JSON.stringify(currentUser))
        }
      }
    } else {
      alert("Failed to approve user: " + result.error)
    }
    
    setProcessingId(null)
  }

  const handleReject = async (userId: string) => {
    setProcessingId(userId)
    const result = await updateUserStatus(userId, "rejected", rejectionReason)
    
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId))
      
      // Update localStorage if it's the current user
      const currentUserStr = localStorage.getItem("currentUser")
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        if (currentUser.id === userId) {
          currentUser.status = "rejected"
          localStorage.setItem("currentUser", JSON.stringify(currentUser))
        }
      }
      
      setRejectingUserId(null)
      setRejectionReason("")
    } else {
      alert("Failed to reject user: " + result.error)
    }
    
    setProcessingId(null)
  }

  const openRejectDialog = (userId: string) => {
    setRejectingUserId(userId)
    setRejectionReason("")
  }

  const closeRejectDialog = () => {
    setRejectingUserId(null)
    setRejectionReason("")
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <AdminSidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">ID Approvals</h1>
            <p className="text-zinc-400">Review and approve government ID submissions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-zinc-500">Pending Review</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Users */}
          {users.length === 0 ? (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
              <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-sm text-zinc-400">No pending ID verifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{user.name}</h3>
                        <p className="text-sm text-zinc-400">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-zinc-500 mt-0.5">📱 {user.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* ID Type Badge */}
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold",
                      user.idType === "license" 
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-zinc-700 text-zinc-300 border border-zinc-600"
                    )}>
                      {user.idType === "license" ? "🚗 Driver's License" : "🆔 Government ID"}
                    </div>
                  </div>

                  {/* Submission Date */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "Recently"}
                  </div>

                  {/* ID Image */}
                  {user.govIdImage && (
                    <div className="mb-4">
                      <button
                        onClick={() => setViewingId(viewingId === user.id ? null : user.id)}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2"
                      >
                        <Eye className="w-4 h-4" />
                        {viewingId === user.id ? "Hide" : "View"} Government ID
                      </button>
                      
                      {viewingId === user.id && (
                        <div className="bg-zinc-800 border border-white/5 rounded-xl p-4">
                          <img 
                            src={user.govIdImage} 
                            alt="Government ID" 
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={processingId === user.id}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === user.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => openRejectDialog(user.id)}
                      disabled={processingId === user.id}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejection Dialog */}
        {rejectingUserId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-2">Reject ID Verification</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Please provide a reason for rejection. The user will be notified.
              </p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setRejectionReason("ID image is not clear. Please upload a high-quality photo.")}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    rejectionReason === "ID image is not clear. Please upload a high-quality photo."
                      ? "bg-blue-500/20 border-blue-500 text-white"
                      : "bg-zinc-800 border-white/5 text-zinc-300 hover:border-white/10"
                  )}
                >
                  📷 Image not clear
                </button>
                <button
                  onClick={() => setRejectionReason("ID document is not fully visible. Please ensure all corners are shown.")}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    rejectionReason === "ID document is not fully visible. Please ensure all corners are shown."
                      ? "bg-blue-500/20 border-blue-500 text-white"
                      : "bg-zinc-800 border-white/5 text-zinc-300 hover:border-white/10"
                  )}
                >
                  🔲 Document not fully visible
                </button>
                <button
                  onClick={() => setRejectionReason("ID appears to be expired. Please upload a valid government ID.")}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    rejectionReason === "ID appears to be expired. Please upload a valid government ID."
                      ? "bg-blue-500/20 border-blue-500 text-white"
                      : "bg-zinc-800 border-white/5 text-zinc-300 hover:border-white/10"
                  )}
                >
                  ⏰ ID expired
                </button>
                <button
                  onClick={() => setRejectionReason("ID type not accepted. Please upload a government-issued photo ID.")}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    rejectionReason === "ID type not accepted. Please upload a government-issued photo ID."
                      ? "bg-blue-500/20 border-blue-500 text-white"
                      : "bg-zinc-800 border-white/5 text-zinc-300 hover:border-white/10"
                  )}
                >
                  ❌ Invalid ID type
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Or write a custom reason:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeRejectDialog}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(rejectingUserId)}
                  disabled={!rejectionReason.trim() || processingId === rejectingUserId}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId === rejectingUserId ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Reject & Notify
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  )
}
