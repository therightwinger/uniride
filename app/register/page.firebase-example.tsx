// EXAMPLE: Updated register page using Firebase
// To use this: rename to page.tsx (backup the old one first)

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Check, X } from "lucide-react"
import { registerUser } from "@/lib/firebase-auth"

export default function RegisterPage() {
  const router = useRouter()
  const [fileName, setFileName] = useState<string | null>(null)
  const [govIdFile, setGovIdFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [password, setPassword] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setGovIdFile(file)
    }
  }

  const handleSubmit = async () => {
    setError("")
    setIsLoading(true)

    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Name, email, and password are required.")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        setIsLoading(false)
        return
      }

      const result = await registerUser(email, password, {
        name: name.trim(),
        phone: phone.trim(),
        age: age.trim(),
        govIdFile: govIdFile || undefined
      })

      if (result.success && result.user) {
        // Store user in localStorage for compatibility
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        
        // Redirect to rides page
        router.push("/rides")
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "An error occurred")
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

        <h1 className="text-2xl font-bold mb-1">Create Account</h1>
        <p className="text-sm text-zinc-500 mb-8">Join the UniRide community</p>

        <div className="space-y-5">
          <div className="border-b border-white/8 pb-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="border-b border-white/8 pb-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
            <div className="border-b border-white/8 pb-3">
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="border-b border-white/8 pb-3">
              <input
                type="number"
                placeholder="Age"
                min={16}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
            <div className="border-b border-white/8 pb-3">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="py-4">
            <label htmlFor="gov-id" className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center mb-2">
                {fileName
                  ? <Check className="w-5 h-5 text-blue-400" />
                  : <Shield className="w-5 h-5 text-blue-400" />
                }
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">
                {fileName ? fileName : "Upload Government ID"}
              </p>
              <p className="text-xs text-zinc-500">Optional · JPG, PNG, PDF</p>
              {fileName && (
                <button
                  type="button"
                  onClick={(e) => { 
                    e.preventDefault()
                    setFileName(null)
                    setGovIdFile(null)
                  }}
                  className="mt-1 text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
              <input 
                id="gov-id" 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-white font-semibold text-sm transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : "Create Account"}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
