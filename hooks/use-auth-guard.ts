"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Redirect unauthenticated users to /login.
 * Call this at the top of any protected page component.
 */
export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.replace("/login")
    }
  }, [router])
}
