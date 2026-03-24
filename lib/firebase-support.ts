import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore"
import { db } from "./firebase"

export interface SupportMessage {
  id: string
  userId?: string
  name: string
  email: string
  message: string
  status: "new" | "in-progress" | "resolved"
  createdAt: string
  resolvedAt?: string
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
