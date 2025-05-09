"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShoppingBag, Wine, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useWineTracker } from "@/lib/wine-tracker-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PurchasedWine = {
  id: string
  wine_id: number | null
  name: string
  region: string
  year: string | number
  price: number
  quantity: number
  image: string
  order_id: string
  purchase_date: string
}

type OrderGroup = {
  order_id: string
  purchase_date: string
  wines: PurchasedWine[]
  total: number
}

export default function PurchaseHistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { addToCart } = useCart()
  const { addWineToTracker } = useWineTracker()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [addingToTracker, setAddingToTracker] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=purchase-history")
      return
    }

    const fetchPurchaseHistory = async () => {
      try {
        console.log("Fetching purchase history for user:", user.id)

        const { data, error } = await supabase
          .from("purchased_wines")
          .select("*")
          .eq("user_id", user.id)
          .order("purchase_date", { ascending: false })

        if (error) {
          console.error("Error fetching purchase history:", error)
          throw error
        }

        console.log("Purchase history data:", data)

        // Group by order_id
        const orderMap = new Map<string, OrderGroup>()

        if (data && data.length > 0) {
          data.forEach((wine: PurchasedWine) => {
            if (!orderMap.has(wine.order_id)) {
              orderMap.set(wine.order_id, {
                order_id: wine.order_id,
                purchase_date: wine.purchase_date,
                wines: [],
                total: 0,
              })
            }

            const order = orderMap.get(wine.order_id)!
            order.wines.push(wine)
            order.total += wine.price * wine.quantity
          })

          setOrders(Array.from(orderMap.values()))
        } else {
          console.log("No purchase history found")
          setOrders([])
        }
      } catch (err) {
        console.error("Error fetching purchase history:", err)
        setError("Failed to load purchase history")
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [user, router])

  const handleRepurchase = (wine: PurchasedWine) => {
    addToCart({
      id: wine.wine_id || 0,
      name: wine.name,
      price: wine.price,
      image: wine.image,
      quantity: 1,
      year: wine.year,
      region: wine.region,
    })

    toast({
      title: "Added to cart",
      description: `${wine.name} has been added to your cart.`,
    })
  }

  const handleAddToTracker = async (wine: PurchasedWine) => {
    setAddingToTracker((prev) => ({ ...prev, [wine.id]: true }))

    try {
      // Calculate aging potential based on wine type
      const currentYear = new Date().getFullYear()
      const vintage = typeof wine.year === "string" ? Number.parseInt(wine.year) : wine.year
      const isAgeWorthy = wine.price > 100 // Simple heuristic for demo

      const peakYear = isAgeWorthy ? vintage + 10 : vintage + 3
      const endYear = isAgeWorthy ? vintage + 20 : vintage + 5

      const success = await addWineToTracker({
        wine_id: wine.wine_id, // This is the reference to the original wine
        name: wine.name,
        region: wine.region,
        year: wine.year,
        price: wine.price,
        image: wine.image,
        status: currentYear < peakYear ? "Aging" : "Ready",
        storage: "Wine Rack", // Default storage
        agingProgress: {
          start: vintage.toString(),
          peak: peakYear.toString(),
          end: endYear.toString(),
          current: Math.min(100, Math.max(0, ((currentYear - vintage) / (endYear - vintage)) * 100)),
        },
      })

      if (success) {
        toast({
          title: "Added to tracker",
          description: `${wine.name} has been added to your aging tracker.`,
        })
      }
    } catch (err) {
      console.error("Error adding wine to tracker:", err)
      toast({
        title: "Error",
        description: "Failed to add wine to tracker. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToTracker((prev) => ({ ...prev, [wine.id]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Loading your purchase history...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Purchase History</h1>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">No purchases yet</h2>
          <p className="text-gray-500 mb-6">You haven't made any purchases yet.</p>
          <Link href="/wines">
            <Button className="bg-[#722F37] hover:bg-[#5a252c]">Browse Wines</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.order_id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Order #{order.order_id}</CardTitle>
                    <CardDescription>{formatDate(order.purchase_date)}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {order.wines.map((wine) => (
                    <div key={wine.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 relative rounded overflow-hidden shrink-0">
                        <Image src={wine.image || "/placeholder.svg"} alt={wine.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{wine.name}</h3>
                        <p className="text-sm text-gray-500">
                          {wine.year} • {wine.region} • Qty: {wine.quantity}
                        </p>
                        <p className="text-sm font-medium">${wine.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleAddToTracker(wine)}
                          disabled={addingToTracker[wine.id]}
                        >
                          {addingToTracker[wine.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Wine className="h-4 w-4 mr-1" />
                          )}
                          Add to Tracker
                        </Button>
                        <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleRepurchase(wine)}>
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Buy Again
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
