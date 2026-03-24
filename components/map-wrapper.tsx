"use client"

import dynamic from "next/dynamic"

// Dynamically import the map view with SSR disabled
// Leaflet requires the window object, which isn't available during server-side rendering
const MapView = dynamic(
  () => import("./map-view"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-secondary/50 animate-pulse rounded-xl flex items-center justify-center text-muted-foreground border border-border">
        Loading Map...
      </div>
    )
  }
)

export default MapView
