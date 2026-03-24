"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Save, Shield, Upload, AlertTriangle } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile, uploadGovernmentId } from "@/lib/firebase-auth"

export default function ProfileSettingsPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingId, setIsUploadingId] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    college: "",
    bio: ""
  })

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || "",
        college: user.college || "",
        bio: user.bio || ""
      })
    }
  }, [])

  const handleSave = async () => {
    if (!currentUser) return
    
    setIsSaving(true)
    
    const result = await updateUserProfile(currentUser.id, {
      name: formData.name,
      phone: formData.phone,
      age: formData.age,
      college: formData.college,
      bio: formData.bio
    })
    
    if (result.success && result.user) {
      // Update localStorage
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      setCurrentUser(result.user)
      
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully."
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update profile",
        variant: "destructive"
      })
    }
    
    setIsSaving(false)
  }

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setIsUploadingId(true)

    const result = await uploadGovernmentId(currentUser.id, file)

    if (result.success) {
      // Update local user status
      const updatedUser = { ...currentUser, status: "pending", submittedAt: new Date().toISOString() }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)

      toast({
        title: "ID uploaded",
        description: "Your government ID has been submitted for verification."
      })
    } else {
      toast({
        title: "Upload failed",
        description: result.error || "Failed to upload ID",
        variant: "destructive"
      })
    }

    setIsUploadingId(false)
  }

  const initials = formData.name
    ?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
        
        {/* No ID Warning */}
        {currentUser && !currentUser.govIdImage && (
          <div className="mb-6 p-4 rounded-xl border bg-red-500/10 border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-sm font-semibold text-red-300">
                Government ID Required
              </p>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              You must upload a government ID to create or join rides
            </p>
            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleIdUpload}
                disabled={isUploadingId}
                className="hidden"
              />
              {isUploadingId ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Government ID
                </>
              )}
            </label>
          </div>
        )}
        
        {/* Verification Status */}
        {currentUser && currentUser.govIdImage && (
          <div className={`mb-6 p-4 rounded-xl border ${
            currentUser.status === "verified" 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : currentUser.status === "pending"
              ? "bg-yellow-500/10 border-yellow-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}>
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${
                currentUser.status === "verified" ? "text-emerald-400" : 
                currentUser.status === "pending" ? "text-yellow-400" : "text-red-400"
              }`} />
              <p className={`text-sm font-semibold ${
                currentUser.status === "verified" ? "text-emerald-300" : 
                currentUser.status === "pending" ? "text-yellow-300" : "text-red-300"
              }`}>
                {currentUser.status === "verified" && "Verified Account"}
                {currentUser.status === "pending" && "Verification Pending"}
                {currentUser.status === "rejected" && "Verification Rejected"}
                {currentUser.status === "disabled" && "Account Disabled"}
              </p>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {currentUser.status === "verified" && "Your government ID has been verified"}
              {currentUser.status === "pending" && "Admin is reviewing your government ID"}
              {currentUser.status === "rejected" && "Please upload a valid government ID"}
              {currentUser.status === "disabled" && "Contact support for assistance"}
            </p>
            {(currentUser.status === "pending" || currentUser.status === "rejected") && (
              <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdUpload}
                  disabled={isUploadingId}
                  className="hidden"
                />
                {isUploadingId ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {currentUser.status === "rejected" ? "Re-upload ID" : "Upload New ID"}
                  </>
                )}
              </label>
            )}
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#0a0a0a] flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          {isEditing && (
            <button className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Change photo
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            />
            {isEditing && (
              <p className="mt-1 text-xs text-zinc-500">Changing email requires verification</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your age"
              min={16}
              max={100}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">College / Organization</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your college or organization"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Bio (Optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
