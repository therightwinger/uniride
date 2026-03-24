"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Shield,
  MessageCircle,
  Users,
  LogOut 
} from "lucide-react"
import { cn } from "@/lib/utils"

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/approvals", icon: Shield, label: "Approvals" },
  { href: "/admin/support", icon: MessageCircle, label: "Support" },
  { href: "/admin/users", icon: Users, label: "All Users" },
]

export function AdminSidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Count pending verifications
    const checkPending = async () => {
      const { getPendingVerifications } = await import("@/lib/firebase-admin")
      const result = await getPendingVerifications()
      if (result.success) {
        setPendingCount(result.users.length)
      }
    }
    checkPending()
  }, [])

  const handleLogout = async () => {
    const { signOut } = await import("@/lib/firebase-auth")
    await signOut()
    localStorage.removeItem("currentUser")
    localStorage.removeItem("admin_token")
    router.push("/")
  }

  return (
    <div className="min-h-[100dvh] flex bg-[#0a0a0a]">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 bg-[#0f0f0f] border-r border-white/5 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 mb-2 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">Admin Panel</span>
            <p className="text-[10px] text-zinc-500">UniRide Management</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3">
          {adminNavItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-red-600/20 text-red-400"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {label === "Approvals" && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
          
          {/* Back to User View */}
          <div className="h-px bg-white/5 my-2 mx-3" />
          <Link
            href="/rides"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-blue-600/10 hover:border-blue-500/20 border border-transparent transition-all"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Back to User View</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-white/5 pt-3">
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
      <div className="flex-1 md:ml-64 min-h-[100dvh]">
        {children}
      </div>
    </div>
  )
}
