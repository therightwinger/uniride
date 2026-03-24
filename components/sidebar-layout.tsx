"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Zap, 
  LayoutDashboard, 
  MessageCircle, 
  User, 
  Plus, 
  LogOut,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomNav } from "@/components/bottom-nav"

const navItems = [
  { href: "/rides",        icon: LayoutDashboard, label: "Dashboard" },
  { href: "/messages",     icon: MessageCircle,    label: "Messages" },
  { href: "/profile",      icon: User,             label: "Profile" },
  { href: "/rides/create", icon: Plus,             label: "Create Ride" },
]

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Count conversations with unread messages (last message not from current user)
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) return
    const user = JSON.parse(userStr)
    
    // Check if user is admin
    setIsAdmin(user.role === "admin")
    
    const convs = JSON.parse(localStorage.getItem("conversations") || "[]")
    const unread = convs.filter((c: any) => {
      const last = c.messages?.[c.messages.length - 1]
      return last && last.senderId !== user.id
    }).length
    setUnreadCount(unread)
  }, [])

  const handleLogout = async () => {
    // Sign out from Firebase
    const { signOut } = await import("@/lib/firebase-auth")
    await signOut()
    
    // Clear local storage
    localStorage.removeItem("currentUser")
    
    // Redirect to home
    router.push("/")
  }

  return (
    <div className="min-h-[100dvh] flex bg-[#0a0a0a]">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-52 bg-[#0f0f0f] border-r border-white/5 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">UniRide</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || 
              (href !== "/rides" && pathname.startsWith(href + "/")) ||
              (href === "/rides" && pathname === "/rides")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {label === "Messages" && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Admin Panel Link - Only for Admins */}
          {isAdmin && (
            <>
              <div className="h-px bg-white/5 my-2 mx-3" />
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-red-600/10 hover:border-red-500/20 border border-transparent transition-all"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 w-full transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-52 min-h-[100dvh] pb-20 md:pb-0">
        {children}
      </div>

      {/* Bottom Nav — mobile only */}
      <BottomNav />
    </div>
  )
}
