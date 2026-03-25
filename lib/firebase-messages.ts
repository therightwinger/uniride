import { 
  collection, 
  addDoc, 
  getDocs, 
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore"
import { db } from "./firebase"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[] // Array of user IDs
  participantNames: { [userId: string]: string }
  rideId?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: { [userId: string]: number }
  createdAt: string
}

// Create or get conversation
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  userName1: string,
  userName2: string,
  rideId?: string
) {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, "conversations")
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId1)
    )
    
    const snapshot = await getDocs(q)
    let existingConversation: any = null
    
    snapshot.forEach((doc) => {
      const conv = doc.data()
      if (conv.participants.includes(userId2)) {
        existingConversation = { id: doc.id, ...conv }
      }
    })
    
    if (existingConversation) {
      return { success: true, conversation: existingConversation }
    }
    
    // Create new conversation
    const newConversation: Omit<Conversation, "id"> = {
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: userName1,
        [userId2]: userName2
      },
      rideId,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0
      },
      createdAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(conversationsRef, newConversation)
    
    return { 
      success: true, 
      conversation: { id: docRef.id, ...newConversation } 
    }
  } catch (error: any) {
    console.error("Get/create conversation error:", error)
    return { success: false, error: error.message }
  }
}

// Get user's conversations
export async function getUserConversations(userId: string) {
  try {
    const conversationsRef = collection(db, "conversations")
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    )
    
    const snapshot = await getDocs(q)
    const conversations: Conversation[] = []
    
    snapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation)
    })
    
    return { success: true, conversations }
  } catch (error: any) {
    console.error("Get conversations error:", error)
    return { success: false, error: error.message, conversations: [] }
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string
) {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages")
    
    const message: Omit<Message, "id"> = {
      conversationId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    await addDoc(messagesRef, message)
    
    // Update conversation's last message
    const conversationRef = doc(db, "conversations", conversationId)
    const conversationDoc = await getDoc(conversationRef)
    
    if (conversationDoc.exists()) {
      const conv = conversationDoc.data()
      const otherUserId = conv.participants.find((id: string) => id !== senderId)
      
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageTime: new Date().toISOString(),
        [`unreadCount.${otherUserId}`]: (conv.unreadCount?.[otherUserId] || 0) + 1
      })
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Send message error:", error)
    return { success: false, error: error.message }
  }
}

// Get messages in a conversation
export async function getMessages(conversationId: string) {
  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "asc"))
    
    const snapshot = await getDocs(q)
    const messages: Message[] = []
    
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message)
    })
    
    return { success: true, messages }
  } catch (error: any) {
    console.error("Get messages error:", error)
    return { success: false, error: error.message, messages: [] }
  }
}

// Real-time message listener
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))
  
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message)
    })
    callback(messages)
  })
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const conversationRef = doc(db, "conversations", conversationId)
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("Mark as read error:", error)
    return { success: false, error: error.message }
  }
}

// Delete a single message
export async function deleteMessage(conversationId: string, messageId: string) {
  try {
    const messageRef = doc(db, "conversations", conversationId, "messages", messageId)
    await deleteDoc(messageRef)
    
    // Update last message if this was the last one
    const messagesRef = collection(db, "conversations", conversationId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "desc"))
    const snapshot = await getDocs(q)
    
    const conversationRef = doc(db, "conversations", conversationId)
    
    if (snapshot.empty) {
      // No messages left
      await updateDoc(conversationRef, {
        lastMessage: "",
        lastMessageTime: new Date().toISOString()
      })
    } else {
      // Update with the new last message
      const lastMsg = snapshot.docs[0].data()
      await updateDoc(conversationRef, {
        lastMessage: lastMsg.text,
        lastMessageTime: lastMsg.timestamp
      })
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Delete message error:", error)
    return { success: false, error: error.message }
  }
}

// Delete entire conversation
export async function deleteConversation(conversationId: string) {
  try {
    // Delete all messages in the conversation
    const messagesRef = collection(db, "conversations", conversationId, "messages")
    const messagesSnapshot = await getDocs(messagesRef)
    
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    // Delete the conversation document
    const conversationRef = doc(db, "conversations", conversationId)
    await deleteDoc(conversationRef)
    
    return { success: true }
  } catch (error: any) {
    console.error("Delete conversation error:", error)
    return { success: false, error: error.message }
  }
}
