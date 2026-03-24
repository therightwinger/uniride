"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { onAuthStateChange, getCurrentUserProfile, UserProfile } from "@/lib/firebase-auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        const profile = await getCurrentUserProfile(firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
