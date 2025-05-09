"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useWineTracker } from "@/lib/wine-tracker-context"
import { Wine, Plus, Loader2, AlertCircle, Clock, CheckCircle2, Upload, RefreshCw, Eye, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { removeWineFromTracker, markWineAsConsumed } from "@/lib/actions"

export default function TrackerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { trackedWines, isLoading, error, refreshTrackedWines, startTrackingWine, addWineToTracker } = useWineTracker()
  const [activeTab, setActiveTab] = useState("tracking")
  const [untrackedWines, setUntrackedWines] = useState([])
  const [isLoadingUntracked, setIsLoadingUntracked] = useState(true)
  const [processingWineId, setProcessingWineId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddWineDialogOpen, setIsAddWineDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(null)

  const [newWine, setNewWine] = useState({
    name: "",
    vintage: new Date().getFullYear().toString(),
    producer: "",
    type: "red",
    grape: "",
    region: "",
    storage: "Wine Rack",
    price: "",
    notes: "",
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=tracker")
    }
  }, [user, router])

  // Fetch untracked wines
  useEffect(() => {
    const fetchUntrackedWines = async () => {
      if (!user) return

      try {
        setIsLoadingUntracked(true)
        console.log("Fetching untracked wines for user:", user.id)

        // Add a small delay to ensure authentication is fully established
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { data, error } = await supabase
          .from("tracked_wines")
          .select("*")
          .eq("user_id", user.id)
          .eq("tracking_status", "untracked")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching untracked wines:", error)
          throw new Error(error.message)
        }

        console.log(`Fetched ${data?.length || 0} untracked wines`)
        setUntrackedWines(data || [])
      } catch (err) {
        console.error("Error fetching untracked wines:", err)
        toast({
          title: "Error",
          description: "Failed to fetch your untracked wines. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUntracked(false)
      }
    }

    if (user) {
      fetchUntrackedWines()
    }
  }, [user, toast, activeTab])

  const handleStartTracking = async (id) => {
    setProcessingWineId(id)
    const success = await startTrackingWine(id)
    if (success) {
      // Update local state to reflect the change
      setUntrackedWines((prev) => prev.filter((wine) => wine.id !== id))

      // Refresh tracked wines to show the newly tracked wine
      await refreshTrackedWines()

      toast({
        title: "Wine Tracking Started",
        description: "You are now tracking this wine in your collection.",
      })
    }
    setProcessingWineId(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setImageFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddWine = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add wines.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate aging progress
      const currentYear = new Date().getFullYear()
      const vintage = Number.parseInt(newWine.vintage)
      const peakYear = vintage + 10 // Simple estimation
      const endYear = vintage + 20 // Simple estimation


      let imageUrl = "/glass-bottle-on-sand.png"

      if (imagePreview) {
        imageUrl = imagePreview
      }

      const success = await addWineToTracker({
        wine_id: null,
        name: newWine.name,
        region: newWine.region,
        year: newWine.vintage,
        status: currentYear < peakYear ? "Aging" : "Ready",
        storage: newWine.storage,
        agingProgress: {
          start: vintage.toString(),
          peak: peakYear.toString(),
          end: endYear.toString(),
          current: Math.min(100, Math.max(0, ((currentYear - vintage) / (endYear - vintage)) * 100)),
        },
        image: imageUrl,
        price: newWine.price ? Number.parseFloat(newWine.price) : 0,
      })

      if (success) {
        toast({
          title: "Wine Added",
          description: `${newWine.name} has been added to your collection.`,
        })

        // Reset form and close dialog
        setNewWine({
          name: "",
          vintage: new Date().getFullYear().toString(),
          producer: "",
          type: "red",
          grape: "",
          region: "",
          storage: "Wine Rack",
          price: "",
          notes: "",
        })
        setImagePreview(null)
        setImageFile(null)
        setIsAddWineDialogOpen(false)

        // Refresh tracked wines
        await refreshTrackedWines()
      }
    } catch (err) {
      console.error("Error adding wine:", err)
      toast({
        title: "Error",
        description: "Failed to add wine. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefreshUntrackedWines = async () => {
    if (!user) return

    setIsRefreshing(true)
    try {
      console.log("Manually refreshing untracked wines")
      const { data, error } = await supabase
        .from("tracked_wines")
        .select("*")
        .eq("user_id", user.id)
        .eq("tracking_status", "untracked")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error refreshing untracked wines:", error)
        throw new Error(error.message)
      }

      console.log(`Refreshed ${data?.length || 0} untracked wines`)
      setUntrackedWines(data || [])
      toast({
        title: "Refreshed",
        description: "Your untracked wines have been refreshed.",
      })
    } catch (err) {
      console.error("Error refreshing untracked wines:", err)
      toast({
        title: "Error",
        description: "Failed to refresh your untracked wines.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleMarkAsConsumed = async (id: string) => {
    setActionInProgress(id)
    const success = await markWineAsConsumed(id)
    if (success) {
      toast({
        title: "Wine Marked as Consumed",
        description: "The wine has been marked as consumed in your tracker.",
      })
      refreshTrackedWines()
    } else {
      toast({
        title: "Error",
        description: "Failed to mark wine as consumed. Please try again.",
        variant: "destructive",
      })
    }
    setActionInProgress(null)
  }

  const handleRemoveWine = async (id: string) => {
    setActionInProgress(id)
    const success = await removeWineFromTracker(id)
    if (success) {
      toast({
        title: "Wine Removed",
        description: "The wine has been removed from your tracker.",
      })
      refreshTrackedWines()
    } else {
      toast({
        title: "Error",
        description: "Failed to remove wine. Please try again.",
        variant: "destructive",
      })
    }
    setActionInProgress(null)
  }

  // Filter tracked wines
  const trackingWines = trackedWines.filter((wine) => wine.tracking_status === "tracking" || !wine.tracking_status)

  // If not authenticated, show loading state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wine Tracker</h1>
          <p className="text-gray-500 mt-1">Track and manage your wine collection</p>
        </div>

        <Dialog open={isAddWineDialogOpen} onOpenChange={setIsAddWineDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#722F37] hover:bg-[#5a252c]">
              <Plus className="mr-2 h-4 w-4" />
              Add Wine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddWine}>
              <DialogHeader>
                <DialogTitle>Add Wine to Your Collection</DialogTitle>
                <DialogDescription>Enter the details of the wine you want to track.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Wine Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Château Margaux"
                      value={newWine.name}
                      onChange={(e) => setNewWine({ ...newWine, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vintage">Vintage Year</Label>
                    <Input
                      id="vintage"
                      placeholder="e.g. 2015"
                      type="number"
                      value={newWine.vintage}
                      onChange={(e) => setNewWine({ ...newWine, vintage: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producer">Producer/Brand</Label>
                  <Input
                    id="producer"
                    placeholder="e.g. Château Margaux"
                    value={newWine.producer}
                    onChange={(e) => setNewWine({ ...newWine, producer: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Wine Type</Label>
                    <Select value={newWine.type} onValueChange={(value) => setNewWine({ ...newWine, type: value })}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="white">White</SelectItem>
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
                      placeholder="e.g. Cabernet Sauvignon"
                      value={newWine.grape}
                      onChange={(e) => setNewWine({ ...newWine, grape: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    placeholder="e.g. Bordeaux, France"
                    value={newWine.region}
                    onChange={(e) => setNewWine({ ...newWine, region: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage Method</Label>
                    <Select
                      value={newWine.storage}
                      onValueChange={(value) => setNewWine({ ...newWine, storage: value })}
                    >
                      <SelectTrigger id="storage">
                        <SelectValue placeholder="Select storage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wine Cellar">Wine Cellar</SelectItem>
                        <SelectItem value="Wine Fridge">Wine Fridge</SelectItem>
                        <SelectItem value="Wine Rack">Wine Rack</SelectItem>
                        <SelectItem value="Cabinet">Cabinet</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Purchase Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 50"
                      value={newWine.price}
                      onChange={(e) => setNewWine({ ...newWine, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Wine Image</Label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Wine preview"
                            fill
                            className="object-cover"
                          />
                        ) : isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : (
                          <Wine className="h-8 w-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor="image-upload"
                          className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Image"}
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                        <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF, max 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this wine..."
                    value={newWine.notes}
                    onChange={(e) => setNewWine({ ...newWine, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#722F37] hover:bg-[#5a252c]"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Collection"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="tracking">
            Tracking
            {trackingWines.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {trackingWines.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="untracked">
            Untracked
            {untrackedWines.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {untrackedWines.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
              <p className="text-gray-500">Loading your wine collection...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-red-500 font-medium">Error loading your wine collection</p>
              <p className="text-gray-500 mt-2">{error}</p>
              <Button variant="outline" className="mt-4" onClick={refreshTrackedWines}>
                Try Again
              </Button>
            </div>
          ) : trackingWines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <Wine className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700">No wines being tracked</h3>
              <p className="text-gray-500 mt-2 text-center max-w-md">
                Start tracking wines to monitor their aging progress and get recommendations for when they're ready to
                drink.
              </p>
              <div className="mt-6">
                <Button className="bg-[#722F37] hover:bg-[#5a252c]" onClick={() => setIsAddWineDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Wine
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackingWines.map((wine) => (
                <Card key={wine.id} className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={wine.image || "/placeholder.svg?height=300&width=400&query=wine bottle"}
                      alt={wine.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        wine.status === "Ready"
                          ? "bg-green-500"
                          : wine.status === "Aging"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    >
                      {wine.status}
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg line-clamp-1">{wine.name}</h3>
                    <p className="text-sm text-gray-500">
                      {wine.region} • {wine.year}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Aging Progress</span>
                        <span>{Math.round(wine.agingProgress?.current || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            wine.status === "Ready"
                              ? "bg-green-500"
                              : wine.status === "Aging"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${wine.agingProgress?.current || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/tracker/wine/${wine.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleMarkAsConsumed(wine.id)}
                        disabled={actionInProgress === wine.id || wine.tracking_status === "consumed"}
                      >
                        {actionInProgress === wine.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Wine className="h-4 w-4 mr-2" />
                        )}
                        {wine.tracking_status === "consumed" ? "Consumed" : "Mark Consumed"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRemoveWine(wine.id)}
                        disabled={actionInProgress === wine.id}
                      >
                        {actionInProgress === wine.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="untracked" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={handleRefreshUntrackedWines} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {isLoadingUntracked ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
              <p className="text-gray-500">Loading your untracked wines...</p>
            </div>
          ) : untrackedWines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700">No untracked wines</h3>
              <p className="text-gray-500 mt-2 text-center max-w-md">
                All your purchased wines are being tracked. Visit the shop to purchase more wines.
              </p>
              <Link href="/wines" className="mt-6">
                <Button className="bg-[#722F37] hover:bg-[#5a252c]">Shop for Wines</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {untrackedWines.map((wine) => (
                <Card key={wine.id} className="h-full">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={wine.image || "/placeholder.svg?height=300&width=400&query=wine bottle"}
                      alt={wine.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-gray-500">Untracked</Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg line-clamp-1">{wine.name}</h3>
                    <p className="text-sm text-gray-500">
                      {wine.region} • {wine.year}
                    </p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Peak maturity: {wine.aging_progress?.peak || "Unknown"}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-[#722F37] hover:bg-[#5a252c]"
                      onClick={() => handleStartTracking(wine.id)}
                      disabled={processingWineId === wine.id}
                    >
                      {processingWineId === wine.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Start Tracking
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
