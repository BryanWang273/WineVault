"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isLoading) {
      if (!user) {
        router.push("/login?redirect=admin")
      } else if (!isAdmin()) {
        // Redirect non-admin users to tracker
        router.push("/tracker")
      }
    }
  }, [user, isLoading, router, isAdmin])

  // Show loading state while checking authentication
  if (isLoading || !user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
      </div>
    )
  }

  // Render children only if user is authenticated and is an admin
  return <>{children}</>
}
