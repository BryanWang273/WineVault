"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Wine, ShoppingCart, BarChart3 } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState("")

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

    // Set current path for active state in navigation
    setCurrentPath(window.location.pathname)
  }, [user, isLoading, router, isAdmin])

  // Show loading state while checking authentication
  if (isLoading || !user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
      </div>
    )
  }

  const isActive = (path: string) => {
    if (path === "/admin" && currentPath === "/admin") {
      return true
    }
    if (path !== "/admin" && currentPath.startsWith(path)) {
      return true
    }
    return false
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <nav className="flex flex-col space-y-1">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isActive("/admin") ? "bg-muted hover:bg-muted" : ""}`}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/wines">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isActive("/admin/wines") ? "bg-muted hover:bg-muted" : ""}`}
                >
                  <Wine className="mr-2 h-4 w-4" />
                  Wines
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isActive("/admin/orders") ? "bg-muted hover:bg-muted" : ""}`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Orders
                </Button>
              </Link>
            </nav>
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
