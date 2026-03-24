"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/rides", icon: Home, label: "Home" },
  { href: "/rides/create", icon: Plus, label: "Post" },
  { href: "/messages", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all min-w-[60px]",
                isActive
                  ? "text-blue-500"
                  : "text-zinc-500 hover:text-white"
              )}
              aria-label={item.label}
            >
              <Icon className={cn("w-6 h-6", isActive && "text-blue-500")} />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
