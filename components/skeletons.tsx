import { cn } from "@/lib/utils"

export function RideCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-3 w-24 bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
      </div>

      {/* Route */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-zinc-800" />
          <div className="h-4 w-48 bg-zinc-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-zinc-800" />
          <div className="h-4 w-40 bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-3 w-24 bg-zinc-800 rounded" />
        <div className="h-3 w-20 bg-zinc-800 rounded" />
      </div>

      {/* Button */}
      <div className="h-10 w-full bg-zinc-800 rounded-xl" />
    </div>
  )
}

export function RideDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-8 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="h-10 w-24 bg-zinc-800 rounded-lg mb-6" />

        {/* Main card */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8">
          {/* Driver info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-zinc-800 rounded" />
              <div className="h-4 w-24 bg-zinc-800 rounded" />
            </div>
          </div>

          {/* Route */}
          <div className="space-y-4 mb-6">
            <div className="h-6 w-48 bg-zinc-800 rounded" />
            <div className="h-6 w-40 bg-zinc-800 rounded" />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-zinc-800 rounded-xl" />
            <div className="h-20 bg-zinc-800 rounded-xl" />
            <div className="h-20 bg-zinc-800 rounded-xl" />
            <div className="h-20 bg-zinc-800 rounded-xl" />
          </div>

          {/* Button */}
          <div className="h-12 w-full bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-zinc-900 border border-white/5 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-zinc-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-zinc-800 rounded" />
        <div className="h-3 w-48 bg-zinc-800 rounded" />
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-5 h-5 rounded-full bg-zinc-800 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-zinc-800 rounded" />
          <div className="h-3 w-full bg-zinc-800 rounded" />
          <div className="h-3 w-24 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-8 animate-pulse">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-zinc-800 rounded" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="h-24 bg-zinc-900 rounded-xl" />
          <div className="h-24 bg-zinc-900 rounded-xl" />
          <div className="h-24 bg-zinc-900 rounded-xl" />
        </div>

        {/* Info cards */}
        <div className="space-y-4">
          <div className="h-32 bg-zinc-900 rounded-xl" />
          <div className="h-32 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
