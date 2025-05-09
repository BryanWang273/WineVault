"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState("")
  const [isPromoApplied, setIsPromoApplied] = useState(false)

  const shipping = 15
  const discount = isPromoApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + shipping - discount

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setIsPromoApplied(true)
      toast({
        title: "Promo code applied",
        description: "10% discount has been applied to your order.",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please enter a valid promo code.",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout.",
      })
      router.push("/login?redirect=cart")
      return
    }

    // Proceed to checkout page
    router.push("/checkout")
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added any wines to your cart yet. Explore our collection and find your perfect wine.
        </p>
        <Link href="/wines">
          <Button className="bg-[#722F37] hover:bg-[#5a252c]">Browse Wines</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-20 h-20 relative rounded overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/wine/${item.id}`} className="font-medium hover:text-[#722F37]">
                        {item.name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {item.year} • {item.region}
                      </div>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => router.push("/wines")}>
              Continue Shopping
            </Button>
            <Button variant="outline" className="text-red-600" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order before checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              {isPromoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 border-t flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={isPromoApplied}
                  />
                  <Button variant="outline" onClick={handleApplyPromo} disabled={isPromoApplied || !promoCode}>
                    Apply
                  </Button>
                </div>
                {isPromoApplied && <p className="text-xs text-green-600 mt-1">Promo code "WELCOME10" applied!</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-[#722F37] hover:bg-[#5a252c]" onClick={handleCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
