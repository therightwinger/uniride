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
  const [idType, setIdType] = useState<"license" | "other">("other")
  
  // Controlled inputs
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
        govIdFile: govIdFile,
        idType: idType
      })

      if (result.success && result.user) {
        // Store user in localStorage for compatibility with existing code
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

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-1">Create Account</h1>
        <p className="text-sm text-zinc-500 mb-8">Join the UniRide community</p>

        <div className="space-y-5">
          {/* Full Name */}
          <div className="border-b border-white/8 pb-3">
            <input
              id="name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-5">
            <div className="border-b border-white/8 pb-3">
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
            <div className="border-b border-white/8 pb-3">
              <input
                id="phone"
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Age + Password */}
          <div className="grid grid-cols-2 gap-5">
            <div className="border-b border-white/8 pb-3">
              <input
                id="age"
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
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Gov ID Upload */}
          <div className="py-4">
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">ID Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIdType("license")}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    idType === "license"
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  🚗 Driver's License
                </button>
                <button
                  type="button"
                  onClick={() => setIdType("other")}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    idType === "other"
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  🆔 Other ID
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {idType === "license" 
                  ? "Upload your driver's license to offer rides in your own vehicle"
                  : "Upload Aadhaar, PAN, or other government ID to join shared rides"}
              </p>
            </div>
            
            <label htmlFor="gov-id" className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center mb-2">
                {fileName
                  ? <Check className="w-5 h-5 text-blue-400" />
                  : <Shield className="w-5 h-5 text-blue-400" />
                }
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">
                {fileName ? fileName : `Upload ${idType === "license" ? "Driver's License" : "Government ID"}`}
              </p>
              <p className="text-xs text-zinc-500">Optional · JPG, PNG, PDF</p>
              <p className="text-xs text-yellow-400 mt-1">⚠️ Required to create or join rides</p>
              {fileName && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFileName(null); setGovIdFile(null) }}
                  className="mt-1 text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
              <input id="gov-id" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" required />
            </label>
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

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
