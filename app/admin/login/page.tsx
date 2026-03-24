"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    if (password === "admin123") {
      localStorage.setItem("admin_token", "true")
      router.push("/admin")
    } else {
      setError("Invalid admin passcode")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/5">
          
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Admin Portal
              </span>
            </div>
            <h1 className="text-lg font-semibold text-zinc-300">
              Restricted Access
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="password" 
                className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 pl-1"
              >
                ADMIN PASSCODE
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 px-1 py-3 text-white placeholder:text-zinc-700 outline-none focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-2 pl-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
