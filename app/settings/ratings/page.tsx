"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, MessageSquare, X } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"

export default function RatingsPage() {
  useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const userRating = currentUser?.rating || 0
  const totalRides = currentUser?.totalRides || 0
  const reviews = currentUser?.reviews || []

  const handleSubmitFeedback = () => {
    if (feedbackRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!"
    })
    setShowFeedbackModal(false)
    setFeedbackText("")
    setFeedbackRating(0)
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

        <h1 className="text-2xl font-bold mb-8">Ratings & Trust</h1>

        {/* Rating Summary */}
        <div className="mb-8 p-6 rounded-xl bg-zinc-900 border border-white/5">
          {totalRides > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-bold">{userRating.toFixed(1)}</div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(userRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-400">{totalRides} total rides</p>
                </div>
              </div>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Give Feedback
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex gap-1 justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-zinc-600" />
                ))}
              </div>
              <p className="text-sm text-zinc-400 mb-1">No ratings yet</p>
              <p className="text-xs text-zinc-500">Complete rides to receive ratings</p>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Reviews from Others</h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{review.name}</p>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-zinc-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">{review.date}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-zinc-900 border border-white/5 text-center">
              <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 mb-1">No reviews yet</p>
              <p className="text-xs text-zinc-500">Reviews from your rides will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Give Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Your Rating</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= feedbackRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Comments (Optional)</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/5 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleSubmitFeedback}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
