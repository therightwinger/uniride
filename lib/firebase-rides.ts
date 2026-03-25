import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore"
import { db } from "./firebase"
import { cache } from "./cache"

export interface Ride {
  id: string
  driverId: string
  driver: {
    name: string
    rating: number
    ratingCount: number
    verified: boolean
  }
  pickup: string
  dropoff: string
  origin: string
  destination: string
  pickupCoords: { lat: number; lng: number }
  dropoffCoords: { lat: number; lng: number }
  date: string
  time: string
  seats: number
  seatsLeft: number
  bookedSeats?: number
  price: number
  vehicleType: string
  notes?: string
  passengers: Array<{
    id: string
    name: string
    rating: number
    joinedAt: string
  }>
  createdAt: string
}

// Create a new ride
export async function createRide(rideData: Omit<Ride, "id">) {
  try {
    const docRef = await addDoc(collection(db, "rides"), {
      ...rideData,
      createdAt: new Date().toISOString(),
    })
    
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Create ride error:", error)
    return { success: false, error: error.message }
  }
}

// Get all available rides (future rides only)
export async function getAvailableRides() {
  try {
    // Check cache first
    const cacheKey = 'available-rides'
    const cached = cache.get<Ride[]>(cacheKey)
    if (cached) {
      return { success: true, rides: cached }
    }

    const ridesRef = collection(db, "rides")
    const q = query(ridesRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    
    const now = new Date()
    const rides: Ride[] = []
    
    snapshot.forEach((doc) => {
      const ride = { id: doc.id, ...doc.data() } as Ride
      
      // Filter out past rides
      const [year, month, day] = ride.date.split("-").map(Number)
      const [hours, minutes] = ride.time.split(":").map(Number)
      const rideDateTime = new Date(year, month - 1, day, hours, minutes)
      
      if (rideDateTime > now && ride.seatsLeft > 0) {
        rides.push(ride)
      }
    })
    
    // Cache for 30 seconds
    cache.set(cacheKey, rides, 30000)
    
    return { success: true, rides }
  } catch (error: any) {
    console.error("Get rides error:", error)
    return { success: false, error: error.message, rides: [] }
  }
}

// Get ride by ID
export async function getRideById(rideId: string) {
  try {
    const rideDoc = await getDoc(doc(db, "rides", rideId))
    
    if (!rideDoc.exists()) {
      return { success: false, error: "Ride not found" }
    }
    
    const ride = { id: rideDoc.id, ...rideDoc.data() } as Ride
    return { success: true, ride }
  } catch (error: any) {
    console.error("Get ride error:", error)
    return { success: false, error: error.message }
  }
}

// Get rides by driver
export async function getRidesByDriver(driverId: string) {
  try {
    const ridesRef = collection(db, "rides")
    const q = query(ridesRef, where("driverId", "==", driverId), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    
    const rides: Ride[] = []
    snapshot.forEach((doc) => {
      rides.push({ id: doc.id, ...doc.data() } as Ride)
    })
    
    return { success: true, rides }
  } catch (error: any) {
    console.error("Get driver rides error:", error)
    return { success: false, error: error.message, rides: [] }
  }
}

// Join a ride
export async function joinRide(rideId: string, passenger: { id: string; name: string; rating: number }) {
  try {
    const rideRef = doc(db, "rides", rideId)
    const rideDoc = await getDoc(rideRef)
    
    if (!rideDoc.exists()) {
      return { success: false, error: "Ride not found" }
    }
    
    const ride = rideDoc.data() as Ride
    const bookedSeats = ride.bookedSeats || ride.passengers?.length || 0
    const availableSeats = ride.seats - bookedSeats
    
    if (availableSeats <= 0) {
      return { success: false, error: "No seats available" }
    }
    
    // Check if already joined
    if (ride.passengers?.some(p => p.id === passenger.id)) {
      return { success: false, error: "Already joined this ride" }
    }
    
    await updateDoc(rideRef, {
      passengers: arrayUnion({
        ...passenger,
        joinedAt: new Date().toISOString()
      }),
      bookedSeats: bookedSeats + 1,
      seatsLeft: availableSeats - 1
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("Join ride error:", error)
    return { success: false, error: error.message }
  }
}

// Leave a ride
export async function leaveRide(rideId: string, passengerId: string) {
  try {
    const rideRef = doc(db, "rides", rideId)
    const rideDoc = await getDoc(rideRef)
    
    if (!rideDoc.exists()) {
      return { success: false, error: "Ride not found" }
    }
    
    const ride = rideDoc.data() as Ride
    const passenger = ride.passengers?.find(p => p.id === passengerId)
    
    if (!passenger) {
      return { success: false, error: "Not a passenger on this ride" }
    }
    
    const bookedSeats = ride.bookedSeats || ride.passengers?.length || 0
    
    await updateDoc(rideRef, {
      passengers: arrayRemove(passenger),
      bookedSeats: Math.max(0, bookedSeats - 1),
      seatsLeft: ride.seatsLeft + 1
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("Leave ride error:", error)
    return { success: false, error: error.message }
  }
}

// Cancel a ride (driver only)
export async function cancelRide(rideId: string, driverId: string) {
  try {
    const rideRef = doc(db, "rides", rideId)
    const rideDoc = await getDoc(rideRef)
    
    if (!rideDoc.exists()) {
      return { success: false, error: "Ride not found" }
    }
    
    const ride = rideDoc.data() as Ride
    
    if (ride.driverId !== driverId) {
      return { success: false, error: "Only the driver can cancel this ride" }
    }
    
    await deleteDoc(rideRef)
    
    return { success: true }
  } catch (error: any) {
    console.error("Cancel ride error:", error)
    return { success: false, error: error.message }
  }
}


// Get completed rides for a user (as driver or passenger)
export async function getCompletedRides(userId: string) {
  try {
    const ridesRef = collection(db, "rides")
    const now = new Date()
    
    // Get rides where user was driver
    const driverQuery = query(
      ridesRef,
      where("driverId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const driverSnapshot = await getDocs(driverQuery)
    
    // Get all rides and filter for passenger rides
    const allRidesQuery = query(ridesRef, orderBy("createdAt", "desc"))
    const allSnapshot = await getDocs(allRidesQuery)
    
    const completedRides: Ride[] = []
    
    // Add driver rides that are in the past
    driverSnapshot.forEach((doc) => {
      const ride = { id: doc.id, ...doc.data() } as Ride
      const rideDateTime = new Date(`${ride.date}T${ride.time}`)
      if (rideDateTime < now) {
        completedRides.push({ ...ride, role: "driver" } as any)
      }
    })
    
    // Add passenger rides that are in the past
    allSnapshot.forEach((doc) => {
      const ride = { id: doc.id, ...doc.data() } as Ride
      const rideDateTime = new Date(`${ride.date}T${ride.time}`)
      const isPassenger = ride.passengers.some(p => p.id === userId)
      
      if (isPassenger && rideDateTime < now) {
        completedRides.push({ ...ride, role: "passenger" } as any)
      }
    })
    
    // Sort by date descending
    completedRides.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
    
    return { success: true, rides: completedRides }
  } catch (error: any) {
    console.error("Get completed rides error:", error)
    return { success: false, error: error.message, rides: [] }
  }
}

// Get upcoming rides for a user (as driver or passenger)
export async function getUpcomingRides(userId: string) {
  try {
    const ridesRef = collection(db, "rides")
    const now = new Date()
    
    // Get rides where user is driver
    const driverQuery = query(
      ridesRef,
      where("driverId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const driverSnapshot = await getDocs(driverQuery)
    
    // Get all rides and filter for passenger rides
    const allRidesQuery = query(ridesRef, orderBy("createdAt", "desc"))
    const allSnapshot = await getDocs(allRidesQuery)
    
    const upcomingRides: Ride[] = []
    
    // Add driver rides that are in the future
    driverSnapshot.forEach((doc) => {
      const ride = { id: doc.id, ...doc.data() } as Ride
      const rideDateTime = new Date(`${ride.date}T${ride.time}`)
      if (rideDateTime >= now) {
        upcomingRides.push({ ...ride, role: "driver" } as any)
      }
    })
    
    // Add passenger rides that are in the future
    allSnapshot.forEach((doc) => {
      const ride = { id: doc.id, ...doc.data() } as Ride
      const rideDateTime = new Date(`${ride.date}T${ride.time}`)
      const isPassenger = ride.passengers.some(p => p.id === userId)
      
      if (isPassenger && rideDateTime >= now) {
        upcomingRides.push({ ...ride, role: "passenger" } as any)
      }
    })
    
    // Sort by date ascending (soonest first)
    upcomingRides.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
    
    return { success: true, rides: upcomingRides }
  } catch (error: any) {
    console.error("Get upcoming rides error:", error)
    return { success: false, error: error.message, rides: [] }
  }
}
