"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, MapPin, Calendar, Wine, Star, Upload } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    avatar_url: "",
  })
  const [consumedWines, setConsumedWines] = useState([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true)

        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError)
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          })
        }

        // Fetch consumed wines
        const { data: wineData, error: wineError } = await supabase
          .from("tracked_wines")
          .select("*")
          .eq("user_id", user.id)
          .eq("tracking_status", "consumed")
          .order("created_at", { ascending: false })

        if (wineError) {
          console.error("Error fetching consumed wines:", wineError)
        }

        // Initialize profile data - ensure all values are strings to avoid controlled/uncontrolled input issues
        setProfileData({
          full_name: profileData?.full_name || user?.user_metadata?.full_name || "",
          bio: profileData?.bio || "",
          address: profileData?.address || "",
          city: profileData?.city || "",
          state: profileData?.state || "",
          zip_code: profileData?.zip_code || "",
          phone: profileData?.phone || "",
          avatar_url: profileData?.avatar_url || user?.user_metadata?.avatar_url || "",
        })

        setConsumedWines(wineData || [])
      } catch (error) {
        console.error("Error in profile data fetch:", error)
        toast({
          title: "Error",
          description: "Something went wrong while loading your profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user, router, toast])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    if (!user) return

    try {
      setSaving(true)

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        updated_at: new Date().toISOString(),
        ...profileData,
      })

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploadingImage(true)

      // Create a unique file path
      const fileExt = file.name.split(".").pop()
      const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("user-content").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("user-content").getPublicUrl(filePath)

      if (!publicUrlData?.publicUrl) throw new Error("Failed to get public URL")

      // Update profile with new avatar URL
      const newAvatarUrl = publicUrlData.publicUrl
      setProfileData({
        ...profileData,
        avatar_url: newAvatarUrl,
      })

      // Save to database
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      })

      if (updateError) throw updateError

      toast({
        title: "Image Uploaded",
        description: "Your profile picture has been updated",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  // Safe getter functions to ensure we never pass undefined to controlled inputs
  const getFullName = () => profileData.full_name || ""
  const getBio = () => profileData.bio || ""
  const getAddress = () => profileData.address || ""
  const getCity = () => profileData.city || ""
  const getState = () => profileData.state || ""
  const getZipCode = () => profileData.zip_code || ""
  const getPhone = () => profileData.phone || ""
  const getAvatarUrl = () => profileData.avatar_url || ""
  const getEmail = () => user?.email || ""
  const getCreatedAt = () => (user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A")

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="consumed">Consumed Wines</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={getAvatarUrl() || "/placeholder.svg"} alt={getFullName()} />
                    <AvatarFallback className="text-2xl bg-[#722F37] text-white">
                      {getFullName()
                        ? getFullName().charAt(0).toUpperCase()
                        : getEmail()
                          ? getEmail().charAt(0).toUpperCase()
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-[#722F37] text-white p-2 rounded-full hover:bg-[#5a252c] transition-colors">
                        {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <h2 className="text-xl font-semibold">{getFullName() || "Wine Enthusiast"}</h2>
                <p className="text-gray-500">{getEmail()}</p>

                <div className="w-full space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Member since {getCreatedAt()}</span>
                  </div>
                  {getAddress() && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {getCity()}, {getState()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Wine className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{consumedWines.length} wines consumed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={getFullName()}
                          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={getEmail()} disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself and your wine preferences..."
                        className="min-h-[100px]"
                        value={getBio()}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      />
                    </div>

                    <Separator />
                    <h3 className="font-medium">Contact Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={getPhone()}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={getAddress()}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={getCity()}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={getState()}
                          onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          value={getZipCode()}
                          onChange={(e) => setProfileData({ ...profileData, zip_code: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#722F37] hover:bg-[#5a252c]" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consumed">
          <Card>
            <CardHeader>
              <CardTitle>Consumed Wines</CardTitle>
              <CardDescription>Your wine tasting journey</CardDescription>
            </CardHeader>
            <CardContent>
              {consumedWines.length > 0 ? (
                <div className="space-y-6">
                  {consumedWines.map((wine) => (
                    <div
                      key={wine.id}
                      className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0 last:pb-0"
                    >
                      <div className="md:w-1/4 lg:w-1/6">
                        <div className="aspect-square relative rounded-md overflow-hidden">
                          <Image
                            src={wine.image || "/placeholder.svg?height=200&width=200&query=wine bottle"}
                            alt={wine.name || "Wine"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{wine.name || "Unnamed Wine"}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              Consumed
                            </Badge>
                            <span className="text-sm text-gray-500">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {wine.created_at ? new Date(wine.created_at).toLocaleDateString() : "Unknown date"}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 mb-2">
                          {wine.year || "N/A"} • {wine.type || "Unknown type"} • {wine.region || "Unknown region"}
                        </div>

                        {wine.tasting_notes && Array.isArray(wine.tasting_notes) && wine.tasting_notes.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-sm mb-1">Your Notes:</h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => {
                                    const lastNote = wine.tasting_notes[wine.tasting_notes.length - 1]
                                    const rating = lastNote && typeof lastNote.rating === "number" ? lastNote.rating : 0

                                    return (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        }`}
                                      />
                                    )
                                  })}
                                </div>
                                <span className="text-xs ml-2 text-gray-500">
                                  {wine.tasting_notes[wine.tasting_notes.length - 1]?.date
                                    ? new Date(
                                        wine.tasting_notes[wine.tasting_notes.length - 1].date,
                                      ).toLocaleDateString()
                                    : "No date"}
                                </span>
                              </div>
                              <p className="text-sm">
                                {wine.tasting_notes[wine.tasting_notes.length - 1]?.notes || "No notes provided"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wine className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No consumed wines yet</h3>
                  <p className="text-gray-500">
                    When you mark wines as consumed in your tracker, they will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
