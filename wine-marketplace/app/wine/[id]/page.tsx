"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share2, Star, Clock, ThermometerSun, Check, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/cart-context"
import { useWineTracker } from "@/lib/wine-tracker-context"
import { supabase, type Wine } from "@/lib/supabase"

export default function WineDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState("1")
  const [addedToWishlist, setAddedToWishlist] = useState(false)
  const [addedToTracker, setAddedToTracker] = useState(false)
  const [wine, setWine] = useState<Wine | null>(null)
  const [relatedWines, setRelatedWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()
  const { addToCart } = useCart()
  const { addWineToTracker } = useWineTracker()

  // Fetch wine data from Supabase
  useEffect(() => {
    const fetchWineData = async () => {
      setLoading(true)
      setError(null)

      try {
        const wineId = Number.parseInt(params.id)

        // Fetch the specific wine
        const { data: wineData, error: wineError } = await supabase.from("wines").select("*").eq("id", wineId).single()

        if (wineError) {
          throw new Error(`Error fetching wine: ${wineError.message}`)
        }

        if (!wineData) {
          throw new Error("Wine not found")
        }

        // Transform data to match our Wine type
        const transformedWine: Wine = {
          id: wineData.id,
          name: wineData.name,
          region: wineData.region,
          year: wineData.year,
          price: wineData.price,
          rating: wineData.rating,
          reviewCount: wineData.review_count,
          ageWorthy: wineData.age_worthy,
          description: wineData.description,
          tastingNotes: wineData.tasting_notes,
          agingPotential: wineData.aging_potential,
          storageRecommendations: wineData.storage_recommendations,
          foodPairings: wineData.food_pairings || [],
          image: wineData.image,
          images: wineData.images || [wineData.image],
          type: wineData.type,
          grape: wineData.grape,
        }

        setWine(transformedWine)

        // Fetch related wines (same type, excluding current wine)
        const { data: relatedData, error: relatedError } = await supabase
          .from("wines")
          .select("*")
          .eq("type", wineData.type)
          .neq("id", wineId)
          .limit(4)

        if (relatedError) {
          console.error("Error fetching related wines:", relatedError)
          // Don't throw here, just log the error and continue
        }

        if (relatedData && relatedData.length > 0) {
          // Transform related wines data
          const transformedRelated = relatedData.map((wine) => ({
            id: wine.id,
            name: wine.name,
            region: wine.region,
            year: wine.year,
            price: wine.price,
            rating: wine.rating,
            reviewCount: wine.review_count,
            ageWorthy: wine.age_worthy,
            description: wine.description,
            tastingNotes: wine.tasting_notes,
            agingPotential: wine.aging_potential,
            storageRecommendations: wine.storage_recommendations,
            foodPairings: wine.food_pairings || [],
            image: wine.image,
            images: wine.images || [wine.image],
            type: wine.type,
            grape: wine.grape,
          }))

          setRelatedWines(transformedRelated)
        }
      } catch (err) {
        console.error("Error:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: "Failed to load wine details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWineData()
  }, [params.id, toast])

  const handleAddToCart = () => {
    if (!wine) return

    addToCart({
      id: wine.id,
      name: wine.name,
      price: wine.price,
      image: wine.image,
      quantity: Number.parseInt(quantity),
      year: wine.year,
      region: wine.region,
    })

    toast({
      title: "Added to cart",
      description: `${wine.name} has been added to your cart.`,
    })
  }

  const handleAddToWishlist = () => {
    setAddedToWishlist(true)
    toast({
      title: "Added to wishlist",
      description: `${wine?.name} has been added to your wishlist.`,
    })
  }

  const handleAddToTracker = () => {
    if (!wine) return

    addWineToTracker({
      id: wine.id,
      name: wine.name,
      region: wine.region,
      year: wine.year,
      price: wine.price,
      image: wine.image,
      status: wine.agingPotential.drinkFrom > new Date().getFullYear() ? "Aging" : "Ready",
      storage: "Wine Rack",
      agingProgress: {
        start: wine.agingPotential.drinkFrom.toString(),
        peak: wine.agingPotential.peakMaturity.toString(),
        end: wine.agingPotential.drinkUntil.toString(),
        current: calculateAgingProgress(
          wine.agingPotential.drinkFrom,
          wine.agingPotential.peakMaturity,
          wine.agingPotential.drinkUntil,
        ),
      },
    })

    setAddedToTracker(true)
    toast({
      title: "Added to tracker",
      description: `${wine.name} has been added to your aging tracker.`,
    })
  }

  // Calculate aging progress percentage
  function calculateAgingProgress(start: number, peak: number, end: number) {
    const currentYear = new Date().getFullYear()
    const totalYears = end - start
    const yearsPassed = currentYear - start

    if (yearsPassed <= 0) return 0
    if (yearsPassed >= totalYears) return 100

    return Math.round((yearsPassed / totalYears) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
      </div>
    )
  }

  if (error || !wine) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wine Not Found</h2>
          <p className="mb-6 text-gray-600">{error || "The wine you're looking for could not be found."}</p>
          <Link href="/wines">
            <Button>Browse All Wines</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Wine Images */}
        <div className="lg:w-1/2">
          <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
            <Image src={wine.image || "/placeholder.svg"} alt={wine.name} fill className="object-cover" priority />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {wine.images.map((image, index) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${wine.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Wine Details */}
        <div className="lg:w-1/2">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">
              {wine.region} | {wine.year}
            </div>
            <h1 className="text-3xl font-bold mb-2">{wine.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(wine.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{wine.rating}</span>
              <span className="text-sm text-gray-500">({wine.reviewCount} reviews)</span>
            </div>
            <div className="text-2xl font-bold mb-6">${wine.price}</div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="flex-1 bg-[#722F37] hover:bg-[#5a252c]" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleAddToWishlist} disabled={addedToWishlist}>
                  {addedToWishlist ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added to Wishlist
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Wishlist
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#722F37] mt-0.5" />
                <div>
                  <h3 className="font-medium">Aging Potential</h3>
                  <p className="text-sm text-gray-600">
                    Drink from {wine.agingPotential.drinkFrom} to {wine.agingPotential.drinkUntil}, with peak maturity
                    around {wine.agingPotential.peakMaturity}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ThermometerSun className="w-5 h-5 text-[#722F37] mt-0.5" />
                <div>
                  <h3 className="font-medium">Storage Recommendations</h3>
                  <p className="text-sm text-gray-600">{wine.storageRecommendations}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Food Pairings</h3>
                <div className="flex flex-wrap gap-2">
                  {wine.foodPairings.map((pairing, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                      {pairing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  variant="link"
                  className="text-[#722F37] p-0 h-auto"
                  onClick={handleAddToTracker}
                  disabled={addedToTracker}
                >
                  {addedToTracker ? "Added to Aging Tracker" : "Add to Aging Tracker"}
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="description">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1">
                Description
              </TabsTrigger>
              <TabsTrigger value="tasting" className="flex-1">
                Tasting Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="text-sm text-gray-600 mt-4 leading-relaxed">
              {wine.description}
            </TabsContent>
            <TabsContent value="tasting" className="text-sm text-gray-600 mt-4 leading-relaxed">
              {wine.tastingNotes}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Wines */}
      {relatedWines.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedWines.map((relatedWine) => (
              <Link
                key={relatedWine.id}
                href={`/wine/${relatedWine.id}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <Image
                    src={relatedWine.image || "/placeholder.svg"}
                    alt={relatedWine.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-1">{relatedWine.region}</div>
                  <h3 className="font-medium group-hover:text-[#722F37] transition-colors">{relatedWine.name}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-bold">${relatedWine.price}</span>
                    <div className="text-sm text-gray-500">{relatedWine.year}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
