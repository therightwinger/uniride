"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { 
  ChevronRight,
  User,
  Shield,
  Bell,
  Lock,
  Star,
  HelpCircle,
  LogOut,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { uploadGovernmentId } from "@/lib/firebase-auth"
import { useToast } from "@/hooks/use-toast"

const sections = [
  {
    title: "ACCOUNT",
    items: [
      { icon: User,   iconBg: "bg-blue-600",   label: "Profile Settings",      sub: "Personal info, ID status", href: "/settings/profile" },
      { icon: Shield, iconBg: "bg-emerald-600", label: "Security Settings",     sub: "Password, 2FA, sessions", href: "/settings/security" },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      { icon: Bell, iconBg: "bg-yellow-600",  label: "Notification Settings", sub: "Alerts, sounds", href: "/settings/notifications" },
      { icon: Lock, iconBg: "bg-purple-600",  label: "Privacy & Safety",      sub: "Visibility, tracked users", href: "/settings/privacy" },
    ],
  },
  {
    title: "COMMUNITY",
    items: [
      { icon: Star,        iconBg: "bg-orange-500", label: "Ratings & Trust", sub: "Reviews from others", href: "/settings/ratings" },
      { icon: HelpCircle,  iconBg: "bg-cyan-600",   label: "Help & Support",  sub: "FAQ, contact", href: "/settings/support" },
    ],
  },
]

export default function ProfilePage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isUploadingId, setIsUploadingId] = useState(false)
  const [idType, setIdType] = useState<"license" | "other">("other")

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      if (user.idType) {
        setIdType(user.idType)
      }
    }
  }, [])

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setIsUploadingId(true)

    const result = await uploadGovernmentId(currentUser.id, file, idType)

    if (result.success && result.user) {
      // Update local user
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      setCurrentUser(result.user)

      toast({
        title: "✓ ID Uploaded Successfully",
        description: "Your ID has been uploaded and is under verification. You'll be notified once approved.",
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

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await new Promise((r) => setTimeout(r, 600))
    localStorage.removeItem("currentUser")
    setShowLogoutModal(false)
    router.push("/")
  }

  const confirmLogout = () => {
    setShowLogoutModal(true)
  }

  if (!currentUser) return null

  const initials = currentUser.name
    ?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] px-4 md:px-8 py-6 md:py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          {/* User card */}
          <div className="flex items-center gap-4 bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 mb-6 w-full max-w-lg">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-base font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-base">{currentUser.name}</p>
              <p className="text-sm text-zinc-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          {/* Government ID Section */}
          {currentUser.role !== "admin" && (
            <div className="mb-8 w-full">
              {!currentUser.govIdImage ? (
                // No ID uploaded
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-red-300 mb-1">Government ID Required</h3>
                      <p className="text-sm text-zinc-400">
                        Upload your government ID to create or join rides
                      </p>
                    </div>
                  </div>

                  {/* ID Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ID Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIdType("license")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                          idType === "license"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        🚗 Driver's License
                      </button>
                      <button
                        onClick={() => setIdType("other")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                          idType === "other"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        🆔 Other ID
                      </button>
                    </div>
                  </div>

                  {/* Upload Button */}
                  <label className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm cursor-pointer transition-colors">
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
              ) : (
                // ID uploaded - show status
                <div className={`border rounded-2xl p-5 ${
                  currentUser.status === "verified"
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : currentUser.status === "pending"
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : currentUser.status === "rejected"
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-zinc-900 border-white/5"
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      currentUser.status === "verified"
                        ? "bg-emerald-500/20"
                        : currentUser.status === "pending"
                        ? "bg-yellow-500/20"
                        : currentUser.status === "rejected"
                        ? "bg-red-500/20"
                        : "bg-zinc-800"
                    }`}>
                      {currentUser.status === "verified" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      {currentUser.status === "pending" && <Clock className="w-5 h-5 text-yellow-400" />}
                      {currentUser.status === "rejected" && <XCircle className="w-5 h-5 text-red-400" />}
                      {!["verified", "pending", "rejected"].includes(currentUser.status) && <Shield className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-base font-bold mb-1 ${
                        currentUser.status === "verified"
                          ? "text-emerald-300"
                          : currentUser.status === "pending"
                          ? "text-yellow-300"
                          : currentUser.status === "rejected"
                          ? "text-red-300"
                          : "text-white"
                      }`}>
                        {currentUser.status === "verified" && "✓ ID Verified"}
                        {currentUser.status === "pending" && "⏳ ID Under Verification"}
                        {currentUser.status === "rejected" && "✗ ID Rejected"}
                        {currentUser.status === "disabled" && "🚫 Account Disabled"}
                        {!["verified", "pending", "rejected", "disabled"].includes(currentUser.status) && "Government ID Uploaded"}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {currentUser.status === "verified" && "Your government ID has been verified by admin"}
                        {currentUser.status === "pending" && "Your ID has been uploaded and is under verification by admin"}
                        {currentUser.status === "rejected" && "Your ID was rejected. Please upload a valid government ID"}
                        {currentUser.status === "disabled" && "Your account has been disabled. Contact support for assistance"}
                        {!["verified", "pending", "rejected", "disabled"].includes(currentUser.status) && "Your ID is being reviewed by admin"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        ID Type: {currentUser.idType === "license" ? "🚗 Driver's License" : "🆔 Government ID"}
                      </p>
                    </div>
                  </div>

                  {/* Re-upload option for rejected or pending */}
                  {(currentUser.status === "rejected" || currentUser.status === "pending") && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Change ID Type</label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setIdType("license")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                              idType === "license"
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            }`}
                          >
                            🚗 Driver's License
                          </button>
                          <button
                            onClick={() => setIdType("other")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                              idType === "other"
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            }`}
                          >
                            🆔 Other ID
                          </button>
                        </div>
                      </div>
                      <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm cursor-pointer transition-colors">
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
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grouped settings */}
          <div className="space-y-8 w-full">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2 px-1">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(({ icon: Icon, iconBg, label, sub, href }) => (
                  <button
                    key={label}
                    onClick={() => router.push(href)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-zinc-900 transition-all group text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-zinc-500">{sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

          {/* Log Out */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={confirmLogout}
              disabled={isSigningOut}
              className="flex items-center gap-3 px-2 py-3 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50"
            >
              {isSigningOut ? (
                <span className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Log Out
            </button>

            {/* Dark mode toggle placeholder / button as per screenshot */}
            <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Log Out</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSigningOut ? "Logging out..." : "Yes, Log Out"}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isSigningOut}
                className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
