"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"

type OrderItem = {
  id: string | number
  name: string
  price: number
  quantity: number
  image?: string
  year?: string | number
  region?: string
}

type Order = {
  id: string
  order_number: string
  user_id: string
  total_amount: number
  status: string
  items: OrderItem[]
  created_at: string
  shipping_address?: {
    name: string
    email: string
    [key: string]: any
  }
  payment_method?: string
  user_email?: string
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [updating, setUpdating] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/admin/orders/" + params.id)
    }
  }, [user, router, params.id])

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("orders").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error("Order not found")
        }

        // Get user email in a separate query
        let userEmail = "Unknown"
        if (data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("email")
            .eq("id", data.user_id)
            .single()

          if (!userError && userData) {
            userEmail = userData.email
          }
        }

        const orderWithEmail = {
          ...data,
          user_email: userEmail,
        }

        setOrder(orderWithEmail)
        setStatus(orderWithEmail.status)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("Failed to load order details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrderDetails()
    }
  }, [user, params.id])

  const updateOrderStatus = async () => {
    if (!order) return

    try {
      setUpdating(true)
      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id)

      if (error) {
        throw error
      }

      // Update local state
      setOrder((prev) => (prev ? { ...prev, status } : null))
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Failed to update order status. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "shipped":
        return <Badge className="bg-purple-500">Shipped</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Order Not Found</h3>
            <p className="text-sm text-amber-700 mt-1">The requested order could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order #{order.order_number}</CardTitle>
                <CardDescription>
                  Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </div>
              {getStatusBadge(order.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 border-b pb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="text-sm text-gray-500">
                            {item.year && <span>Year: {item.year} • </span>}
                            {item.region && <span>Region: {item.region}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.price)}</div>
                          <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span>Included</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500 block">Name</span>
                  <span>{order.shipping_address?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Email</span>
                  <span>{order.user_email || order.shipping_address?.email || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-[#722F37] hover:bg-[#5a252c]"
                  onClick={updateOrderStatus}
                  disabled={updating || status === order.status}
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500 block">Payment Method</span>
                  <span>{order.payment_method || "Credit Card"}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Payment Status</span>
                  <Badge className="bg-green-500">Paid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
