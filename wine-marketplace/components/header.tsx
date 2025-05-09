"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, ShoppingCart, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { cartItems } = useCart()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/wines?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-[#722F37]">
            WineVault
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium ${isActive("/") ? "text-[#722F37]" : "text-gray-600 hover:text-[#722F37]"}`}
            >
              Home
            </Link>
            <Link
              href="/wines"
              className={`text-sm font-medium ${isActive("/wines") ? "text-[#722F37]" : "text-gray-600 hover:text-[#722F37]"}`}
            >
              Shop
            </Link>
            <Link
              href="/tracker"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/tracker" ? "text-black dark:text-white" : "text-muted-foreground",
              )}
            >
              Tracker
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium ${isActive("/about") ? "text-[#722F37]" : "text-gray-600 hover:text-[#722F37]"}`}
            >
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search wines..."
                className="pl-10 h-9 focus-visible:ring-[#722F37]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#722F37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Log out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#722F37] hover:bg-[#5a252c]">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#722F37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search wines..."
                className="pl-10 h-9 focus-visible:ring-[#722F37]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <nav className="flex flex-col space-y-4">
              <Link href="/" className={`text-sm font-medium ${isActive("/") ? "text-[#722F37]" : "text-gray-600"}`}>
                Home
              </Link>
              <Link
                href="/wines"
                className={`text-sm font-medium ${isActive("/wines") ? "text-[#722F37]" : "text-gray-600"}`}
              >
                Shop
              </Link>
              <Link
                href="/tracker"
                className={`text-sm font-medium ${isActive("/tracker") ? "text-[#722F37]" : "text-gray-600"}`}
              >
                Aging Tracker
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium ${isActive("/about") ? "text-[#722F37]" : "text-gray-600"}`}
              >
                About
              </Link>
            </nav>
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
              {user ? (
                <>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full">
                      My Profile
                    </Button>
                  </Link>
                  <Button className="w-full bg-[#722F37] hover:bg-[#5a252c]" onClick={logout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-[#722F37] hover:bg-[#5a252c]">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
