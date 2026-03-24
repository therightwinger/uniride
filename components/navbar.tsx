"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Menu, X, User } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              UniRide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Login
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <div className="flex flex-col gap-4">
              <Link 
                href="/login" 
                className="text-zinc-400 hover:text-white transition-colors py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <button className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function DashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              UniRide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/rides" 
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Browse Rides
            </Link>
            <Link 
              href="/rides/create" 
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Offer Ride
            </Link>
            <Link 
              href="/messages" 
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Messages
            </Link>
            <Link 
              href="/profile" 
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Profile
            </Link>
          </div>

          {/* User Avatar */}
          <div className="hidden md:flex items-center">
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <div className="flex flex-col gap-4">
              <Link 
                href="/rides" 
                className="text-zinc-400 hover:text-white transition-colors py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Browse Rides
              </Link>
              <Link 
                href="/rides/create" 
                className="text-zinc-400 hover:text-white transition-colors py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Offer Ride
              </Link>
              <Link 
                href="/messages" 
                className="text-zinc-400 hover:text-white transition-colors py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Messages
              </Link>
              <Link 
                href="/profile" 
                className="text-zinc-400 hover:text-white transition-colors py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
