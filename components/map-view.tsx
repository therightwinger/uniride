"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon in leaflet + next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export interface MapLocation {
  lat: number
  lng: number
  name?: string
}

interface MapViewProps {
  locations?: MapLocation[]
  onLocationSelect?: (loc: MapLocation) => void
  center?: [number, number]
  zoom?: number
  interactive?: boolean
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (loc: MapLocation) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })
  return null
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 })
  }, [center, map, zoom])
  return null
}

export default function MapView({ 
  locations = [], 
  onLocationSelect, 
  center = [20.5937, 78.9629], // Default India Central
  zoom = 5, 
  interactive = true 
}: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Force map to recalculate size after mount
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 100)
  }, [])

  if (!mounted) return <div className="w-full h-full bg-zinc-900 animate-pulse rounded-xl" />

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={4}
        maxZoom={18}
        maxBounds={[[6.0, 68.0], [37.0, 98.0]]} // India bounds
        maxBoundsViscosity={0.8}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        zoomControl={true}
        className="w-full h-full rounded-xl"
        style={{ height: '100%', width: '100%' }}
        zoomControlOptions={{ position: 'topright' }}
      >
        {/* CartoDB Voyager - Clean, modern map style optimized for India */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={19}
        />
        {locations.map((loc, i) => (
          <Marker key={i} position={[loc.lat, loc.lng]} icon={icon}>
            {loc.name && <Popup>{loc.name}</Popup>}
          </Marker>
        ))}
        {interactive && <MapEvents onLocationSelect={onLocationSelect} />}
        <MapUpdater center={center as [number, number]} zoom={zoom} />
      </MapContainer>
    </div>
  )
}
