import Link from "next/link"
import { 
  Zap,
  Shield,
  CreditCard,
  Leaf,
  Clock,
  Star,
  MapPin,
  ChevronDown,
  ArrowRight,
  Users
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Shield,
    color: "bg-blue-600",
    title: "Sign Up & Verify",
    description: "Create your account and upload a government ID. Our admin team verifies your identity to keep everyone safe.",
  },
  {
    number: "02",
    icon: MapPin,
    color: "bg-cyan-500",
    title: "Post or Find a Ride",
    description: "Heading somewhere? Create a ride with your destination, time, and available seats. Looking for a ride? Browse nearby options matched to your route.",
  },
  {
    number: "03",
    icon: Users,
    color: "bg-purple-500",
    title: "Match & Connect",
    description: "Our smart matching finds co-travelers near you heading the same way. Chat in-app to finalize pickup details.",
  },
  {
    number: "04",
    icon: CreditCard,
    color: "bg-emerald-500",
    title: "Ride & Save",
    description: "Share the journey, split the cost, and rate each other afterwards. It's that simple.",
  },
]

const features = [
  { icon: Shield,   color: "bg-blue-900/50 text-blue-400",   title: "ID Verified",   description: "Every user goes through identity verification" },
  { icon: CreditCard, color: "bg-emerald-900/50 text-emerald-400", title: "Save Money",  description: "Split ride costs fairly among co-travelers" },
  { icon: Leaf,     color: "bg-green-900/50 text-green-400", title: "Eco Friendly", description: "Fewer cars, less traffic, lower emissions" },
  { icon: Clock,    color: "bg-cyan-900/50 text-cyan-400",   title: "Real-Time",    description: "Live matching and in-app chat for coordination" },
  { icon: Star,     color: "bg-yellow-900/50 text-yellow-400", title: "Rated Users", description: "Transparent ratings build community trust" },
  { icon: MapPin,   color: "bg-purple-900/50 text-purple-400", title: "Smart Routes", description: "Geolocation matching finds the best ride near you" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
          <Zap className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4">UniRide</h1>
        <p className="text-zinc-400 text-base max-w-xs mb-10 leading-relaxed">
          Share rides, split costs, and travel together. The smart way to commute.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link 
            href="/login"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/register"
            className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-semibold text-sm transition-all flex items-center justify-center"
          >
            Create Account
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
          {[
            { icon: Shield, label: "ID Verified" },
            { icon: Users, label: "Cost Sharing" },
            { icon: MapPin, label: "Smart Matching" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-xs text-zinc-400">
              <Icon className="w-3 h-3 text-blue-400" />
              {label}
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 flex flex-col items-center gap-1 text-zinc-600">
          <span className="text-xs">Learn more</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 max-w-lg mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 text-center mb-14">
          How UniRide Works
        </p>

        <div className="space-y-10">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="flex gap-5">
                {/* Icon + line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-white/5 mt-3" />
                  )}
                </div>
                {/* Text */}
                <div className="pb-10">
                  <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mb-1">
                    Step {step.number}
                  </p>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Why UniRide ── */}
      <section className="py-20 px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 text-center mb-14">
          Why Choose UniRide
        </p>
        <div className="grid grid-cols-2 gap-10 max-w-md mx-auto">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to ride together?</h2>
        <p className="text-sm text-zinc-500 mb-8">Join thousands of commuters saving money every day.</p>
        <Link 
          href="/register"
          className="inline-flex flex-row items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all"
        >
          Join UniRide <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
