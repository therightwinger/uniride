"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, Eye, EyeOff, ArrowLeft, X } from "lucide-react"
import { signInUser, sendPasswordReset } from "@/lib/firebase-auth"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState("")

  const handleSubmit = async () => {
    setError("")
    setIsLoading(true)

    try {
      if (!email.trim() || !password.trim()) {
        setError("Please enter your email and password.")
        setIsLoading(false)
        return
      }

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

  const handlePasswordReset = async () => {
    setResetError("")
    setResetSuccess(false)
    
    if (!resetEmail.trim()) {
      setResetError("Please enter your email address")
      return
    }

    setResetLoading(true)
    const result = await sendPasswordReset(resetEmail)
    setResetLoading(false)

    if (result.success) {
      setResetSuccess(true)
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetSuccess(false)
        setResetEmail("")
      }, 3000)
    } else {
      setResetError(result.error || "Failed to send reset email")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Logo + heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
        </div>
        <p className="text-sm text-zinc-500 mb-9 ml-[52px]">Sign in to continue your journey</p>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 border-b border-white/8 pb-3">
            <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 border-b border-white/8 pb-3">
            <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResetEmail(email)
                setShowForgotPassword(true)
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* Submit */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-white font-semibold text-sm transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">Sign up</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => {
                setShowForgotPassword(false)
                setResetError("")
                setResetSuccess(false)
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {resetSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-emerald-400">
                  ✓ Password reset email sent! Check your inbox.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border border-white/10 rounded-xl px-4 py-3 mb-4">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordReset()}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                  />
                </div>

                {resetError && (
                  <p className="text-red-400 text-xs mb-4">{resetError}</p>
                )}

                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {resetLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Reset Link"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
