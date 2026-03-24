"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function NotificationSettingsPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  
  const [settings, setSettings] = useState({
    rideUpdates: true,
    messages: true,
    appAnnouncements: false,
    emailNotifications: true,
    soundAlerts: true
  })

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.notificationSettings) {
        setSettings(user.notificationSettings)
      }
    }
  }, [])

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.notificationSettings = newSettings
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
    
    toast({
      title: "Preferences saved",
      description: "Your notification settings have been updated"
    })
  }

  const notificationOptions = [
    {
      key: "rideUpdates" as const,
      title: "Ride Updates",
      description: "Get notified about ride confirmations, cancellations, and changes"
    },
    {
      key: "messages" as const,
      title: "Messages",
      description: "Receive alerts when you get new messages from other users"
    },
    {
      key: "appAnnouncements" as const,
      title: "App Announcements",
      description: "Stay updated with new features and important updates"
    },
    {
      key: "emailNotifications" as const,
      title: "Email Notifications",
      description: "Receive notifications via email"
    },
    {
      key: "soundAlerts" as const,
      title: "Sound Alerts",
      description: "Play sounds for incoming notifications"
    }
  ]

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

        <h1 className="text-2xl font-bold mb-2">Notification Settings</h1>
        <p className="text-sm text-zinc-400 mb-8">Manage how you receive notifications</p>

        {/* Notification Options */}
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-start justify-between p-4 rounded-xl bg-zinc-900 border border-white/5"
            >
              <div className="flex-1 pr-4">
                <h3 className="text-sm font-semibold text-white mb-1">{option.title}</h3>
                <p className="text-xs text-zinc-400">{option.description}</p>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                  settings[option.key] ? "bg-blue-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings[option.key] ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
