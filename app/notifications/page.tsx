"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, AlertCircle, CheckCircle, XCircle, Calendar } from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from "@/lib/firebase-notifications"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/login")
      return
    }
    
    const user = JSON.parse(userStr)
    setCurrentUser(user)
    fetchNotifications(user.id)
  }, [router])

  const fetchNotifications = async (userId: string) => {
    setLoading(true)
    const result = await getUserNotifications(userId)
    if (result.success) {
      setNotifications(result.notifications)
    }
    setLoading(false)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return
    await markAllNotificationsAsRead(currentUser.id)
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && notification.id) {
      handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "id_approved":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case "id_rejected":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "ride_booked":
        return <Calendar className="w-5 h-5 text-blue-400" />
      case "ride_cancelled":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <Bell className="w-5 h-5 text-zinc-400" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
            <p className="text-zinc-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
              <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-sm text-zinc-400">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "bg-zinc-900 border rounded-xl p-4 transition-all cursor-pointer",
                    notification.read 
                      ? "border-white/5 hover:border-white/10" 
                      : "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50"
                  )}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={cn(
                          "font-semibold text-sm",
                          notification.read ? "text-zinc-300" : "text-white"
                        )}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(notification.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
