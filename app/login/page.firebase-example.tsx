// EXAMPLE: Updated login page using Firebase
// To use this: rename to page.tsx (backup the old one first)

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { signInUser } from "@/lib/firebase-auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signInUser(email, password)
      
      if (result.success && result.user) {
        // Store user in localStorage for compatibility with existing code
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        
        // Redirect based on role
        if (result.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/rides")
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
        <p className="text-sm text-zinc-500 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b border-white/8 pb-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          <div className="border-b border-white/8 pb-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-white font-semibold text-sm transition-all mt-4 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">Create one</Link>
        </p>
      </div>
    </div>
  )
}
