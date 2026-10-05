"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

type UserWithRole = User & {
  role?: string
}

type AuthContextType = {
  user: UserWithRole | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAdmin: () => boolean
  isCustomer: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Only app_metadata counts: unlike user_metadata, users cannot edit it themselves.
  // The database policies in sql/admin-role-policies.sql check the same claim.
  const determineUserRole = (currentUser: User): string => {
    return currentUser.app_metadata?.role === "admin" ? "admin" : "customer"
  }

  // Update user with role
  const updateUserWithRole = (currentUser: User) => {
    if (!currentUser) return null

    const role = determineUserRole(currentUser)
    const userWithRole: UserWithRole = {
      ...currentUser,
      role,
    }

    setUser(userWithRole)
    return userWithRole
  }

  // Check for session on initial load
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)

      // Get session from Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error fetching session:", error)
      } else if (session) {
        setSession(session)
        updateUserWithRole(session.user)
      }

      setIsLoading(false)
    }

    fetchSession()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session?.user) {
        updateUserWithRole(session.user)
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Determine user role and update user state
      const userWithRole = updateUserWithRole(data.user)
      const role = userWithRole?.role || "customer"

      return { success: true, role }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)

      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "customer", // Default role for new signups
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions to check user roles
  const isAdmin = () => {
    return user?.role === "admin"
  }

  const isCustomer = () => {
    return user?.role === "customer" || !user?.role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        signup,
        logout,
        isLoading,
        isAdmin,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
