import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  query,
  where
} from "firebase/firestore"
import { db } from "./firebase"
import { UserProfile } from "./firebase-auth"
import { createNotification } from "./firebase-notifications"

// Get all users (admin only)
export async function getAllUsers() {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)
    
    const users: UserProfile[] = []
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile)
    })
    
    return { success: true, users }
  } catch (error: any) {
    console.error("Get all users error:", error)
    return { success: false, error: error.message, users: [] }
  }
}

// Update user status (admin only)
export async function updateUserStatus(
  userId: string, 
  status: "pending" | "verified" | "rejected" | "disabled",
  rejectionReason?: string
) {
  try {
    const userRef = doc(db, "users", userId)
    const updates: any = { status }
    
    if (status === "verified") {
      updates.verifiedAt = new Date().toISOString()
      
      // Send approval notification
      await createNotification(
        userId,
        "id_approved",
        "ID Verified Successfully! ✅",
        "Your government ID has been verified. You can now create and book rides.",
        "/profile"
      )
    } else if (status === "rejected") {
      updates.rejectedAt = new Date().toISOString()
      if (rejectionReason) {
        updates.rejectionReason = rejectionReason
      }
      
      // Send rejection notification
      await createNotification(
        userId,
        "id_rejected",
        "ID Verification Rejected",
        rejectionReason || "Your ID verification was rejected. Please upload a clear image of your government ID and try again.",
        "/settings/profile"
      )
    } else if (status === "disabled") {
      updates.disabledAt = new Date().toISOString()
    }
    
    await updateDoc(userRef, updates)
    
    return { success: true }
  } catch (error: any) {
    console.error("Update user status error:", error)
    return { success: false, error: error.message }
  }
}

// Get pending verifications (admin only)
export async function getPendingVerifications() {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("status", "==", "pending"))
    const snapshot = await getDocs(q)
    
    const users: UserProfile[] = []
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile)
    })
    
    return { success: true, users }
  } catch (error: any) {
    console.error("Get pending verifications error:", error)
    return { success: false, error: error.message, users: [] }
  }
}

// Update driver's license status (admin only)
export async function updateLicenseStatus(
  userId: string, 
  licenseStatus: "pending" | "verified" | "rejected",
  rejectionReason?: string
) {
  try {
    const userRef = doc(db, "users", userId)
    const updates: any = { licenseStatus }
    
    if (licenseStatus === "verified") {
      updates.licenseVerifiedAt = new Date().toISOString()
      
      // If user signed up with driver's license (no govIdImage), also verify their main status
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      if (userData && !userData.govIdImage && userData.idType === "license") {
        // User registered with driver's license only
        updates.status = "verified"
        updates.verifiedAt = new Date().toISOString()
      }
      
      // Send approval notification
      await createNotification(
        userId,
        "license_approved",
        "Driver's License Verified! 🚗",
        "Your driver's license has been verified. You can now create rides using your own vehicle.",
        "/profile"
      )
    } else if (licenseStatus === "rejected") {
      updates.licenseRejectedAt = new Date().toISOString()
      if (rejectionReason) {
        updates.licenseRejectionReason = rejectionReason
      }
      
      // Send rejection notification
      await createNotification(
        userId,
        "license_rejected",
        "Driver's License Verification Rejected",
        rejectionReason || "Your driver's license verification was rejected. Please upload a clear image of your valid driver's license and try again.",
        "/settings/profile"
      )
    }
    
    await updateDoc(userRef, updates)
    
    return { success: true }
  } catch (error: any) {
    console.error("Update license status error:", error)
    return { success: false, error: error.message }
  }
}

// Get pending license verifications (admin only)
export async function getPendingLicenseVerifications() {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("licenseStatus", "==", "pending"))
    const snapshot = await getDocs(q)
    
    const users: UserProfile[] = []
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile)
    })
    
    return { success: true, users }
  } catch (error: any) {
    console.error("Get pending license verifications error:", error)
    return { success: false, error: error.message, users: [] }
  }
}
