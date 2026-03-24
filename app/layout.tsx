import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'UniRide - Share Rides, Save Money, Travel Together',
  description: 'Connect with verified riders heading your way. Split costs, reduce emissions, and make every journey count.',
  keywords: ['ride sharing', 'university', 'carpooling', 'students', 'travel'],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-[#0a0a0a] text-white" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
