import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  orderBy,
  Timestamp
} from "firebase/firestore"
import { db } from "./firebase"

export interface Notification {
  id?: string
  userId: string
  type: "id_rejected" | "id_approved" | "ride_booked" | "ride_cancelled" | "general"
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Create a notification
export async function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  actionUrl?: string
) {
  try {
    const notificationsRef = collection(db, "notifications")
    await addDoc(notificationsRef, {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: actionUrl || null
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("Create notification error:", error)
    return { success: false, error: error.message }
  }
}

// Get user notifications
export async function getUserNotifications(userId: string) {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(
      notificationsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    
    const notifications: Notification[] = []
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification)
    })
    
    return { success: true, notifications }
  } catch (error: any) {
    console.error("Get notifications error:", error)
    return { success: false, error: error.message, notifications: [] }
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, { read: true })
    
    return { success: true }
  } catch (error: any) {
    console.error("Mark notification as read error:", error)
    return { success: false, error: error.message }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(
      notificationsRef, 
      where("userId", "==", userId),
      where("read", "==", false)
    )
    const snapshot = await getDocs(q)
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    )
    
    await Promise.all(updatePromises)
    
    return { success: true }
  } catch (error: any) {
    console.error("Mark all notifications as read error:", error)
    return { success: false, error: error.message }
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(
      notificationsRef, 
      where("userId", "==", userId),
      where("read", "==", false)
    )
    const snapshot = await getDocs(q)
    
    return { success: true, count: snapshot.size }
  } catch (error: any) {
    console.error("Get unread count error:", error)
    return { success: false, error: error.message, count: 0 }
  }
}
