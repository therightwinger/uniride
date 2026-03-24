import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, increment } from "firebase/firestore"
import { db } from "./firebase"

export interface Rating {
  id: string
  rideId: string
  raterId: string
  raterName: string
  ratedUserId: string
  ratedUserName: string
  rating: number // 1-5
  comment?: string
  createdAt: string
}

// Submit a rating
export async function submitRating(
  rideId: string,
  raterId: string,
  raterName: string,
  ratedUserId: string,
  ratedUserName: string,
  rating: number,
  comment?: string
) {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" }
    }

    // Check if already rated
    const ratingsRef = collection(db, "ratings")
    const q = query(
      ratingsRef,
      where("rideId", "==", rideId),
      where("raterId", "==", raterId),
      where("ratedUserId", "==", ratedUserId)
    )
    const existingRatings = await getDocs(q)
    
    if (!existingRatings.empty) {
      return { success: false, error: "You have already rated this user for this ride" }
    }

    // Create rating
    const ratingId = `${rideId}_${raterId}_${ratedUserId}`
    const ratingData: Rating = {
      id: ratingId,
      rideId,
      raterId,
      raterName,
      ratedUserId,
      ratedUserName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    }

    await setDoc(doc(db, "ratings", ratingId), ratingData)

    // Update user's average rating
    await updateUserRating(ratedUserId)

    return { success: true, rating: ratingData }
  } catch (error: any) {
    console.error("Submit rating error:", error)
    return { success: false, error: error.message }
  }
}

// Update user's average rating
async function updateUserRating(userId: string) {
  try {
    const ratingsRef = collection(db, "ratings")
    const q = query(ratingsRef, where("ratedUserId", "==", userId))
    const snapshot = await getDocs(q)

    let totalRating = 0
    let count = 0

    snapshot.forEach((doc) => {
      const rating = doc.data() as Rating
      totalRating += rating.rating
      count++
    })

    const averageRating = count > 0 ? totalRating / count : 0

    await updateDoc(doc(db, "users", userId), {
      rating: averageRating,
      totalRatings: count
    })

    return { success: true, averageRating, totalRatings: count }
  } catch (error: any) {
    console.error("Update user rating error:", error)
    return { success: false, error: error.message }
  }
}

// Get ratings for a user
export async function getUserRatings(userId: string) {
  try {
    const ratingsRef = collection(db, "ratings")
    const q = query(
      ratingsRef,
      where("ratedUserId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)

    const ratings: Rating[] = []
    snapshot.forEach((doc) => {
      ratings.push(doc.data() as Rating)
    })

    return { success: true, ratings }
  } catch (error: any) {
    console.error("Get user ratings error:", error)
    return { success: false, error: error.message, ratings: [] }
  }
}

// Get ratings for a ride
export async function getRideRatings(rideId: string) {
  try {
    const ratingsRef = collection(db, "ratings")
    const q = query(ratingsRef, where("rideId", "==", rideId))
    const snapshot = await getDocs(q)

    const ratings: Rating[] = []
    snapshot.forEach((doc) => {
      ratings.push(doc.data() as Rating)
    })

    return { success: true, ratings }
  } catch (error: any) {
    console.error("Get ride ratings error:", error)
    return { success: false, error: error.message, ratings: [] }
  }
}

// Check if user can rate another user for a ride
export async function canRateUser(rideId: string, raterId: string, ratedUserId: string) {
  try {
    // Check if already rated
    const ratingsRef = collection(db, "ratings")
    const q = query(
      ratingsRef,
      where("rideId", "==", rideId),
      where("raterId", "==", raterId),
      where("ratedUserId", "==", ratedUserId)
    )
    const existingRatings = await getDocs(q)

    return { success: true, canRate: existingRatings.empty }
  } catch (error: any) {
    console.error("Can rate user error:", error)
    return { success: false, error: error.message, canRate: false }
  }
}
