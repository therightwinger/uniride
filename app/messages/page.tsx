"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Send, MessageCircle, Plus, Search, X } from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { 
  getUserConversations, 
  getOrCreateConversation, 
  sendMessage, 
  subscribeToMessages,
  markMessagesAsRead,
  type Conversation,
  type Message
} from "@/lib/firebase-messages"
import { getRideById } from "@/lib/firebase-rides"
import { getAllUsers } from "@/lib/firebase-admin"

function timeAgo(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `About ${hrs} hour${hrs > 1 ? "s" : ""} ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch { return "" }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch { return "" }
}

function MessagesPageContent() {
  useAuthGuard()
  const searchParams = useSearchParams()
  const rideIdFromUrl = searchParams.get("ride")

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) return
    const user = JSON.parse(userStr)
    setCurrentUser(user)

    // Fetch user conversations
    const fetchConversations = async () => {
      const result = await getUserConversations(user.id)
      if (result.success) {
        setConversations(result.conversations)
      }
    }

    fetchConversations()

    // Handle ride-based conversation creation
    if (rideIdFromUrl) {
      const createConversation = async () => {
        const rideResult = await getRideById(rideIdFromUrl)
        if (rideResult.success && rideResult.ride) {
          const ride = rideResult.ride
          if (ride.driverId !== user.id) {
            const convResult = await getOrCreateConversation(
              user.id,
              ride.driverId,
              user.name,
              ride.driver.name,
              rideIdFromUrl
            )
            if (convResult.success && convResult.conversation) {
              setActiveConv(convResult.conversation)
              // Refresh conversations list
              fetchConversations()
            }
          }
        }
      }
      createConversation()
    }
  }, [rideIdFromUrl])

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return

    const unsubscribe = subscribeToMessages(activeConv.id, (newMessages) => {
      setMessages(newMessages)
    })

    // Mark messages as read
    if (currentUser) {
      markMessagesAsRead(activeConv.id, currentUser.id)
    }

    return () => unsubscribe()
  }, [activeConv, currentUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || !currentUser) return
    setIsSending(true)

    const result = await sendMessage(
      activeConv.id,
      currentUser.id,
      currentUser.name,
      newMessage.trim()
    )

    if (result.success) {
      setNewMessage("")
    }

    setIsSending(false)
  }

  const otherName = (conv: Conversation) => {
    if (!currentUser) return ""
    const otherUserId = conv.participants.find(id => id !== currentUser.id)
    return otherUserId ? conv.participantNames[otherUserId] : "User"
  }

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const unreadCount = (conv: Conversation) => {
    if (!currentUser) return 0
    return conv.unreadCount?.[currentUser.id] || 0
  }

  const getRideLabel = (conv: Conversation) => {
    // For now, just show "Ride Conversation" - could be enhanced to fetch ride details
    return conv.rideId ? "Ride Conversation" : "Chat"
  }

  /* ── Active chat view ── */
  if (activeConv) {
    return (
      <SidebarLayout>
        <div className="h-screen bg-[#0a0a0a] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#0f0f0f]">
            <button
              onClick={() => setActiveConv(null)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials(otherName(activeConv))}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm">{otherName(activeConv)}</p>
              <p className="text-xs text-zinc-500 truncate">{getRideLabel(activeConv)}</p>
            </div>
          </div>

          {/* Messages */}
          <main className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-zinc-600 py-16">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id
              return (
                <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                    isMine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                  )}>
                    <p>{msg.text}</p>
                    <p className={cn("text-[10px] mt-1", isMine ? "text-blue-200 text-right" : "text-zinc-500")}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </main>

          {/* Input */}
          <div className="px-6 py-4 border-t border-white/5 bg-[#0f0f0f] flex gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-all shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  /* ── Conversation list ── */
  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0a0a0a] px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Chat with your co-travelers</p>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-zinc-400 mb-1">No conversations yet</p>
            <p className="text-sm">Book a ride to start messaging the driver.</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {conversations.map((conv) => {
              const other = otherName(conv)
              const unread = unreadCount(conv)
              const lastMsg = conv.lastMessage
              const lastTime = conv.lastMessageTime

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 transition-all text-left"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                      {initials(other)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-900" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-white truncate">{otherName(conv)}</p>
                      {lastTime && (
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide shrink-0 ml-2">
                          {timeAgo(lastTime)}
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-zinc-400 truncate">{lastMsg}</p>
                    )}
                    <p className="text-[11px] text-zinc-600 truncate mt-0.5">Re: {getRideLabel(conv)}</p>
                  </div>

                  {/* Unread badge */}
                  {unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-white">{unread}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}


export default function MessagesPage() {
  return (
    <Suspense fallback={
      <SidebarLayout>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </SidebarLayout>
    }>
      <MessagesPageContent />
    </Suspense>
  )
}
