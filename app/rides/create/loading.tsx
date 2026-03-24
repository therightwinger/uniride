export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
