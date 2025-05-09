"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { login, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const { success, error, role } = await login(email, password)

      if (success) {
        toast({
          title: "Login successful",
          description: role === "admin" ? "Welcome to the admin dashboard!" : "Welcome back to WineVault!",
        })

        // Redirect based on user role
        if (role === "admin") {
          router.push("/admin")
        } else {
          // Default to tracker for customers
          router.push(redirect || "/tracker")
        }
      } else {
        setErrorMessage(error || "Invalid email or password")
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link href="/signup" className="font-medium text-[#722F37] hover:underline">
                create a new account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="focus-visible:ring-[#722F37]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="focus-visible:ring-[#722F37]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-[#722F37] hover:bg-[#5a252c]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/classic-wine-cellar.png"
          alt="Wine cellar"
          fill
        />
      </div>
    </div>
  )
}
