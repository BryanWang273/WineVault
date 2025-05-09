"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Share2,
  Star,
  ThermometerSun,
  Utensils,
  Wine,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WineDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [wine, setWine] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tastingNote, setTastingNote] = useState({
    date: new Date().toISOString().split("T")[0],
    rating: "4",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchWineDetails = async () => {
      if (!user || !id) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("tracked_wines")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!data) {
          throw new Error("Wine not found")
        }

        // Transform data to convert snake_case to camelCase
        const transformedWine = {
          ...data,
          agingProgress: data.aging_progress,
          tastingNotes: data.tasting_notes || [],
        }

        setWine(transformedWine)
      } catch (err) {
        console.error("Error fetching wine details:", err)
        setError(err instanceof Error ? err.message : "Failed to load wine details")
        toast({
          title: "Error",
          description: "Failed to load wine details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWineDetails()
  }, [id, user, toast])

  const handleAddTastingNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !wine) return

    try {
      setSubmitting(true)

      // Get current tasting notes
      const currentNotes = wine.tastingNotes || []

      // Add new note
      const newNote = {
        date: tastingNote.date,
        rating: Number.parseFloat(tastingNote.rating),
        notes: tastingNote.notes,
      }

      const updatedNotes = [...currentNotes, newNote]

      // Update in database
      const { error: updateError } = await supabase
        .from("tracked_wines")
        .update({ tasting_notes: updatedNotes })
        .eq("id", wine.id)
        .eq("user_id", user.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Update local state
      setWine({
        ...wine,
        tastingNotes: updatedNotes,
      })

      toast({
        title: "Tasting Note Added",
        description: "Your tasting note has been saved.",
      })

      // Reset form and close dialog
      setTastingNote({
        date: new Date().toISOString().split("T")[0],
        rating: "4",
        notes: "",
      })
      setDialogOpen(false)
    } catch (err) {
      console.error("Error adding tasting note:", err)
      toast({
        title: "Error",
        description: "Failed to add tasting note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Loading wine details...</p>
      </div>
    )
  }

  // Error state
  if (error || !wine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/tracker" className="inline-flex items-center text-[#722F37] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tracker
        </Link>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Wine not found"}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/tracker">Return to Tracker</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/tracker" className="inline-flex items-center text-[#722F37] hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tracker
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Wine Image and Basic Info */}
        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-6">
                <Image
                  src={wine.image || "/placeholder.svg?height=400&width=400&query=wine bottle"}
                  alt={wine.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                      wine.status === "Ready"
                        ? "bg-green-100 text-green-800"
                        : wine.status === "Aging"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {wine.status}
                  </div>
                  <h1 className="text-2xl font-bold">{wine.name}</h1>
                  <div className="text-gray-500">
                    {wine.year} • {wine.region}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div>{wine.type || "Red Wine"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Grape</div>
                    <div>{wine.grape || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Purchase Date</div>
                    <div>{new Date(wine.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Purchase Price</div>
                    <div>${wine.price || "N/A"}</div>
                  </div>
                </div>

                <div className="flex justify-between gap-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Wine className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <form onSubmit={handleAddTastingNote}>
                        <DialogHeader>
                          <DialogTitle>Add Tasting Note</DialogTitle>
                          <DialogDescription>Record your experience with this wine</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="tasting-date">Tasting Date</Label>
                            <Input
                              id="tasting-date"
                              type="date"
                              value={tastingNote.date}
                              onChange={(e) => setTastingNote({ ...tastingNote, date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="rating">Rating</Label>
                            <Select
                              value={tastingNote.rating}
                              onValueChange={(value) => setTastingNote({ ...tastingNote, rating: value })}
                            >
                              <SelectTrigger id="rating">
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 Stars - Exceptional</SelectItem>
                                <SelectItem value="4.5">4.5 Stars - Outstanding</SelectItem>
                                <SelectItem value="4">4 Stars - Very Good</SelectItem>
                                <SelectItem value="3.5">3.5 Stars - Good</SelectItem>
                                <SelectItem value="3">3 Stars - Average</SelectItem>
                                <SelectItem value="2.5">2.5 Stars - Below Average</SelectItem>
                                <SelectItem value="2">2 Stars - Poor</SelectItem>
                                <SelectItem value="1">1 Star - Very Poor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="notes">Tasting Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Describe the appearance, aroma, taste, and finish..."
                              className="min-h-[150px]"
                              value={tastingNote.notes}
                              onChange={(e) => setTastingNote({ ...tastingNote, notes: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-[#722F37] hover:bg-[#5a252c]" disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Note"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wine Details Tabs */}
        <div className="lg:w-2/3">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasting">Tasting Notes</TabsTrigger>
              <TabsTrigger value="storage">Storage & Pairing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-[#722F37]" />
                    Aging Timeline
                  </CardTitle>
                  <CardDescription>Track the aging progress of your wine</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Purchase ({wine.agingProgress.start})</span>
                      <span>Peak Maturity ({wine.agingProgress.peak})</span>
                      <span>Drink By ({wine.agingProgress.end})</span>
                    </div>
                    <Progress value={wine.agingProgress.current} className="h-2" />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Aging Status</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            This wine is currently {wine.status.toLowerCase()} and will reach its peak maturity around{" "}
                            {wine.agingProgress.peak}. Continue to store properly for optimal development.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-[#722F37]" />
                      Important Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Purchase Date</span>
                        <span>{new Date(wine.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Drinking</span>
                        <span>{wine.agingProgress.start}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Peak Maturity</span>
                        <span className="font-medium">{wine.agingProgress.peak}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Drink By</span>
                        <span>{wine.agingProgress.end}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-[#722F37]" />
                      Rating & Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Your Rating</span>
                        <div className="flex">
                          {wine.tastingNotes && wine.tastingNotes.length > 0 ? (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(wine.tastingNotes[wine.tastingNotes.length - 1].rating)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </>
                          ) : (
                            <span>Not rated yet</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Purchase Price</span>
                        <span>${wine.price || "N/A"}</span>
                      </div>
                      {wine.price && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Current Est. Value</span>
                            <span>${Math.round(wine.price * 1.2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Peak Est. Value</span>
                            <span>${Math.round(wine.price * 1.5)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasting" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tasting Notes</CardTitle>
                  <CardDescription>Record your tasting experiences with this wine</CardDescription>
                </CardHeader>
                <CardContent>
                  {wine.tastingNotes && wine.tastingNotes.length > 0 ? (
                    <div className="space-y-6">
                      {wine.tastingNotes.map((note: any, index: number) => (
                        <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">{new Date(note.date).toLocaleDateString()}</div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(note.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600">{note.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No tasting notes yet</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#722F37] hover:bg-[#5a252c]" onClick={() => setDialogOpen(true)}>
                    Add Tasting Note
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="storage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ThermometerSun className="w-5 h-5 mr-2 text-[#722F37]" />
                    Storage Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity
                        around 70%. Keep bottles on their side to keep the cork moist.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">Temperature</div>
                        <div className="text-gray-600">50-59°F (10-15°C)</div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Humidity</div>
                        <div className="text-gray-600">60-70%</div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Light</div>
                        <div className="text-gray-600">Minimal exposure</div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Position</div>
                        <div className="text-gray-600">Horizontal</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium mb-2">Current Storage</div>
                      <div className="bg-blue-50 p-3 rounded-lg text-blue-800">{wine.storage}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-[#722F37]" />
                    Food Pairings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {["Prime Rib", "Lamb Chops", "Aged Cheeses", "Truffle Dishes"].map((pairing, index) => (
                        <div key={index} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                          {pairing}
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pairing Notes</h4>
                      <p className="text-gray-600 text-sm">
                        This wine pairs exceptionally well with rich, savory dishes. The wine's structure and tannins
                        complement red meats, while its complexity enhances dishes with earthy flavors like truffles and
                        aged cheeses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
