"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Clock, CheckCircle, AlertCircle, X, Eye } from "lucide-react"
import { AdminSidebarLayout } from "@/components/admin-sidebar-layout"
import { getAllSupportMessages, updateSupportMessageStatus, addSupportReply, type SupportMessage } from "@/lib/firebase-support"

const statusConfig = {
  new: { 
    label: "New", 
    icon: Mail, 
    bg: "bg-blue-600/10 border-blue-500/20", 
    text: "text-blue-400",
    badge: "bg-blue-500"
  },
  "in-progress": { 
    label: "In Progress", 
    icon: Clock, 
    bg: "bg-yellow-600/10 border-yellow-500/20", 
    text: "text-yellow-400",
    badge: "bg-yellow-500"
  },
  resolved: { 
    label: "Resolved", 
    icon: CheckCircle, 
    bg: "bg-emerald-600/10 border-emerald-500/20", 
    text: "text-emerald-400",
    badge: "bg-emerald-500"
  }
}

export default function AdminSupportPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "in-progress" | "resolved">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("admin_token") !== "true") {
      router.push("/admin/login")
    } else {
      setIsAuthorized(true)
      fetchMessages()
    }
  }, [router])

  const fetchMessages = async () => {
    setIsLoading(true)
    const result = await getAllSupportMessages()
    if (result.success) {
      setMessages(result.messages)
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (messageId: string, newStatus: "new" | "in-progress" | "resolved") => {
    setUpdatingId(messageId)
    
    const result = await updateSupportMessageStatus(messageId, newStatus)
    
    if (result.success) {
      setMessages(messages.map(m => 
        m.id === messageId 
          ? { ...m, status: newStatus, resolvedAt: newStatus === "resolved" ? new Date().toISOString() : m.resolvedAt }
          : m
      ))
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ 
          ...selectedMessage, 
          status: newStatus,
          resolvedAt: newStatus === "resolved" ? new Date().toISOString() : selectedMessage.resolvedAt
        })
      }
    }
    
    setUpdatingId(null)
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return
    
    setIsSendingReply(true)
    
    const result = await addSupportReply(
      selectedMessage.id,
      "Admin Support",
      replyText.trim(),
      selectedMessage.userId
    )
    
    if (result.success) {
      // Update local state
      const newReply = {
        id: Date.now().toString(),
        adminName: "Admin Support",
        message: replyText.trim(),
        createdAt: new Date().toISOString()
      }
      
      const updatedMessage = {
        ...selectedMessage,
        replies: [...(selectedMessage.replies || []), newReply],
        status: "in-progress" as const
      }
      
      setSelectedMessage(updatedMessage)
      setMessages(messages.map(m => m.id === selectedMessage.id ? updatedMessage : m))
      setReplyText("")
    } else {
      alert("Failed to send reply: " + result.error)
    }
    
    setIsSendingReply(false)
  }

  const filteredMessages = messages.filter(m => 
    filterStatus === "all" ? true : m.status === filterStatus
  )

  const newCount = messages.filter(m => m.status === "new").length
  const inProgressCount = messages.filter(m => m.status === "in-progress").length
  const resolvedCount = messages.filter(m => m.status === "resolved").length

  if (!isAuthorized) return null

  return (
    <AdminSidebarLayout>
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token")
              router.push("/admin/login")
            }}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Support Messages</h1>
            <p className="text-sm text-zinc-500">
              {messages.length} total messages · {newCount} new
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-xs text-zinc-400 uppercase tracking-wider">New</p>
            </div>
            <p className="text-2xl font-bold">{newCount}</p>
          </div>
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <p className="text-xs text-zinc-400 uppercase tracking-wider">In Progress</p>
            </div>
            <p className="text-2xl font-bold">{inProgressCount}</p>
          </div>
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs text-zinc-400 uppercase tracking-wider">Resolved</p>
            </div>
            <p className="text-2xl font-bold">{resolvedCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { value: "all", label: "All Messages" },
            { value: "new", label: "New" },
            { value: "in-progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No messages found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => {
              const status = statusConfig[message.status]
              const StatusIcon = status.icon
              const isUpdating = updatingId === message.id

              return (
                <div
                  key={message.id}
                  className="bg-zinc-900 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-bold text-white">{message.name}</h3>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mb-1">{message.email}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(message.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>

                  <p className="text-sm text-zinc-300 mb-4 line-clamp-2">{message.message}</p>

                  <div className="flex items-center gap-2">
                    {message.status !== "in-progress" && (
                      <button
                        onClick={() => handleStatusChange(message.id, "in-progress")}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-600/20 text-yellow-400 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "..." : "Mark In Progress"}
                      </button>
                    )}
                    {message.status !== "resolved" && (
                      <button
                        onClick={() => handleStatusChange(message.id, "resolved")}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "..." : "Mark Resolved"}
                      </button>
                    )}
                    {message.status === "resolved" && message.resolvedAt && (
                      <span className="text-xs text-zinc-500">
                        Resolved on {new Date(message.resolvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMessage(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Support Message</h2>
                <div className="flex items-center gap-2">
                  {(() => {
                    const status = statusConfig[selectedMessage.status]
                    const StatusIcon = status.icon
                    return (
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    )
                  })()}
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-1">From</p>
                <p className="text-sm font-semibold text-white">{selectedMessage.name}</p>
                <p className="text-sm text-zinc-400">{selectedMessage.email}</p>
                {selectedMessage.userId && (
                  <p className="text-xs text-zinc-500 mt-2">User ID: {selectedMessage.userId}</p>
                )}
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-2">Submitted</p>
                <p className="text-sm text-white">
                  {new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-2">Message</p>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Replies Section */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Replies</p>
                  {selectedMessage.replies.map((reply) => (
                    <div key={reply.id} className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-blue-400">{reply.adminName}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(reply.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {selectedMessage.status !== "resolved" && (
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Send Reply</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the user..."
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                    rows={4}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isSendingReply}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSendingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reply"
                    )}
                  </button>
                </div>
              )}

              {selectedMessage.resolvedAt && (
                <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-xl p-4">
                  <p className="text-xs text-emerald-400 mb-1">Resolved</p>
                  <p className="text-sm text-white">
                    {new Date(selectedMessage.resolvedAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedMessage.status !== "in-progress" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedMessage.id, "in-progress")
                    }}
                    disabled={updatingId === selectedMessage.id}
                    className="flex-1 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedMessage.status !== "resolved" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedMessage.id, "resolved")
                    }}
                    disabled={updatingId === selectedMessage.id}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminSidebarLayout>
  )
}
