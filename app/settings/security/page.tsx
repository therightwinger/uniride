"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Monitor, Smartphone, Tablet, X } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { changePassword } from "@/lib/firebase-auth"

export default function SecuritySettingsPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [showLogoutModal, setShowLogoutModal] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setTwoFactorEnabled(user.twoFactorEnabled || false)
      setSessions(user.sessions || [
        { id: "current", device: "Current Device", location: "Current Location", icon: "Monitor", current: true }
      ])
    }
  }, [])

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      })
      return
    }

    if (passwordData.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      })
      return
    }

    if (!passwordData.current) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive"
      })
      return
    }

    const result = await changePassword(passwordData.current, passwordData.new)
    
    if (result.success) {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      })
      
      setPasswordData({ current: "", new: "", confirm: "" })
      setShowPasswordForm(false)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to change password",
        variant: "destructive"
      })
    }
  }

  const handleToggle2FA = () => {
    const newValue = !twoFactorEnabled
    setTwoFactorEnabled(newValue)
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.twoFactorEnabled = newValue
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: newValue ? "2FA enabled" : "2FA disabled",
      description: newValue 
        ? "Two-factor authentication is now active" 
        : "Two-factor authentication has been turned off"
    })
  }

  const handleLogoutSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.sessions = sessions.filter(s => s.id !== sessionId)
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: "Session ended",
      description: "Device has been logged out successfully"
    })
    setShowLogoutModal(null)
  }

  const handleLogoutAll = () => {
    setSessions(prev => prev.filter(s => s.current))
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.sessions = sessions.filter(s => s.current)
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: "All sessions ended",
      description: "You've been logged out from all devices"
    })
    setShowLogoutModal(null)
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Smartphone": return Smartphone
      case "Tablet": return Tablet
      default: return Monitor
    }
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

        <h1 className="text-2xl font-bold mb-8">Security Settings</h1>

        {/* Change Password */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-sm font-medium transition-colors"
            >
              Update Password
            </button>
          ) : (
            <div className="space-y-4 bg-zinc-900 border border-white/5 rounded-xl p-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors"
                >
                  Save Password
                </button>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
              <p className="text-sm text-zinc-400 mt-1">Add an extra layer of security</p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                twoFactorEnabled ? "bg-blue-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Sessions</h2>
            {sessions.filter(s => !s.current).length > 0 && (
              <button
                onClick={() => setShowLogoutModal("all")}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Logout All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {sessions.map((session) => {
              const Icon = getIcon(session.icon)
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs text-emerald-400">(Current)</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500">{session.location}</p>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => setShowLogoutModal(session.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>
            <p className="text-sm text-zinc-400 mb-6">
              {showLogoutModal === "all"
                ? "Are you sure you want to log out from all devices?"
                : "Are you sure you want to end this session?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => showLogoutModal === "all" ? handleLogoutAll() : handleLogoutSession(showLogoutModal)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(null)}
                className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
