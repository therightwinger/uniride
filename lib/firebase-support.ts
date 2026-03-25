import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, where } from "firebase/firestore"
import { db } from "./firebase"
import { createNotification } from "./firebase-notifications"

export interface SupportReply {
  id: string
  adminName: string
  message: string
  createdAt: string
}

export interface SupportMessage {
  id: string
  userId?: string
  name: string
  email: string
  message: string
  status: "new" | "in-progress" | "resolved"
  createdAt: string
  resolvedAt?: string
  replies?: SupportReply[]
}

// Submit support message
export async function submitSupportMessage(
  name: string,
  email: string,
  message: string,
  userId?: string
) {
  try {
    const supportMessage = {
      userId,
      name,
      email,
      message,
      status: "new" as const,
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, "support"), supportMessage)

    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Submit support message error:", error)
    return { success: false, error: error.message }
  }
}

// Get all support messages (admin only)
export async function getAllSupportMessages() {
  try {
    const supportRef = collection(db, "support")
    const q = query(supportRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const messages: SupportMessage[] = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as SupportMessage)
    })

    return { success: true, messages }
  } catch (error: any) {
    console.error("Get support messages error:", error)
    return { success: false, error: error.message, messages: [] }
  }
}

// Update support message status (admin only)
export async function updateSupportMessageStatus(
  messageId: string,
  status: "new" | "in-progress" | "resolved"
) {
  try {
    const messageRef = doc(db, "support", messageId)
    const updates: any = { status }

    if (status === "resolved") {
      updates.resolvedAt = new Date().toISOString()
    }

    await updateDoc(messageRef, updates)

    return { success: true }
  } catch (error: any) {
    console.error("Update support message status error:", error)
    return { success: false, error: error.message }
  }
}

// Add reply to support message (admin only)
export async function addSupportReply(
  messageId: string,
  adminName: string,
  replyMessage: string,
  userId?: string
) {
  try {
    const messageRef = doc(db, "support", messageId)
    
    // Get current message to access replies array
    const messageDoc = await getDocs(query(collection(db, "support")))
    let currentReplies: SupportReply[] = []
    
    messageDoc.forEach((doc) => {
      if (doc.id === messageId) {
        currentReplies = (doc.data().replies || []) as SupportReply[]
      }
    })
    
    const newReply: SupportReply = {
      id: Date.now().toString(),
      adminName,
      message: replyMessage,
      createdAt: new Date().toISOString()
    }
    
    const updatedReplies = [...currentReplies, newReply]
    
    await updateDoc(messageRef, {
      replies: updatedReplies,
      status: "in-progress"
    })
    
    // Send notification to user if userId exists
    if (userId) {
      await createNotification(
        userId,
        "support_reply",
        "Support Team Replied",
        `Admin ${adminName} has replied to your support ticket.`,
        "/settings/support"
      )
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Add support reply error:", error)
    return { success: false, error: error.message }
  }
}

// Get user's support messages
export async function getUserSupportMessages(userId: string) {
  try {
    const supportRef = collection(db, "support")
    const q = query(supportRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const messages: SupportMessage[] = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as SupportMessage)
    })

    return { success: true, messages }
  } catch (error: any) {
    console.error("Get user support messages error:", error)
    return { success: false, error: error.message, messages: [] }
  }
}
