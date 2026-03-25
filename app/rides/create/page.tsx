"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  IndianRupee,
  Check,
  Search,
  Lock,
  ChevronRight
} from "lucide-react"
import dynamic from "next/dynamic"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { createRide } from "@/lib/firebase-rides"

// Lazy load map — avoids Leaflet blocking the initial compile
const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-800 animate-pulse rounded-xl flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
    </div>
  ),
})

type VehicleType = "sedan" | "suv" | "hatchback" | "minivan"

const vehicleTypes: { id: VehicleType; label: string; icon: string }[] = [
  { id: "sedan",    label: "Sedan",    icon: "🚗" },
  { id: "suv",      label: "SUV",      icon: "🚙" },
  { id: "hatchback",label: "Hatchback",icon: "🚘" },
  { id: "minivan",  label: "Minivan",  icon: "🚐" },
]

const steps = [
  { id: 1, label: "Route",   icon: MapPin },
  { id: 2, label: "Details", icon: Calendar },
  { id: 3, label: "Pricing", icon: IndianRupee },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/50 transition-colors"

export default function CreateRidePage() {
  useAuthGuard()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [userStatus, setUserStatus] = useState<string | null>(null)

  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]) // India center
  const [mounted, setMounted] = useState(false)
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectingMode, setSelectingMode] = useState<"pickup" | "dropoff">("pickup")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [seats, setSeats] = useState("3")
  const [vehicleType, setVehicleType] = useState<VehicleType>("sedan")
  const [notes, setNotes] = useState("")
  const [price, setPrice] = useState("")
  const [rideType, setRideType] = useState<"own" | "shared">("shared")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionType, setActiveSuggestionType] = useState<"pickup" | "dropoff" | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      // Admins bypass verification checks
      if (user.role === "admin") {
        setUserStatus("verified")
      } else if (!user.govIdImage) {
        // No ID uploaded - block access
        setUserStatus("no-id")
      } else {
        setUserStatus(user.status || "pending")
      }
    } else {
      setUserStatus("pending")
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  const canProceed = () => {
    if (currentStep === 1) return pickupCoords && dropoffCoords
    if (currentStep === 2) return date && time && seats
    if (currentStep === 3) return price
    return false
  }

  const handleGeocode = async (query: string, type: "pickup" | "dropoff") => {
    if (!query.trim()) {
      alert("Please enter a location to search")
      return
    }
    setIsSearching(true)
    try {
      // Add "India" to the search query for better results
      const searchQuery = query.includes("India") ? query : `${query}, India`
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `countrycodes=in&` +
        `limit=5&` +
        `addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UniRide-App'
          }
        }
      )
      const data = await res.json()
      
      if (data?.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        
        // Use the original search query as the name, or extract a meaningful name from the result
        let name = query.trim()
        
        // If the query is very short (like just a city name), use the extracted location
        if (query.trim().length <= 15 && result.address) {
          name = result.address?.city || 
                 result.address?.town || 
                 result.address?.village || 
                 result.address?.suburb ||
                 result.address?.neighbourhood ||
                 query.trim()
        }
        
        setMapCenter([lat, lng])
        if (type === "pickup") {
          setPickupCoords({ lat, lng })
          setPickup(name)
          setSelectingMode("dropoff")
        } else {
          setDropoffCoords({ lat, lng })
          setDropoff(name)
        }
        setShowSuggestions(false)
        setSuggestions([])
      } else {
        alert("Location not found in India. Try:\n• City names (Chennai, Mumbai, Delhi)\n• Landmarks (Gateway of India)\n• Areas (Connaught Place)\n\nOr tap the map to select manually.")
      }
    } catch (error: any) {
      console.error("Geocoding error:", error)
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        alert("Search timed out. Please tap the map to select your location.")
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        alert("Search unavailable. Please tap the map to select your location.")
      } else {
        alert("Search failed. Please tap the map to select your location.")
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = async (query: string, type: "pickup" | "dropoff") => {
    if (type === "pickup") {
      setPickup(query)
    } else {
      setDropoff(query)
    }

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setActiveSuggestionType(type)
    
    // Debounce: wait 500ms after user stops typing
    const timeout = setTimeout(async () => {
      try {
        // Better search query construction
        const searchQuery = `${query}, India`
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `countrycodes=in&` +
          `limit=10&` +
          `addressdetails=1&` +
          `dedupe=1`,
          {
            headers: {
              'User-Agent': 'UniRide-App',
              'Accept-Language': 'en'
            },
            signal: AbortSignal.timeout(5000)
          }
        ).catch(() => null) // Fail silently
        
        if (!res || !res.ok) {
          // Silently fail - user can still use map click or search button
          setSuggestions([])
          setShowSuggestions(false)
          return
        }
        
        const data = await res.json().catch(() => null)
        
        if (data?.length > 0) {
          setSuggestions(data)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error: any) {
        // Silently fail autocomplete - user can still click map or use search button
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 500) // Wait 500ms after user stops typing
    
    setSearchTimeout(timeout)
  }

  const handleSelectSuggestion = (suggestion: any, type: "pickup" | "dropoff") => {
    const lat = parseFloat(suggestion.lat)
    const lng = parseFloat(suggestion.lon)
    
    // Extract a clean name
    const name = suggestion.name || 
                 suggestion.address?.city || 
                 suggestion.address?.town || 
                 suggestion.address?.village ||
                 suggestion.address?.suburb ||
                 suggestion.display_name.split(",")[0]
    
    setMapCenter([lat, lng])
    if (type === "pickup") {
      setPickupCoords({ lat, lng })
      setPickup(name)
      setSelectingMode("dropoff")
    } else {
      setDropoffCoords({ lat, lng })
      setDropoff(name)
    }
    
    setShowSuggestions(false)
    setSuggestions([])
    setActiveSuggestionType(null)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const userStr = localStorage.getItem("currentUser")
    const user = userStr ? JSON.parse(userStr) : null
    
    const newRide = {
      driverId: user?.id || "unknown",
      driver: { 
        name: user?.name || "Driver", 
        rating: user?.rating || 4.8, 
        ratingCount: 0, 
        verified: user?.status === "verified" 
      },
      pickup, 
      dropoff, 
      origin: pickup, 
      destination: dropoff,
      pickupCoords: pickupCoords!,
      dropoffCoords: dropoffCoords!,
      date, 
      time,
      seats: Number(seats), 
      seatsLeft: Number(seats),
      price: Number(price),
      vehicleType,
      rideType,
      notes,
      passengers: [],
      createdAt: new Date().toISOString(),
    }
    
    const result = await createRide(newRide)
    
    if (result.success) {
      router.push("/rides")
    } else {
      alert("Failed to create ride: " + result.error)
    }
    
    setIsLoading(false)
  }

  /* Lock screen for pending/blocked users */
  if (userStatus === "no-id") {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-red-900/40 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Government ID Required
            </h2>
            <p className="text-sm text-zinc-500 mb-7">
              You must upload a government ID to create rides. Go to your profile settings to upload your ID.
            </p>
            <Link href="/settings/profile">
              <button className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold mb-3 transition-all">
                Upload ID Now
              </button>
            </Link>
            <Link href="/rides">
              <button className="w-full py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm font-semibold hover:bg-zinc-800 transition-all">
                Browse Rides
              </button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (userStatus === "pending" || userStatus === "rejected") {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-zinc-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {userStatus === "pending" ? "Verification Pending" : "Verification Rejected"}
            </h2>
            <p className="text-sm text-zinc-500 mb-7">
              {userStatus === "pending"
                ? "Your ID is under review. You can post rides once verified."
                : "Your verification was rejected. Please contact support."}
            </p>
            <Link href="/rides">
              <button className="w-full py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm font-semibold hover:bg-zinc-800 transition-all">
                Browse Rides
              </button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <Link href="/rides" className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Create New Ride</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Fill in the details to post your ride</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => {
            const done = currentStep > step.id
            const active = currentStep === step.id
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  done  ? "bg-emerald-600/20 text-emerald-400" :
                  active ? "bg-blue-600 text-white" :
                           "bg-zinc-900 text-zinc-500 border border-white/5"
                )}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  {step.label}
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                )}
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <div className="max-w-2xl bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-6">

          {/* Step 1 — Route */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Type to search for locations or tap the map to select. The map shows your currently selected{" "}
                <span className={cn(
                  "font-semibold capitalize",
                  selectingMode === "pickup" ? "text-blue-400" : "text-emerald-400"
                )}>{selectingMode}</span> point.
              </p>

              {/* Map */}
              <div className="w-full h-72 sm:h-96 rounded-xl overflow-hidden border border-white/5 relative">
                <MapView
                  center={mapCenter}
                  zoom={pickupCoords || dropoffCoords ? 12 : 5}
                  locations={[
                    ...(pickupCoords ? [{ lat: pickupCoords.lat, lng: pickupCoords.lng, name: "Pickup" }] : []),
                    ...(dropoffCoords ? [{ lat: dropoffCoords.lat, lng: dropoffCoords.lng, name: "Dropoff" }] : []),
                  ]}
                  interactive
                  onLocationSelect={(loc) => {
                    if (selectingMode === "pickup") {
                      setPickupCoords(loc)
                      setPickup(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
                      setMapCenter([loc.lat, loc.lng])
                      setSelectingMode("dropoff")
                    } else {
                      setDropoffCoords(loc)
                      setDropoff(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
                      setMapCenter([loc.lat, loc.lng])
                    }
                  }}
                />
                {/* Active selection indicator */}
                <div className="absolute top-3 left-3 bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold z-10">
                  <span className="text-zinc-400">Selecting: </span>
                  <span className={cn(
                    "capitalize",
                    selectingMode === "pickup" ? "text-blue-400" : "text-emerald-400"
                  )}>
                    {selectingMode}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Pickup */}
                <div className="relative">
                  <div
                    onClick={() => setSelectingMode("pickup")}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all cursor-pointer",
                      selectingMode === "pickup" 
                        ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20" 
                        : "border-white/5 bg-zinc-800/50 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        selectingMode === "pickup" ? "bg-blue-500" : "bg-zinc-700"
                      )}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          Pickup Location
                        </p>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Search city, area, or landmark..."
                            value={pickup}
                            onChange={(e) => handleSearchInput(e.target.value, "pickup")}
                            onKeyDown={(e) => e.key === "Enter" && handleGeocode(pickup, "pickup")}
                            onFocus={() => {
                              setSelectingMode("pickup")
                              if (pickup.trim().length >= 2) {
                                handleSearchInput(pickup, "pickup")
                              }
                            }}
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none min-w-0"
                          />
                          <button 
                            type="button" 
                            onClick={(e) => { 
                              e.stopPropagation()
                              handleGeocode(pickup, "pickup") 
                            }} 
                            disabled={isSearching || !pickup.trim()}
                            className={cn(
                              "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              pickup.trim() && !isSearching
                                ? "bg-blue-600 hover:bg-blue-500 text-white"
                                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                            )}
                          >
                            {isSearching ? (
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {pickupCoords && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <p className="text-[10px] text-emerald-400 font-medium">Location set</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggestions Dropdown for Pickup */}
                  {showSuggestions && activeSuggestionType === "pickup" && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                      {suggestions.map((suggestion, idx) => {
                        const displayName = suggestion.display_name.split(",")
                        const mainName = suggestion.name || displayName[0]
                        const subName = displayName.slice(1, 3).join(",")
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion, "pickup")}
                            className="w-full p-4 text-left hover:bg-zinc-800 transition-colors border-b border-white/5 last:border-b-0 flex items-start gap-3"
                          >
                            <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {mainName}
                              </p>
                              <p className="text-xs text-zinc-500 truncate mt-0.5">
                                {subName}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Dropoff */}
                <div className="relative">
                  <div
                    onClick={() => setSelectingMode("dropoff")}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all cursor-pointer",
                      selectingMode === "dropoff" 
                        ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20" 
                        : "border-white/5 bg-zinc-800/50 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        selectingMode === "dropoff" ? "bg-emerald-500" : "bg-zinc-700"
                      )}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          Dropoff Location
                        </p>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Search city, area, or landmark..."
                            value={dropoff}
                            onChange={(e) => handleSearchInput(e.target.value, "dropoff")}
                            onKeyDown={(e) => e.key === "Enter" && handleGeocode(dropoff, "dropoff")}
                            onFocus={() => {
                              setSelectingMode("dropoff")
                              if (dropoff.trim().length >= 2) {
                                handleSearchInput(dropoff, "dropoff")
                              }
                            }}
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none min-w-0"
                          />
                          <button 
                            type="button" 
                            onClick={(e) => { 
                              e.stopPropagation()
                              handleGeocode(dropoff, "dropoff") 
                            }} 
                            disabled={isSearching || !dropoff.trim()}
                            className={cn(
                              "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              dropoff.trim() && !isSearching
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                            )}
                          >
                            {isSearching ? (
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {dropoffCoords && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <p className="text-[10px] text-emerald-400 font-medium">Location set</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggestions Dropdown for Dropoff */}
                  {showSuggestions && activeSuggestionType === "dropoff" && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                      {suggestions.map((suggestion, idx) => {
                        const displayName = suggestion.display_name.split(",")
                        const mainName = suggestion.name || displayName[0]
                        const subName = displayName.slice(1, 3).join(",")
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion, "dropoff")}
                            className="w-full p-4 text-left hover:bg-zinc-800 transition-colors border-b border-white/5 last:border-b-0 flex items-start gap-3"
                          >
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {mainName}
                              </p>
                              <p className="text-xs text-zinc-500 truncate mt-0.5">
                                {subName}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Details */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-5">
              <Field label="Ride Type">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const userStr = localStorage.getItem("currentUser")
                      const user = userStr ? JSON.parse(userStr) : null
                      
                      // Check if user has driver's license
                      if (user?.role !== "admin" && user?.idType !== "license") {
                        // Show prompt to upload driver's license
                        if (window.confirm(
                          "To offer rides in your own vehicle, you need to upload a driver's license.\n\n" +
                          "Would you like to go to your profile settings to upload your driver's license now?"
                        )) {
                          router.push("/settings/profile")
                        }
                        return
                      }
                      setRideType("own")
                    }}
                    className={cn(
                      "py-3 px-4 rounded-xl border text-sm font-semibold transition-all relative",
                      rideType === "own"
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>🚗 Own Vehicle</span>
                      {(() => {
                        const userStr = localStorage.getItem("currentUser")
                        const user = userStr ? JSON.parse(userStr) : null
                        return user?.role !== "admin" && user?.idType !== "license" && (
                          <span className="text-[9px] text-zinc-500">License required</span>
                        )
                      })()}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRideType("shared")}
                    className={cn(
                      "py-3 px-4 rounded-xl border text-sm font-semibold transition-all",
                      rideType === "shared"
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    🚕 Shared Cab
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {rideType === "own" 
                    ? "You'll drive passengers in your own vehicle (requires driver's license)"
                    : "You'll share a cab/taxi with other passengers (no driver's license needed)"}
                </p>
              </Field>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date">
                  <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Time">
                  <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label="Available Seats">
                <input id="seats" type="number" min={1} max={7} value={seats} onChange={(e) => setSeats(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Vehicle Type">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {vehicleTypes.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id)}
                      className={cn(
                        "py-3 rounded-xl border text-center transition-all",
                        vehicleType === v.id
                          ? "border-blue-500/50 bg-blue-500/10 text-white"
                          : "border-white/5 bg-zinc-800/50 text-zinc-400 hover:border-white/10"
                      )}
                    >
                      <span className="text-xl block mb-1">{v.icon}</span>
                      <span className="text-xs">{v.label}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  placeholder="Any additional info for passengers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                  rows={3}
                  className={cn(inputCls, "resize-none")}
                />
                <p className="text-[11px] text-zinc-600 mt-1">{notes.length}/200</p>
              </Field>
            </div>
          )}

          {/* Step 3 — Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <p className="text-sm text-zinc-400 mb-4">Price per Seat</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-zinc-500">₹</span>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-28 bg-transparent text-4xl font-bold text-white text-center outline-none placeholder:text-zinc-700 border-b-2 border-white/10 focus:border-blue-500 pb-1 transition-colors"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-zinc-800/50 rounded-xl p-5 space-y-3 border border-white/5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Ride Summary</p>
                {[
                  ["From", pickup],
                  ["To", dropoff],
                  ["Date & Time", date ? `${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}` : ""],
                  ["Seats", seats],
                  ["Vehicle", vehicleType],
                ].map(([k, v]) => v && (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{k}</span>
                    <span className="text-white text-right ml-4 truncate max-w-[200px] capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-zinc-800 border border-white/5 text-white text-sm font-semibold hover:bg-zinc-700 transition-all"
              >
                Back
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
                className={cn(
                  "w-full sm:flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all",
                  canProceed()
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                )}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className={cn(
                  "w-full sm:flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all",
                  canProceed() && !isLoading
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : "Post Ride"}
              </button>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
