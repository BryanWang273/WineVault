import type React from "react"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { WineShopProvider } from "@/lib/wine-shop-context"
import { WineTrackerProvider } from "@/lib/wine-tracker-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WineVault - Premium Wine Marketplace",
  description: "Discover and purchase the finest wines from around the world.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if the current path is an admin route
  const isAdminRoute = typeof window !== "undefined" ? window.location.pathname.startsWith("/admin") : false

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <WineShopProvider>
              <WineTrackerProvider>
                {!isAdminRoute && <Header />}
                <main className={!isAdminRoute ? "min-h-screen" : ""}>{children}</main>
                {!isAdminRoute && <Footer />}
                <Toaster />
              </WineTrackerProvider>
            </WineShopProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
