"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { getClientSupabase } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Skip auth for not-found page and auth pages
  const isAuthExemptPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/update-password" ||
    pathname === "/not-found"

  useEffect(() => {
    // Skip auth for exempt pages
    if (isAuthExemptPage) {
      setIsLoading(false)
      return
    }

    try {
      const supabase = getClientSupabase()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        if (event === "SIGNED_IN" && pathname === "/signin") {
          router.push("/")
        }
        if (event === "SIGNED_OUT") {
          router.push("/signin")
        }
      })

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // Redirect if not authenticated
        if (!session && !isAuthExemptPage) {
          router.push("/signin")
        }
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.error("Auth provider error:", error)
      setIsLoading(false)
    }
  }, [pathname, router, isAuthExemptPage])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getClientSupabase()
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        throw error
      }
      // Session and user will be updated by the onAuthStateChange listener
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in")
      console.error(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getClientSupabase()
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        throw error
      }
      router.push("/signin?message=Check your email to confirm your account")
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
      console.error(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getClientSupabase()
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // Session and user will be updated by the onAuthStateChange listener
    } catch (error: any) {
      setError(error.message || "An error occurred during sign out")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
