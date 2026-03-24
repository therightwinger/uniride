"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Shield, Check, X, Ban, UserCheck } from "lucide-react"
import { AdminSidebarLayout } from "@/components/admin-sidebar-layout"
import { cn } from "@/lib/utils"
import { getAllUsers, updateUserStatus } from "@/lib/firebase-admin"

export default function AllUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    const user = userStr ? JSON.parse(userStr) : null
    
    if (user?.role !== "admin") {
      router.push("/rides")
    } else {
      setIsAuthorized(true)
      fetchAllUsers()
    }
  }, [router])

  const fetchAllUsers = async () => {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success) {
      setUsers(result.users)
    }
    setLoading(false)
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setProcessingId(userId)
    const result = await updateUserStatus(userId, newStatus)
    
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      
      // Update localStorage if it's the current user
      const currentUserStr = localStorage.getItem("currentUser")
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        if (currentUser.id === userId) {
          currentUser.status = newStatus
          localStorage.setItem("currentUser", JSON.stringify(currentUser))
        }
      }
    } else {
      alert("Failed to update user status: " + result.error)
    }
    
    setProcessingId(null)
  }

  if (!isAuthorized) {
    return null
  }

  const stats = {
    total: users.length,
    verified: users.filter(u => u.status === "verified").length,
    pending: users.filter(u => u.status === "pending").length,
    disabled: users.filter(u => u.status === "disabled").length,
  }

  return (
    <AdminSidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">All Users</h1>
            <p className="text-zinc-400">Manage all registered users</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-zinc-500">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                  <p className="text-xs text-zinc-500">Verified</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-zinc-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.disabled}</p>
                  <p className="text-xs text-zinc-500">Disabled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-sm text-zinc-400">No registered users yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                          {user.role === "admin" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 truncate">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-zinc-500 mt-0.5">📱 {user.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
                        user.status === "verified" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                        user.status === "pending" && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                        user.status === "rejected" && "bg-red-500/20 text-red-400 border border-red-500/30",
                        user.status === "disabled" && "bg-zinc-700 text-zinc-400 border border-zinc-600"
                      )}>
                        {user.status === "verified" && "✓ Verified"}
                        {user.status === "pending" && "⏳ Pending"}
                        {user.status === "rejected" && "✗ Rejected"}
                        {user.status === "disabled" && "🚫 Disabled"}
                      </div>

                      {/* Action Buttons */}
                      {user.role !== "admin" && (
                        <div className="flex gap-2">
                          {user.status !== "verified" && (
                            <button
                              onClick={() => handleStatusChange(user.id, "verified")}
                              disabled={processingId === user.id}
                              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Verify User"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {user.status !== "disabled" && (
                            <button
                              onClick={() => handleStatusChange(user.id, "disabled")}
                              disabled={processingId === user.id}
                              className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Disable User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {user.status === "disabled" && (
                            <button
                              onClick={() => handleStatusChange(user.id, "verified")}
                              disabled={processingId === user.id}
                              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Enable User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-zinc-500 mb-1">ID Type</p>
                      <p className="text-white font-medium">
                        {user.idType === "license" ? "🚗 Driver's License" : user.govIdImage ? "🆔 Government ID" : "❌ Not Uploaded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Rating</p>
                      <p className="text-white font-medium">⭐ {user.rating?.toFixed(1) || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Total Rides</p>
                      <p className="text-white font-medium">{user.totalRides || 0}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Joined</p>
                      <p className="text-white font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  )
}
