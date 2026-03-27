"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, MessageCircle, User, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/rides", icon: Home, label: "Home" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/messages", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) return
    const user = JSON.parse(userStr)

    // Fetch unread notifications count
    const fetchNotificationCount = async () => {
      const { getUnreadNotificationCount } = await import("@/lib/firebase-notifications")
      const result = await getUnreadNotificationCount(user.id)
      if (result.success) {
        setUnreadNotifications(result.count)
      }
    }
    fetchNotificationCount()
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      fetchNotificationCount()
    }
    
    window.addEventListener('notificationsUpdated', handleNotificationUpdate)
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000)
    
    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationUpdate)
      clearInterval(interval)
    }
  }, [pathname])

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          const showBadge = item.href === "/notifications" && unreadNotifications > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all min-w-[60px] relative",
                isActive
                  ? "text-blue-500"
                  : "text-zinc-500 hover:text-white"
              )}
              aria-label={item.label}
            >
              <Icon className={cn("w-6 h-6", isActive && "text-blue-500")} />
              {showBadge && (
                <span className="absolute top-1 right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
