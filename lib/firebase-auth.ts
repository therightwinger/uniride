import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  User
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, db, storage } from "./firebase"

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  age?: string
  role: "user" | "admin"
  status: "pending" | "verified" | "rejected" | "disabled"
  profileImage?: string
  govIdImage?: string
  idType?: "license" | "other"
  submittedAt: string
  verifiedAt?: string
  disabledAt?: string
  rating?: number
  totalRides?: number
  createdAt: string
  emailVerified?: boolean
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  userData: {
    name: string
    phone?: string
    age?: string
    govIdFile?: File
    idType?: "license" | "other"
  }
) {
  try {
    // Validate inputs
    if (!email || !email.includes('@')) {
      return { success: false, error: "Invalid email address" }
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }
    if (!userData.name || userData.name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" }
    }
    if (userData.phone && !/^\+?[\d\s-()]+$/.test(userData.phone)) {
      return { success: false, error: "Invalid phone number format" }
    }
    if (userData.age) {
      const ageNum = parseInt(userData.age)
      if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        return { success: false, error: "Age must be between 16 and 100" }
      }
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send email verification
    await sendEmailVerification(user)

    let govIdBase64 = ""
    
    // Convert image to base64 if provided
    if (userData.govIdFile) {
      // Validate file size (max 5MB)
      if (userData.govIdFile.size > 5 * 1024 * 1024) {
        return { success: false, error: "ID file must be less than 5MB" }
      }
      
      govIdBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(userData.govIdFile!)
      })
    }

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      name: userData.name.trim(),
      email: user.email!,
      phone: userData.phone?.trim(),
      age: userData.age,
      role: "user",
      status: "pending",
      govIdImage: govIdBase64,
      idType: userData.idType || "other",
      submittedAt: new Date().toISOString(),
      rating: 0,
      totalRides: 0,
      createdAt: new Date().toISOString(),
      emailVerified: false,
    }

    await setDoc(doc(db, "users", user.uid), userProfile)

    return { 
      success: true, 
      user: userProfile,
      message: "Account created! Please check your email to verify your account."
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Provide user-friendly error messages
    if (error.code === "auth/email-already-in-use") {
      return { success: false, error: "Email already registered" }
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "Password is too weak (min 6 characters)" }
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "Invalid email address" }
    }
    
    return { success: false, error: error.message }
  }
}

// Sign in user
export async function signInUser(email: string, password: string) {
  try {
    // Validate inputs
    if (!email || !email.includes('@')) {
      return { success: false, error: "Invalid email address" }
    }
    if (!password) {
      return { success: false, error: "Password is required" }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found")
    }

    const userProfile = userDoc.data() as UserProfile
    
    // Update email verification status if verified
    if (user.emailVerified && !userProfile.emailVerified) {
      await updateDoc(doc(db, "users", user.uid), {
        emailVerified: true
      })
      userProfile.emailVerified = true
    }

    return { success: true, user: userProfile }
  } catch (error: any) {
    console.error("Sign in error:", error)
    
    // Provide user-friendly error messages
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      return { success: false, error: "Invalid email or password" }
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "Invalid email address" }
    } else if (error.code === "auth/user-disabled") {
      return { success: false, error: "Account has been disabled" }
    } else if (error.code === "auth/too-many-requests") {
      return { success: false, error: "Too many failed attempts. Please try again later." }
    }
    
    return { success: false, error: error.message }
  }
}

// Sign out user
export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { success: false, error: error.message }
  }
}

// Get current user profile
export async function getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Upload profile image
export async function uploadProfileImage(userId: string, file: File) {
  try {
    const storageRef = ref(storage, `profileImages/${userId}/${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    
    // Update user profile
    await setDoc(doc(db, "users", userId), { profileImage: url }, { merge: true })
    
    return { success: true, url }
  } catch (error: any) {
    console.error("Upload error:", error)
    return { success: false, error: error.message }
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string
    phone?: string
    age?: string
    college?: string
    bio?: string
  }
) {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, updates)
    
    // Get updated profile
    const userDoc = await getDoc(userRef)
    return { success: true, user: userDoc.data() as UserProfile }
  } catch (error: any) {
    console.error("Update profile error:", error)
    return { success: false, error: error.message }
  }
}

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("No user logged in")
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)

    return { success: true }
  } catch (error: any) {
    console.error("Change password error:", error)
    
    // Provide user-friendly error messages
    if (error.code === "auth/wrong-password") {
      return { success: false, error: "Current password is incorrect" }
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "New password is too weak" }
    }
    
    return { success: false, error: error.message }
  }
}

// Upload government ID
export async function uploadGovernmentId(userId: string, file: File, idType: "license" | "other" = "other") {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("You must be logged in to upload ID")
    }

    // Verify the userId matches the authenticated user
    if (currentUser.uid !== userId) {
      throw new Error("User ID mismatch. Please log in again.")
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "ID file must be less than 5MB" }
    }

    // Convert to base64
    const govIdBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // Update user profile
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      govIdImage: govIdBase64,
      idType: idType,
      submittedAt: new Date().toISOString(),
      status: "pending" // Reset to pending when new ID is uploaded
    })

    // Fetch updated user
    const userDoc = await getDoc(userRef)
    const updatedUser = { id: userDoc.id, ...userDoc.data() }

    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Upload government ID error:", error)
    
    // Provide more specific error messages
    if (error.code === "permission-denied") {
      return { success: false, error: "Permission denied. Please make sure you're logged in." }
    }
    
    return { success: false, error: error.message }
  }
}

// Send password reset email
export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    console.error("Password reset error:", error)
    
    // Provide user-friendly error messages
    if (error.code === "auth/user-not-found") {
      return { success: false, error: "No account found with this email" }
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "Invalid email address" }
    }
    
    return { success: false, error: error.message }
  }
}
