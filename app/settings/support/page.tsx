"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { submitSupportMessage } from "@/lib/firebase-support"

export default function SupportPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
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
    }
  }, [])

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
    </div>
  )
}
