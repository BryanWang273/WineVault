"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("shipping")
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  })
  const [paymentMethod, setPaymentMethod] = useState("credit-card")

  const { cartItems, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=checkout")
    }
  }, [user, router])

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart")
    }
  }, [cartItems, router])

  const shipping = 15
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setActiveTab("payment")
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      // Navigate to success page - wines will be saved there
      router.push("/checkout/success")
    }, 2000)
  }

  if (!user || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="payment" disabled={activeTab === "shipping"}>
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </CardHeader>
                <form onSubmit={handleShippingSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={shippingInfo.country}
                          onValueChange={(value) => setShippingInfo({ ...shippingInfo, country: value })}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-[#722F37] hover:bg-[#5a252c]">
                      Continue to Payment
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose how you want to pay</CardDescription>
                </CardHeader>
                <form onSubmit={handlePaymentSubmit}>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Credit or Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal">PayPal</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "credit-card" && (
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            value={paymentInfo.cardName}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={paymentInfo.expiryDate}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={paymentInfo.cvv}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "paypal" && (
                      <div className="bg-blue-50 p-4 rounded-md text-center">
                        <p className="text-sm text-blue-700">
                          You will be redirected to PayPal to complete your payment after reviewing your order.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-[#722F37] hover:bg-[#5a252c]" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 relative rounded overflow-hidden shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.year} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md text-sm">
                <p className="font-medium mb-1">Note:</p>
                <p className="text-gray-600">
                  All purchased wines will be automatically added to your collection as untracked wines. You'll be able
                  to start tracking them from your wine tracker dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
