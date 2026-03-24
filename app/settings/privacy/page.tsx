"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, AlertTriangle, UserX } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function PrivacySettingsPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [locationSharing, setLocationSharing] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setProfileVisibility(user.profileVisibility || "public")
      setLocationSharing(user.locationSharing !== false)
      setBlockedUsers(user.blockedUsers || [])
    }
  }, [])

  const handleVisibilityChange = (value: string) => {
    setProfileVisibility(value)
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.profileVisibility = value
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: "Privacy updated",
      description: `Profile visibility set to ${value}`
    })
  }

  const handleLocationToggle = () => {
    const newValue = !locationSharing
    setLocationSharing(newValue)
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.locationSharing = newValue
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: newValue ? "Location sharing enabled" : "Location sharing disabled",
      description: newValue 
        ? "Your location will be visible to matched riders"
        : "Your location will not be shared with other users"
    })
  }

  const handleUnblock = (userId: string, userName: string) => {
    const updatedBlockedUsers = blockedUsers.filter(u => u.id !== userId)
    setBlockedUsers(updatedBlockedUsers)
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.blockedUsers = updatedBlockedUsers
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: "User unblocked",
      description: `${userName} has been unblocked`
    })
  }

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Our team will review your report shortly"
    })
    setShowReportModal(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-8">Privacy & Safety</h1>

        {/* Profile Visibility */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Profile Visibility</h2>
          <div className="space-y-2">
            {["public", "friends", "private"].map((option) => (
              <button
                key={option}
                onClick={() => handleVisibilityChange(option)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  profileVisibility === option
                    ? "bg-blue-600/10 border-blue-600"
                    : "bg-zinc-900 border-white/5 hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold capitalize">{option}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {option === "public" && "Anyone can see your profile"}
                      {option === "friends" && "Only your connections can see your profile"}
                      {option === "private" && "Your profile is hidden from others"}
                    </p>
                  </div>
                  {profileVisibility === option && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location Sharing */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Location Sharing</h2>
              <p className="text-sm text-zinc-400 mt-1">Share your location with matched riders</p>
            </div>
            <button
              onClick={handleLocationToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                locationSharing ? "bg-blue-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  locationSharing ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Blocked Users</h2>
          {blockedUsers.length === 0 ? (
            <div className="p-8 rounded-xl bg-zinc-900 border border-white/5 text-center">
              <UserX className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 mb-1">No blocked users</p>
              <p className="text-xs text-zinc-500">Users you block will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-white/5"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id, user.name)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report User */}
        <div>
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full p-4 rounded-xl bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Report a User</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Report User</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">User Email or Name</label>
                <input
                  type="text"
                  placeholder="Enter user identifier"
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Reason</label>
                <select className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-red-500 transition-colors">
                  <option>Inappropriate behavior</option>
                  <option>Harassment</option>
                  <option>Spam</option>
                  <option>Safety concern</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Details</label>
                <textarea
                  rows={4}
                  placeholder="Provide additional details..."
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleReport}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
