"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Clock, CheckCircle, Mail } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { submitSupportMessage, getUserSupportMessages, type SupportMessage } from "@/lib/firebase-support"
import { cn } from "@/lib/utils"

const statusConfig = {
  new: { 
    label: "New", 
    icon: Mail, 
    bg: "bg-blue-600/10 border-blue-500/20", 
    text: "text-blue-400"
  },
  "in-progress": { 
    label: "In Progress", 
    icon: Clock, 
    bg: "bg-yellow-600/10 border-yellow-500/20", 
    text: "text-yellow-400"
  },
  resolved: { 
    label: "Resolved", 
    icon: CheckCircle, 
    bg: "bg-emerald-600/10 border-emerald-500/20", 
    text: "text-emerald-400"
  }
}

export default function SupportPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [myTickets, setMyTickets] = useState<SupportMessage[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportMessage | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  })

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      setContactForm({
        name: user.name || "",
        email: user.email || "",
        message: ""
      })
      
      // Fetch user's support tickets
      fetchMyTickets(user.id)
    }
  }, [])

  const fetchMyTickets = async (userId: string) => {
    setIsLoadingTickets(true)
    const result = await getUserSupportMessages(userId)
    if (result.success) {
      setMyTickets(result.messages)
    }
    setIsLoadingTickets(false)
  }

  const faqs = [
    {
      id: "1",
      question: "How do I verify my account?",
      answer: "Go to Profile Settings and upload a government-issued ID. Our admin team will review and verify your account within 24-48 hours."
    },
    {
      id: "2",
      question: "How does ride matching work?",
      answer: "Our smart algorithm matches you with riders heading in the same direction based on your location, destination, and travel time preferences."
    },
    {
      id: "3",
      question: "How do I split ride costs?",
      answer: "After completing a ride, the app automatically calculates the fair split based on distance and number of passengers. Payment is handled through the app."
    },
    {
      id: "4",
      question: "What if I need to cancel a ride?",
      answer: "You can cancel a ride up to 2 hours before departure without penalty. Go to your ride details and tap 'Cancel Ride'."
    },
    {
      id: "5",
      question: "How do I report a safety concern?",
      answer: "Go to Privacy & Safety settings and tap 'Report a User'. You can also contact support directly for urgent safety issues."
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    const result = await submitSupportMessage(
      contactForm.name,
      contactForm.email,
      contactForm.message,
      currentUser?.id
    )

    if (result.success) {
      toast({
        title: "Message sent",
        description: "Our support team will get back to you within 24 hours"
      })
      
      setContactForm({ ...contactForm, message: "" })
      
      // Refresh tickets
      if (currentUser?.id) {
        fetchMyTickets(currentUser.id)
      }
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send message",
        variant: "destructive"
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-8">Help & Support</h1>

        {/* My Tickets Section */}
        {myTickets.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">My Support Tickets</h2>
            <div className="space-y-3">
              {myTickets.map((ticket) => {
                const status = statusConfig[ticket.status]
                const StatusIcon = status.icon
                const hasReplies = ticket.replies && ticket.replies.length > 0
                
                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl bg-zinc-900 border border-white/5 p-4 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold", status.bg, status.text)}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                          {hasReplies && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold">
                              <MessageCircle className="w-3 h-3" />
                              {ticket.replies.length} {ticket.replies.length === 1 ? "reply" : "replies"}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300 line-clamp-2 mb-2">{ticket.message}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(ticket.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-xl bg-zinc-900 border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-sm font-semibold text-white">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Form */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={5}
                placeholder="Describe your issue or question..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>

        {/* Report Issue Button */}
        <div className="mt-6">
          <button
            onClick={() => toast({
              title: "Report submitted",
              description: "Thank you for reporting this issue"
            })}
            className="w-full py-3 rounded-xl bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 text-sm font-semibold text-red-400 transition-colors"
          >
            Report an Issue
          </button>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTicket(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Support Ticket</h2>
                <div className="flex items-center gap-2">
                  {(() => {
                    const status = statusConfig[selectedTicket.status]
                    const StatusIcon = status.icon
                    return (
                      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold", status.bg, status.text)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    )
                  })()}
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-2">Submitted</p>
                <p className="text-sm text-white">
                  {new Date(selectedTicket.createdAt).toLocaleString("en-US", {
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
                <p className="text-xs text-zinc-500 mb-2">Your Message</p>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Replies Section */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Admin Replies</p>
                  {selectedTicket.replies.map((reply) => (
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

              {selectedTicket.resolvedAt && (
                <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-xl p-4">
                  <p className="text-xs text-emerald-400 mb-1">Resolved</p>
                  <p className="text-sm text-white">
                    {new Date(selectedTicket.resolvedAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}

              {!selectedTicket.replies || selectedTicket.replies.length === 0 ? (
                <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-400 font-medium">Waiting for admin response</p>
                  <p className="text-xs text-zinc-400 mt-1">Our support team will reply within 24 hours</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
