"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, ArrowLeft, Upload, X, Plus } from "lucide-react"
import Link from "next/link"

export default function NewWinePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wineData, setWineData] = useState({
    name: "",
    type: "",
    region: "",
    year: "",
    price: "",
    rating: 4.5,
    reviewCount: 0,
    ageWorthy: false,
    description: "",
    tastingNotes: "",
    agingPotential: {
      drinkFrom: new Date().getFullYear(),
      peakMaturity: new Date().getFullYear() + 5,
      drinkUntil: new Date().getFullYear() + 10,
    },
    storageRecommendations: "",
    foodPairings: [],
    grape: "",
  })
  const [foodPairing, setFoodPairing] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [additionalImageFiles, setAdditionalImageFiles] = useState([])

  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setWineData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAgingPotentialChange = (field, value) => {
    setWineData((prev) => ({
      ...prev,
      agingPotential: {
        ...prev.agingPotential,
        [field]: Number.parseInt(value, 10),
      },
    }))
  }

  const handleAddFoodPairing = () => {
    if (foodPairing.trim()) {
      setWineData((prev) => ({
        ...prev,
        foodPairings: [...prev.foodPairings, foodPairing.trim()],
      }))
      setFoodPairing("")
    }
  }

  const handleRemoveFoodPairing = (index) => {
    setWineData((prev) => ({
      ...prev,
      foodPairings: prev.foodPairings.filter((_, i) => i !== index),
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // Add to files array
      setAdditionalImageFiles((prev) => [...prev, ...files])

      // Create previews
      const newPreviews = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(newPreviews).then((previews) => {
        setAdditionalImages((prev) => [...prev, ...previews])
      })
    }
  }

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Update the handleSubmit function to better handle RLS errors
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!wineData.name || !wineData.type || !wineData.region || !wineData.year || !wineData.price) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Upload main image if provided
      let mainImageUrl = "/elegant-wine-bottle.png"
      if (imageFile) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from("wine-images")
          .upload(`${Date.now()}-${imageFile.name}`, imageFile)

        if (imageError) {
          throw new Error(`Error uploading main image: ${imageError.message}`)
        }

        mainImageUrl = supabase.storage.from("wine-images").getPublicUrl(imageData.path).data.publicUrl
      }

      // Upload additional images if provided
      const additionalImageUrls = []
      for (const file of additionalImageFiles) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from("wine-images")
          .upload(`${Date.now()}-${file.name}`, file)

        if (imageError) {
          console.error(`Error uploading additional image: ${imageError.message}`)
          continue
        }

        additionalImageUrls.push(supabase.storage.from("wine-images").getPublicUrl(imageData.path).data.publicUrl)
      }

      // Prepare wine data for insertion
      const wineForInsertion = {
        name: wineData.name,
        type: wineData.type.toLowerCase(),
        region: wineData.region,
        year: wineData.year,
        price: Number.parseFloat(wineData.price),
        rating: wineData.rating,
        review_count: wineData.reviewCount,
        age_worthy: wineData.ageWorthy,
        description: wineData.description,
        tasting_notes: wineData.tastingNotes,
        aging_potential: wineData.agingPotential,
        storage_recommendations: wineData.storageRecommendations,
        food_pairings: wineData.foodPairings,
        image: mainImageUrl,
        images: [mainImageUrl, ...additionalImageUrls],
        grape: wineData.grape,
      }

      // Insert wine into database
      const { data, error } = await supabase.from("wines").insert([wineForInsertion]).select()

      if (error) {
        if (error.message.includes("row-level security policy")) {
          throw new Error(
            "Permission denied: You don't have permission to add wines. Please check your database RLS policies.",
          )
        } else {
          throw new Error(`Error inserting wine: ${error.message}`)
        }
      }

      toast({
        title: "Wine added",
        description: "The wine has been successfully added to your inventory.",
      })

      // Redirect to wines management page
      router.push("/admin/wines")
    } catch (error) {
      console.error("Error adding wine:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add wine. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/wines" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Add New Wine</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details about the wine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Wine Name *</Label>
                <Input id="name" name="name" value={wineData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Wine Type *</Label>
                  <Select
                    value={wineData.type}
                    onValueChange={(value) => setWineData((prev) => ({ ...prev, type: value }))}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red Wine</SelectItem>
                      <SelectItem value="white">White Wine</SelectItem>
                      <SelectItem value="sparkling">Sparkling</SelectItem>
                      <SelectItem value="rose">Rosé</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grape">Grape Variety</Label>
                  <Input
                    id="grape"
                    name="grape"
                    value={wineData.grape}
                    onChange={handleInputChange}
                    placeholder="e.g. Cabernet Sauvignon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    name="region"
                    value={wineData.region}
                    onChange={handleInputChange}
                    placeholder="e.g. Bordeaux, France"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    value={wineData.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 2015"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={wineData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={wineData.rating}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ageWorthy"
                  checked={wineData.ageWorthy}
                  onCheckedChange={(checked) => setWineData((prev) => ({ ...prev, ageWorthy: checked }))}
                />
                <Label htmlFor="ageWorthy">Age-worthy wine</Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload images of the wine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Wine preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="main-image"
                      className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Main Image
                    </Label>
                    <Input
                      id="main-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF, max 5MB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <div className="grid grid-cols-3 gap-2">
                  {additionalImages.map((image, index) => (
                    <div key={index} className="relative w-full aspect-square border rounded-md overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Additional ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveAdditionalImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Label
                    htmlFor="additional-images"
                    className="flex flex-col items-center justify-center w-full aspect-square border border-dashed rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-6 w-6 text-gray-300 mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
                  </Label>
                  <Input
                    id="additional-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleAdditionalImageChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description and Tasting Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Description & Tasting Notes</CardTitle>
              <CardDescription>Provide detailed information about the wine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={wineData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tastingNotes">Tasting Notes</Label>
                <Textarea
                  id="tastingNotes"
                  name="tastingNotes"
                  value={wineData.tastingNotes}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageRecommendations">Storage Recommendations</Label>
                <Textarea
                  id="storageRecommendations"
                  name="storageRecommendations"
                  value={wineData.storageRecommendations}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aging Potential and Food Pairings */}
          <Card>
            <CardHeader>
              <CardTitle>Aging & Pairings</CardTitle>
              <CardDescription>Set aging potential and food pairings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aging Potential</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="drinkFrom" className="text-xs">
                      Drink From
                    </Label>
                    <Input
                      id="drinkFrom"
                      type="number"
                      value={wineData.agingPotential.drinkFrom}
                      onChange={(e) => handleAgingPotentialChange("drinkFrom", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="peakMaturity" className="text-xs">
                      Peak Maturity
                    </Label>
                    <Input
                      id="peakMaturity"
                      type="number"
                      value={wineData.agingPotential.peakMaturity}
                      onChange={(e) => handleAgingPotentialChange("peakMaturity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="drinkUntil" className="text-xs">
                      Drink Until
                    </Label>
                    <Input
                      id="drinkUntil"
                      type="number"
                      value={wineData.agingPotential.drinkUntil}
                      onChange={(e) => handleAgingPotentialChange("drinkUntil", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Food Pairings</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {wineData.foodPairings.map((pairing, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
                    >
                      <span>{pairing}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => handleRemoveFoodPairing(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={foodPairing}
                    onChange={(e) => setFoodPairing(e.target.value)}
                    placeholder="e.g. Grilled Steak"
                  />
                  <Button type="button" variant="outline" onClick={handleAddFoodPairing}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link href="/admin/wines">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-[#722F37] hover:bg-[#5a252c]" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Wine"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
