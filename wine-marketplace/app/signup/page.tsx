"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function SignupPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ageVerified, setAgeVerified] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { signup, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match")
      return
    }

    if (!ageVerified || !termsAccepted) {
      setErrorMessage("Please confirm your age and accept the terms of service")
      return
    }

    try {
      const fullName = `${firstName} ${lastName}`
      const { success, error } = await signup(email, password, fullName)

      if (success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully! Please verify your email to continue.",
        })
        router.push("/login")
      } else {
        setErrorMessage(error || "Could not create your account. Please try again.")
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
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#722F37] hover:underline">
                Sign in
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      First name
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="first-name"
                        name="first-name"
                        type="text"
                        autoComplete="given-name"
                        required
                        className="focus-visible:ring-[#722F37]"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="last-name"
                        name="last-name"
                        type="text"
                        autoComplete="family-name"
                        required
                        className="focus-visible:ring-[#722F37]"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

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
                      autoComplete="new-password"
                      required
                      className="focus-visible:ring-[#722F37]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="focus-visible:ring-[#722F37]"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="age-verification"
                    checked={ageVerified}
                    onCheckedChange={(checked) => setAgeVerified(checked as boolean)}
                    required
                  />
                  <Label htmlFor="age-verification" className="ml-2 block text-sm text-gray-900">
                    I confirm that I am 21 years of age or older
                  </Label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    required
                  />
                  <Label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{" "}
                    <Link href="/terms" className="font-medium text-[#722F37] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-medium text-[#722F37] hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-[#722F37] hover:bg-[#5a252c]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
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
          src="/wine-tasting-setup.png"
          alt="Wine tasting"
          fill
        />
      </div>
    </div>
  )
}
