"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import { formatShortDate } from "@/lib/date-utils"
import { getAvailableRides } from "@/lib/firebase-rides"
import { 
  Search,
  Plus,
  MapPin,
  TrendingUp,
  Star,
  MessageCircle,
  Settings,
  AlertTriangle,
  Users,
  Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarLayout } from "@/components/sidebar-layout"
import { RideCardSkeleton } from "@/components/skeletons"
import { RideCard } from "@/components/ride-card"
import { cn } from "@/lib/utils"

export default function RidesDashboard() {
  useAuthGuard()
  const [rides, setRides] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [userStatus, setUserStatus] = useState<string>("verified")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      setUserStatus(user.status || "verified")
    } else {
      setUserStatus("pending")
    }
    
    // Fetch rides from Firebase
    const fetchRides = async () => {
      setLoading(true)
      const result = await getAvailableRides()
      if (result.success) {
        setRides(result.rides)
      }
      setLoading(false)
    }
    
    fetchRides()
  }, [])

  const filteredRides = useMemo(() => {
    if (!debouncedSearch) return rides
    const q = debouncedSearch.toLowerCase()
    return rides.filter((ride) => 
      ride.origin?.toLowerCase().includes(q) ||
      ride.destination?.toLowerCase().includes(q) ||
      ride.pickup?.toLowerCase().includes(q) ||
      ride.dropoff?.toLowerCase().includes(q) ||
      ride.driver?.name?.toLowerCase().includes(q)
    )
  }, [rides, debouncedSearch])

  const firstName = useMemo(() => 
    currentUser?.name?.split(" ")[0] || "there",
    [currentUser]
  )

  const isMyRide = useCallback((ride: any) => 
    ride.driverId === currentUser?.id,
    [currentUser]
  )

  const vehicleLabel = (type: string) => {
    const labels: Record<string, string> = {
      sedan: "Sedan",
      suv: "SUV",
      hatchback: "Hatchback",
      minivan: "Minivan",
      "personal vehicle": "Personal Vehicle",
      "shared cab": "Shared Cab",
    }
    return labels[type?.toLowerCase()] || type || "Vehicle"
  }

  const vehicleBadgeClass = (type: string) => {
    const t = type?.toLowerCase()
    if (t?.includes("cab") || t?.includes("shared")) return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <main className="max-w-3xl mx-auto px-5 py-7">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-zinc-400 mb-0.5">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white">{firstName}</h1>
            </div>
            <Link href="/profile">
              <button className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                <Settings className="w-4 h-4 text-zinc-400" />
              </button>
            </Link>
          </div>

          {/* Verification banner - hide for admins */}
          {userStatus === "pending" && currentUser?.role !== "admin" && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-4 mb-5">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-300">Verification Pending</p>
                <p className="text-yellow-400/80">
                  Admin is reviewing your ID. You cannot create or{" "}
                  <span className="text-yellow-300">join</span> rides until verified.{" "}
                  <Link href="/profile" className="text-blue-400 hover:underline">Check Status</Link>
                </p>
              </div>
            </div>
          )}

          {/* Create New Ride card */}
          <div className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl px-5 py-4 mb-4">
            <div>
              <p className="font-semibold text-white mb-0.5">Create New Ride</p>
              <p className="text-xs text-zinc-400">Find co-travelers and save money</p>
            </div>
            <Link href="/rides/create">
              <button 
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  userStatus === "pending"
                    ? "bg-zinc-700 cursor-not-allowed"
                    : "bg-zinc-700 hover:bg-blue-600"
                )}
                title={userStatus === "pending" ? "Verify ID to create rides" : "Create a ride"}
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{rides.length}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Nearby Rides</p>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">₹0</p>
              <p className="text-xs text-zinc-400 mt-0.5">Weekly Saved</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search rides by destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Available Rides */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Available Rides ({filteredRides.length})
            </p>
            <Link href="/map" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View Map →
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              // Show skeleton loaders while loading
              <>
                <RideCardSkeleton />
                <RideCardSkeleton />
                <RideCardSkeleton />
              </>
            ) : filteredRides.length === 0 ? (
              <div className="bg-zinc-900 border border-white/5 rounded-xl p-10 text-center">
                <Car className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No rides available. Try a different search.</p>
              </div>
            ) : (
              filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  isMyRide={isMyRide(ride)}
                  userStatus={userStatus}
                  vehicleLabel={vehicleLabel}
                  vehicleBadgeClass={vehicleBadgeClass}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </SidebarLayout>
  )
}
