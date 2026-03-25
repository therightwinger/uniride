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
  const [idType, setIdType] = useState<"license" | "other">("other")
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
      setIdType(user.idType || "other")
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

    const result = await uploadGovernmentId(currentUser.id, file, idType)

    if (result.success) {
      // Update local user status
      const updatedUser = { 
        ...currentUser, 
        status: "pending", 
        idType: idType,
        submittedAt: new Date().toISOString() 
      }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)

      toast({
        title: "ID uploaded",
        description: `Your ${idType === "license" ? "driver's license" : "government ID"} has been submitted for verification.`
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
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-sm font-semibold text-red-300">
                Government ID Required
              </p>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              You must upload a government ID to create or join rides
            </p>
            
            {/* ID Type Selection */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                ID Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIdType("license")}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    idType === "license"
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  🚗 Driver's License
                </button>
                <button
                  type="button"
                  onClick={() => setIdType("other")}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    idType === "other"
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  🆔 Government ID
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {idType === "license" 
                  ? "Upload your driver's license to offer rides in your own vehicle"
                  : "Upload any government-issued photo ID (Aadhaar, PAN, Passport, etc.)"}
              </p>
            </div>
            
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold cursor-pointer transition-colors">
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
                  Upload {idType === "license" ? "Driver's License" : "Government ID"}
                </>
              )}
            </label>
          </div>
        )}
        
        {/* Verification Status */}
        {currentUser && currentUser.govIdImage && (
          <>
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
                  {currentUser.status === "verified" && `Verified ${currentUser.idType === "license" ? "Driver's License" : "Government ID"}`}
                  {currentUser.status === "pending" && "Verification Pending"}
                  {currentUser.status === "rejected" && "Verification Rejected"}
                  {currentUser.status === "disabled" && "Account Disabled"}
                </p>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {currentUser.status === "verified" && `Your ${currentUser.idType === "license" ? "driver's license" : "government ID"} has been verified`}
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

            {/* Upgrade to Driver's License */}
            {currentUser.status === "verified" && currentUser.idType !== "license" && !currentUser.licenseImage && (
              <div className="mb-6 p-4 rounded-xl border bg-blue-500/10 border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🚗</span>
                  <p className="text-sm font-semibold text-blue-300">
                    Want to offer rides in your own vehicle?
                  </p>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Upload your driver's license to unlock the ability to create rides using your own vehicle. You'll still be able to use shared cab rides while your license is being verified.
                </p>
                
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      setIdType("license")
                      handleIdUpload(e)
                    }}
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
                      Upload Driver's License
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Driver's License Verification Status */}
            {currentUser.licenseImage && (
              <div className={`mb-6 p-4 rounded-xl border ${
                currentUser.licenseStatus === "verified" 
                  ? "bg-emerald-500/10 border-emerald-500/20" 
                  : currentUser.licenseStatus === "pending"
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚗</span>
                  <p className={`text-sm font-semibold ${
                    currentUser.licenseStatus === "verified" ? "text-emerald-300" : 
                    currentUser.licenseStatus === "pending" ? "text-yellow-300" : "text-red-300"
                  }`}>
                    Driver's License {currentUser.licenseStatus === "verified" ? "Verified" : 
                    currentUser.licenseStatus === "pending" ? "Under Review" : "Rejected"}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {currentUser.licenseStatus === "verified" && "You can now create rides using your own vehicle"}
                  {currentUser.licenseStatus === "pending" && "Your driver's license is being reviewed. You can still use shared cab rides."}
                  {currentUser.licenseStatus === "rejected" && "Please upload a valid driver's license"}
                </p>
                {currentUser.licenseStatus === "rejected" && (
                  <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        setIdType("license")
                        handleIdUpload(e)
                      }}
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
                        Re-upload Driver's License
                      </>
                    )}
                  </label>
                )}
              </div>
            )}
          </>
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
