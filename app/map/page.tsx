"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Car, Lock } from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import MapView from "@/components/map-wrapper"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { getAvailableRides } from "@/lib/firebase-rides"
import { cn } from "@/lib/utils"

const mockRides: any[] = []
type SelectedRide = typeof mockRides[0] | null

export default function MapPage() {
  useAuthGuard()
  const [selectedRide, setSelectedRide] = useState<SelectedRide>(null)
  const [userStatus, setUserStatus] = useState<string>('verified')
  const [rides, setRides] = useState<any[]>([])

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) setUserStatus(JSON.parse(userStr).status || 'verified')
    else setUserStatus('pending')
    
    // Fetch rides from Firebase
    const fetchRides = async () => {
      const result = await getAvailableRides()
      if (result.success) {
        setRides(result.rides)
      }
    }
    
    fetchRides()
  }, [])

  // Transform rides to map compatible locations
  const locations = rides.map(r => ({
    lat: r.pickupCoords?.lat || 0,
    lng: r.pickupCoords?.lng || 0,
    name: r.driver?.name || "Driver"
  }))

  return (
    <SidebarLayout>

      <main className="px-5 py-7 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:gap-6">
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Ride Map
            </h1>
            <p className="text-sm text-zinc-400">
              {rides.length === 0 
                ? "No active rides available in your area right now." 
                : "Explore available rides visually."}
            </p>
          </div>

          {/* Embedded Map Section */}
          <div className="w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 relative z-0">
            <MapView 
              locations={locations} 
              interactive={true} 
            />
          </div>

          {/* Rides List Section Below Map */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Available Rides
            </h2>
            {rides.length === 0 ? (
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <Car className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="font-medium text-white mb-1">No rides to show</p>
                <p className="text-sm text-zinc-400 mb-4">Be the first to offer a ride in your area!</p>
                <Link href="/rides/create">
                  <button className={cn(
                    "px-6 py-3 rounded-xl font-semibold transition-colors",
                    userStatus === 'pending' 
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  )}>
                    {userStatus === 'pending' ? (
                      <>
                        <Lock className="w-4 h-4 inline mr-2" />
                        Verify ID to Offer Ride
                      </>
                    ) : 'Offer a Ride'}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Once hooked to a backend, map real rides here */}
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarLayout>
  )
}
