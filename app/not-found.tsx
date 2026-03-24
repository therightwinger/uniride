import Link from "next/link"
import { Zap, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              UniRide
            </span>
          </Link>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent mb-4">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Page not found
        </h2>

        <p className="text-zinc-400 max-w-md mx-auto mb-8">
          Oops! It looks like you&apos;ve taken a wrong turn. 
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Back Button */}
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}
