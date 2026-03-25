"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getRideById, joinRide, cancelRide } from "@/lib/firebase-rides"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Star,
  Shield,
  MessageCircle,
  MapPin,
  X
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { RideDetailSkeleton } from "@/components/skeletons"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { formatDate } from "@/lib/date-utils"

export default function RideDetailPage() {
  useAuthGuard()
  const params = useParams()
  const router = useRouter()
  const [ride, setRide] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) setCurrentUser(JSON.parse(userStr))

    const fetchRide = async () => {
      const result = await getRideById(params.id as string)
      if (result.success && result.ride) {
        setRide(result.ride)
        const alreadyJoined = result.ride.passengers?.some((p: any) => p.id === JSON.parse(userStr || "{}").id)
        if (alreadyJoined) setHasJoined(true)
      } else {
        setNotFound(true)
      }
    }

    fetchRide()
  }, [params.id])

  const handleJoinRide = async () => {
    if (!currentUser || !ride) return
    setIsJoining(true)

    const result = await joinRide(ride.id, {
      id: currentUser.id,
      name: currentUser.name,
      rating: currentUser.rating || 4.5
    })

    if (result.success) {
      // Refresh ride data
      const updatedRide = await getRideById(ride.id)
      if (updatedRide.success && updatedRide.ride) {
        setRide(updatedRide.ride)
        setHasJoined(true)
      }
    }

    setIsJoining(false)
  }

  const handleMessageDriver = () => {
    router.push(`/messages?ride=${ride.id}`)
  }

  const handleCancelRide = async () => {
    if (!currentUser || !ride) return
    setIsCancelling(true)
    
    const result = await cancelRide(ride.id, currentUser.id)
    
    if (result.success) {
      setIsCancelling(false)
      setShowCancelModal(false)
      router.push("/rides")
    } else {
      setIsCancelling(false)
      alert(result.error || "Failed to cancel ride")
    }
  }

  if (notFound) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-8">
          <main className="max-w-md mx-auto text-center pt-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-5">
              <Car className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ride Not Found</h2>
            <p className="text-zinc-400 mb-6 text-sm">This ride was not found or may have been removed.</p>
            <Link href="/rides">
              <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">
                Browse Rides
              </button>
            </Link>
          </main>
        </div>
      </SidebarLayout>
    )
  }

  if (!ride) {
    return (
      <SidebarLayout>
        <RideDetailSkeleton />
      </SidebarLayout>
    )
  }

  const isOwnRide = currentUser?.id === ride.driverId
  // Admins bypass verification checks, or users must have ID uploaded and be verified
  const isVerified = currentUser?.role === "admin" || (currentUser?.govIdImage && currentUser?.status === "verified")
  const hasNoId = !currentUser?.govIdImage && currentUser?.role !== "admin"

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-8">
        <main className="max-w-2xl mx-auto">
          <Link href="/rides" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to rides
          </Link>

          {/* Main Card */}
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 mb-4">
            {/* Driver */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                  {ride.driver.name.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{ride.driver.name}</h2>
                    {ride.driver.verified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 text-[10px] font-semibold">
                        <Shield className="w-3 h-3" />Verified
                      </span>
                    )}
                    {isOwnRide && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-semibold">Your Ride</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium text-zinc-300">{ride.driver.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">₹{ride.price}</p>
                <p className="text-xs text-zinc-500">per seat</p>
              </div>
            </div>

            {/* Route */}
            <div className="mb-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-0.5 flex-1 min-h-[40px] bg-gradient-to-b from-blue-500/30 to-emerald-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 space-y-4 min-w-0">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Pickup</p>
                    <p className="text-base font-medium text-white truncate flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />{ride.pickup || ride.origin}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Dropoff</p>
                    <p className="text-base font-medium text-white truncate flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{ride.dropoff || ride.destination}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Calendar, label: "Date", value: formatDate(ride.date) },
                { icon: Clock, label: "Time", value: ride.time },
                { 
                  icon: Users, 
                  label: "Available Seats", 
                  value: `${ride.bookedSeats ? ride.seats - ride.bookedSeats : ride.seats}/${ride.seats}`,
                  highlight: (ride.bookedSeats ? ride.seats - ride.bookedSeats : ride.seats) <= 2
                },
                { icon: Car, label: "Vehicle", value: ride.vehicleType },
              ].map(({ icon: Icon, label, value, highlight }) => (
                <div key={label} className="bg-zinc-800/50 border border-white/5 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <p className={`text-sm font-medium capitalize ${highlight ? 'text-yellow-400' : 'text-white'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {ride.notes && (
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3.5 mb-6">
                <p className="text-xs font-semibold text-blue-400 mb-1">Driver Notes</p>
                <p className="text-sm text-zinc-300">{ride.notes}</p>
              </div>
            )}

            {/* Verification Warning */}
            {!isOwnRide && !isVerified && (
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-4 mb-4">
                <Shield className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-300">Verification Required</p>
                  <p className="text-yellow-400/80">
                    You must upload and verify your government ID before joining rides.{" "}
                    <Link href="/profile" className="text-blue-400 hover:underline">Upload ID</Link>
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            {isOwnRide ? (
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel Ride
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {hasJoined ? (
                  <button disabled className="w-full py-3 rounded-xl bg-emerald-600/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                    <Shield className="w-4 h-4" />
                    You&apos;ve Joined This Ride
                  </button>
                ) : (
                  <button 
                    onClick={handleJoinRide} 
                    disabled={isJoining || (ride.bookedSeats && ride.bookedSeats >= ride.seats) || !isVerified || hasNoId} 
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : hasNoId ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Upload ID to Join
                      </>
                    ) : !isVerified ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Verify ID to Join
                      </>
                    ) : (ride.bookedSeats && ride.bookedSeats >= ride.seats) ? "Ride Full" : "Join Ride"}
                  </button>
                )}
                <button 
                  onClick={handleMessageDriver} 
                  disabled={!isVerified || hasNoId}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {hasNoId ? "Upload ID to Message" : !isVerified ? "Verify ID to Message" : "Message Driver"}
                </button>
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">
              Passengers ({(ride.passengers || []).length})
            </h3>
            {(ride.passengers || []).length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No passengers yet. Be the first to join!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ride.passengers.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-white/5 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span>{p.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cancel Ride Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Cancel Ride?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to cancel this ride? This action cannot be undone and all passengers will be notified.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelRide}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Ride"
                )}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                Keep Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
