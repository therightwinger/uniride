import { memo } from "react"
import Link from "next/link"
import { MapPin, Star, MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatShortDate } from "@/lib/date-utils"

interface RideCardProps {
  ride: any
  isMyRide: boolean
  userStatus: string
  vehicleLabel: (type: string) => string
  vehicleBadgeClass: (type: string) => string
}

export const RideCard = memo(function RideCard({ 
  ride, 
  isMyRide, 
  userStatus, 
  vehicleLabel, 
  vehicleBadgeClass 
}: RideCardProps) {
  const origin = ride.pickup || ride.origin || "Origin"
  const destination = ride.dropoff || ride.destination || "Destination"
  const driverInitials = ride.driver?.name
    ? ride.driver.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
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
          {ride.bookedSeats ? `${ride.seats - ride.bookedSeats}/${ride.seats}` : ride.seats} available
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
          {!isMyRide && (
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
                isMyRide
                  ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                  : userStatus === "pending"
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
            >
              {isMyRide ? "Your Ride" : "Join →"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
})
