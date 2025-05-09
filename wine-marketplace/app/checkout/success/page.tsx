"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useWineTracker } from "@/lib/wine-tracker-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function CheckoutSuccessPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { cartItems, clearCart } = useCart()
  const { addUntrackedWineToCollection, refreshTrackedWines } = useWineTracker()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [orderNumber] = useState(`WV-${Math.floor(100000 + Math.random() * 900000)}`)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login")
      router.push("/login?redirect=checkout/success")
      return
    }

    // Only process once to prevent duplicate inserts on page refresh
    if (processingComplete) {
      console.log("Processing already complete, skipping")
      setIsProcessing(false)
      return
    }

    const saveWinesToCollection = async () => {
      try {
        setIsProcessing(true)
        setSaveSuccess(false)
        const debug: any = { steps: [] }

        // Get cart items from localStorage in case the page was refreshed
        let items = cartItems
        if (items.length === 0) {
          debug.steps.push("Cart empty, checking localStorage")
          const savedCart = localStorage.getItem("wineCart")
          if (savedCart) {
            try {
              items = JSON.parse(savedCart)
              debug.steps.push(`Retrieved ${items.length} items from localStorage`)
              console.log("Retrieved items from localStorage:", items)
            } catch (e) {
              console.error("Failed to parse cart from localStorage:", e)
              debug.steps.push("Failed to parse cart from localStorage")
              setError("Failed to process your order items. Could not parse cart data.")
              setIsProcessing(false)
              return
            }
          }
        } else {
          debug.steps.push(`Found ${items.length} items in cart state`)
        }

        if (!items || items.length === 0) {
          console.error("No items found in cart")
          debug.steps.push("No items found in cart")
          setError("No items found in cart. Your purchase could not be recorded.")
          setIsProcessing(false)
          return
        }

        console.log("Preparing to save purchased wines:", items)
        setTotalCount(items.length)
        debug.itemCount = items.length

        // Calculate current date
        const purchaseDate = new Date().toISOString()
        let successCount = 0

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => {
          const price = typeof item.price === "number" ? item.price : Number.parseFloat(item.price || "0")
          const quantity = item.quantity || 1
          return sum + price * quantity
        }, 0)
        debug.totalAmount = totalAmount

        // Verify authentication before proceeding
        debug.steps.push("Verifying authentication")
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData.session) {
          console.error("Authentication error:", sessionError || "No active session")
          debug.steps.push("Authentication error: " + (sessionError?.message || "No active session"))
          setError("Authentication error. Please log in again.")
          setIsProcessing(false)
          setDebugInfo(debug)
          return
        }
        debug.steps.push("Authentication verified")
        debug.userId = user.id

        // Step 1: Create order record in orders table
        try {
          debug.steps.push("Creating order record")
          console.log("Creating order with user_id:", user.id)

          // Prepare order data
          const orderData = {
            user_id: user.id,
            order_number: orderNumber,
            total_amount: totalAmount,
            status: "completed",
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
              image: item.image,
              year: item.year,
              region: item.region,
            })),
            shipping_address: {
              name: user.user_metadata?.full_name || "Customer",
              email: user.email,
            },
            payment_method: "Credit Card",
          }
          debug.orderData = { ...orderData, items: `${orderData.items.length} items` }

          // First attempt - standard insert
          const { data: insertedOrder, error: orderError } = await supabase.from("orders").insert([orderData]).select()

          if (orderError) {
            console.error("Error creating order (attempt 1):", orderError)
            debug.steps.push("Error creating order (attempt 1): " + orderError.message)

            // Second attempt - try with explicit auth header
            debug.steps.push("Trying second attempt with session token")
            const token = sessionData.session.access_token

            const { data: secondAttemptOrder, error: secondAttemptError } = await supabase
              .from("orders")
              .insert([orderData])
              .select()
              .auth(token)

            if (secondAttemptError) {
              console.error("Error creating order (attempt 2):", secondAttemptError)
              debug.steps.push("Error creating order (attempt 2): " + secondAttemptError.message)

              // Continue with adding wines to collection even if order creation fails
              debug.steps.push("Skipping order creation due to errors, proceeding with adding wines")
            } else {
              console.log("Order created successfully on second attempt:", secondAttemptOrder)
              debug.steps.push("Order created successfully on second attempt")
              setOrderCreated(true)
              debug.orderCreated = true
            }
          } else {
            console.log("Order created successfully on first attempt:", insertedOrder)
            debug.steps.push("Order created successfully on first attempt")
            setOrderCreated(true)
            debug.orderCreated = true
          }
        } catch (orderErr) {
          console.error("Exception when creating order:", orderErr)
          debug.steps.push(
            "Exception when creating order: " + (orderErr instanceof Error ? orderErr.message : String(orderErr)),
          )
          // Continue with adding wines to collection even if order creation fails
        }

        // Step 2: Add each wine to tracked_wines table with tracking_status="untracked"
        debug.steps.push("Starting to add wines to tracked_wines table")
        const wineResults = []

        // Process each item in the cart, including handling multiple quantities
        for (const item of items) {
          const wineResult: any = { name: item.name }
          const quantity = item.quantity || 1

          // Calculate aging potential based on wine type
          const currentYear = new Date().getFullYear()
          const vintage = typeof item.year === "string" ? Number.parseInt(item.year) : item.year || currentYear - 2
          const isAgeWorthy = item.price > 50 // Simple heuristic

          const peakYear = isAgeWorthy ? vintage + 10 : vintage + 3
          const endYear = isAgeWorthy ? vintage + 20 : vintage + 5

          try {
            // Create the base wine data object
            const wineData = {
              wine_id: typeof item.id === "number" ? item.id : null,
              name: item.name,
              region: item.region || "Unknown",
              year: item.year || currentYear - 2,
              price: typeof item.price === "number" ? item.price : Number.parseFloat(item.price || "0"),
              image: item.image || "/placeholder.svg",
              status: currentYear < peakYear ? "Aging" : "Ready",
              storage: "Not specified", // Default storage
              aging_progress: {
                start: vintage.toString(),
                peak: peakYear.toString(),
                end: endYear.toString(),
                current: Math.min(100, Math.max(0, ((currentYear - vintage) / (endYear - vintage)) * 100)),
              },
            }

            wineResult.data = { ...wineData, aging_progress: "object" }
            wineResult.quantity = quantity

            // Add the wine to the collection for each quantity
            let successfulAdds = 0
            for (let i = 0; i < quantity; i++) {
              const success = await addUntrackedWineToCollection(wineData, user.id)
              if (success) {
                successfulAdds++
              }
            }

            if (successfulAdds > 0) {
              successCount += successfulAdds
              wineResult.status = `added ${successfulAdds} of ${quantity}`
            } else {
              wineResult.status = "failed"
            }
          } catch (wineErr) {
            console.error(`Error adding wine ${item.name}:`, wineErr)
            wineResult.error = wineErr instanceof Error ? wineErr.message : String(wineErr)
            wineResult.status = "error"
          }

          wineResults.push(wineResult)
        }

        debug.wineResults = wineResults
        debug.steps.push(`Added ${successCount} wines to collection`)

        setSavedCount(successCount)
        setSaveSuccess(successCount > 0)
        debug.savedCount = successCount
        debug.saveSuccess = successCount > 0

        // Only clear the cart after successful database insertion
        if (successCount > 0) {
          clearCart()
          localStorage.removeItem("wineCart")
          debug.steps.push("Cart cleared")
        }

        // Mark processing as complete to prevent duplicate inserts on page refresh
        setProcessingComplete(true)
        debug.processingComplete = true

        // Refresh tracked wines to ensure the untracked tab is updated
        await refreshTrackedWines()
        debug.steps.push("Tracked wines refreshed")

        setDebugInfo(debug)
      } catch (err) {
        console.error("Error in saveWinesToCollection:", err)
        setError(`Unexpected error: ${err instanceof Error ? err.message : "Failed to save wines"}`)
        setDebugInfo({
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        })
      } finally {
        setIsProcessing(false)
      }
    }

    // Add a small delay to ensure authentication is fully established
    setTimeout(() => {
      saveWinesToCollection()
    }, 1000) // Increased delay to ensure auth is ready
  }, [
    user,
    router,
    cartItems,
    clearCart,
    orderNumber,
    addUntrackedWineToCollection,
    refreshTrackedWines,
    processingComplete,
  ])

  if (isProcessing) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Finalizing your order...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Card className={error ? "border-red-100" : "border-green-100"}>
          <CardHeader className="text-center">
            {error ? (
              <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            ) : (
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            )}
            <CardTitle className="text-2xl">{error ? "Order Issue" : "Order Confirmed!"}</CardTitle>
            <CardDescription>
              {error ? "There was a problem with your order" : "Thank you for your purchase"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Order Number:</p>
              <p className="font-medium">{orderNumber}</p>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : saveSuccess ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                <h4 className="font-medium text-green-700 mb-1">Success!</h4>
                <p className="text-sm text-green-600">
                  Your purchase has been successfully recorded. {savedCount} of {totalCount} wines have been added to
                  your collection.
                </p>
                {!orderCreated && (
                  <p className="text-sm text-amber-600 mt-2">
                    Note: Your order details couldn't be saved to our system, but your wines have been added to your
                    collection.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                We've sent a confirmation email to your registered email address. Your wines are ready to be tracked.
              </p>
            )}

            <div className="bg-[#722F37]/10 p-4 rounded-md">
              <p className="text-sm text-[#722F37] font-medium">
                {error
                  ? "You can still browse your wines and track your collection."
                  : "Your wines have been added to your collection as 'untracked'. Visit your tracker to start tracking them."}
              </p>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="text-xs text-gray-500 mt-4 border border-gray-200 p-2 rounded">
                <summary>Debug Information</summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-60">{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/tracker" className="w-full">
              <Button className="w-full bg-[#722F37] hover:bg-[#5a252c]">Go to Wine Tracker</Button>
            </Link>
            <Link href="/wines" className="w-full">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            {error && (
              <Link href="/contact" className="w-full">
                <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                  Contact Support
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
