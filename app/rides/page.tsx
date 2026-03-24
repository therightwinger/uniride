"use client"

import { useState, useEffect } from "react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
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
import { cn } from "@/lib/utils"

export default function RidesDashboard() {
  useAuthGuard()
  const [rides, setRides] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userStatus, setUserStatus] = useState<string>("verified")

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
      const result = await getAvailableRides()
      if (result.success) {
        setRides(result.rides)
      }
    }
    
    fetchRides()
  }, [])

  const filteredRides = rides.filter((ride) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      ride.origin?.toLowerCase().includes(q) ||
      ride.destination?.toLowerCase().includes(q) ||
      ride.pickup?.toLowerCase().includes(q) ||
      ride.dropoff?.toLowerCase().includes(q) ||
      ride.driver?.name?.toLowerCase().includes(q)
    )
  })

  const firstName = currentUser?.name?.split(" ")[0] || "there"
  const isMyRide = (ride: any) => ride.driverId === currentUser?.id

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
            {filteredRides.length === 0 ? (
              <div className="bg-zinc-900 border border-white/5 rounded-xl p-10 text-center">
                <Car className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No rides available. Try a different search.</p>
              </div>
            ) : (
              filteredRides.map((ride) => {
                const mine = isMyRide(ride)
                const origin = ride.pickup || ride.origin || "Origin"
                const destination = ride.dropoff || ride.destination || "Destination"
                const driverInitials = ride.driver?.name
                  ? ride.driver.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "?"

                return (
                  <div
                    key={ride.id}
                    className="bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                  >
                    {/* Origin */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <p className="text-xs text-zinc-400 truncate">{origin}</p>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <p className="text-sm font-semibold text-white truncate">{destination}</p>
                      <div className="ml-auto text-right shrink-0">
                        <p className="text-base font-bold text-white">₹{ride.price}</p>
                        <p className="text-[10px] text-zinc-500">per seat</p>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                      <span>
                        {ride.date ? `${formatShortDate(ride.date)}` : ""}
                        {ride.time ? ` · ${ride.time}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ride.seats} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {ride.driver?.rating ?? "0.0"}
                      </span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", vehicleBadgeClass(ride.vehicleType))}>
                        {vehicleLabel(ride.vehicleType)}
                      </span>
                    </div>

                    {/* Driver + actions */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-[11px] font-bold text-white">
                          {driverInitials}
                        </div>
                        <span className="text-sm text-zinc-300">{ride.driver?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!mine && (
                          <Link href={`/messages?ride=${ride.id}`}>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors">
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chat
                            </button>
                          </Link>
                        )}
                        <Link href={`/rides/${ride.id}`}>
                          <button
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                              mine
                                ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                                : userStatus === "pending"
                                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white"
                            )}
                          >
                            {mine ? "Your Ride" : "Join →"}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </main>
      </div>
    </SidebarLayout>
  )
}
