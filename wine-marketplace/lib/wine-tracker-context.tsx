"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, type TrackedWine, checkSupabaseConnection } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

type WineTrackerContextType = {
  trackedWines: TrackedWine[]
  isLoading: boolean
  error: string | null
  refreshTrackedWines: () => Promise<void>
  addWineToTracker: (wine: Omit<TrackedWine, "id" | "user_id" | "created_at" | "tracking_status">) => Promise<boolean>
  updateTrackedWine: (id: string, wine: Partial<TrackedWine>) => Promise<boolean>
  deleteTrackedWine: (id: string) => Promise<boolean>
  addUntrackedWineToCollection: (
    wine: Omit<TrackedWine, "id" | "user_id" | "created_at" | "tracking_status" | "tastingNotes">,
    userId: string,
  ) => Promise<boolean>
  startTrackingWine: (id: string) => Promise<boolean>
}

const WineTrackerContext = createContext<WineTrackerContextType | undefined>(undefined)

export function WineTrackerProvider({ children }: { children: ReactNode }) {
  const [trackedWines, setTrackedWines] = useState<TrackedWine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const refreshTrackedWines = async () => {
    if (!user) {
      setTrackedWines([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("Attempting to fetch tracked wines for user:", user.id)

      // Check if Supabase connection is working
      const connectionCheck = await checkSupabaseConnection()
      if (!connectionCheck.success) {
        console.error("Supabase connection check failed:", connectionCheck.error)
        throw new Error("Database connection failed. Please check your internet connection and try again.")
      }

      // Add a small delay to ensure authentication is fully established
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Implement retry logic for network issues
      let attempts = 0
      const maxAttempts = 3
      let data = null
      let fetchError = null

      while (attempts < maxAttempts) {
        try {
          console.log(`Fetch attempt ${attempts + 1} of ${maxAttempts}`)
          const response = await supabase
            .from("tracked_wines")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          data = response.data
          fetchError = response.error

          if (fetchError) {
            console.error(`Attempt ${attempts + 1} failed:`, fetchError)
            attempts++
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            // Success, exit the loop
            break
          }
        } catch (err) {
          console.error(`Network error on attempt ${attempts + 1}:`, err)
          attempts++
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000))
          fetchError = err
        }
      }

      if (fetchError) {
        throw new Error(fetchError.message || "Failed to fetch tracked wines after multiple attempts")
      }

      console.log("Tracked wines fetched successfully:", data?.length || 0)

      // Transform data to convert snake_case to camelCase for our app
      const transformedData =
        data?.map((wine) => ({
          ...wine,
          agingProgress: wine.aging_progress,
          tastingNotes: wine.tasting_notes,
        })) || []

      setTrackedWines(transformedData)
    } catch (err) {
      console.error("Error fetching tracked wines:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch tracked wines")
      toast({
        title: "Error",
        description: "Failed to fetch your tracked wines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      refreshTrackedWines()
    }
  }, [user])

  const addWineToTracker = async (wine: Omit<TrackedWine, "id" | "user_id" | "created_at" | "tracking_status">) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track wines.",
        variant: "destructive",
      })
      return false
    }

    try {
      setError(null)

      // Convert camelCase to snake_case for database
      const wineData = {
        ...wine,
        user_id: user.id,
        tracking_status: "tracking",
        aging_progress: wine.agingProgress,
        tasting_notes: wine.tastingNotes,
      }

      // Remove camelCase properties to avoid duplication
      delete wineData.agingProgress
      delete wineData.tastingNotes

      // Explicitly remove any id property to let Supabase generate a new UUID
      delete (wineData as any).id

      const { data, error: insertError } = await supabase.from("tracked_wines").insert(wineData).select()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Refresh the tracked wines list
      await refreshTrackedWines()

      toast({
        title: "Wine Added",
        description: "Wine has been added to your tracker.",
      })

      return true
    } catch (err) {
      console.error("Error adding wine to tracker:", err)
      setError(err instanceof Error ? err.message : "Failed to add wine to tracker")
      toast({
        title: "Error",
        description: "Failed to add wine to your tracker. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const addUntrackedWineToCollection = async (
    wine: Omit<TrackedWine, "id" | "user_id" | "created_at" | "tracking_status" | "tastingNotes">,
    userId: string,
  ) => {
    try {
      console.log("Adding untracked wine to collection:", wine.name)

      // Check if this wine already exists in the user's collection with the same name and year
      // This helps prevent duplicate inserts on page refresh
      console.log("Checking if wine already exists in collection")
      const { data: existingWines, error: checkError } = await supabase
        .from("tracked_wines")
        .select("id")
        .eq("user_id", userId)
        .eq("name", wine.name)
        .eq("year", wine.year)
        .eq("tracking_status", "untracked")

      if (checkError) {
        console.error("Error checking for existing wine:", checkError)
      } else if (existingWines && existingWines.length > 0) {
        console.log(`Wine already exists in collection (${existingWines.length} found), skipping insert`)
        return true // Return success since the wine is already in the collection
      }

      // Make sure we're using snake_case for database columns
      const wineData = {
        ...wine,
        user_id: userId,
        tracking_status: "untracked",
        created_at: new Date().toISOString(), // Explicitly set creation date
      }

      // Explicitly remove any id property to let Supabase generate a new UUID
      delete (wineData as any).id

      // Log the data we're about to insert for debugging
      console.log("Inserting wine data:", wineData)

      // First attempt - standard insert
      const { data, error: insertError } = await supabase.from("tracked_wines").insert(wineData).select()

      if (insertError) {
        console.error("Error adding untracked wine (attempt 1):", insertError)

        // Second attempt - try with explicit session
        console.log("Trying second attempt with session")
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData && sessionData.session) {
          const token = sessionData.session.access_token
          const { data: secondAttemptData, error: secondAttemptError } = await supabase
            .from("tracked_wines")
            .insert(wineData)
            .select()
            .auth(token)

          if (secondAttemptError) {
            console.error("Error adding untracked wine (attempt 2):", secondAttemptError)
            return false
          }

          console.log("Successfully added untracked wine on second attempt:", secondAttemptData)
          return true
        } else {
          console.error("No active session for second attempt")
          return false
        }
      }

      console.log("Successfully added untracked wine on first attempt:", data)
      return true
    } catch (err) {
      console.error("Error adding untracked wine to collection:", err)
      return false
    }
  }

  const startTrackingWine = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track wines.",
        variant: "destructive",
      })
      return false
    }

    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from("tracked_wines")
        .update({ tracking_status: "tracking" })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Refresh the tracked wines list
      await refreshTrackedWines()

      toast({
        title: "Wine Tracking Started",
        description: "You are now tracking this wine.",
      })

      return true
    } catch (err) {
      console.error("Error starting wine tracking:", err)
      setError(err instanceof Error ? err.message : "Failed to start tracking wine")
      toast({
        title: "Error",
        description: "Failed to start tracking this wine. Please try again.",
      })
      return false
    }
  }

  const updateTrackedWine = async (id: string, wine: Partial<TrackedWine>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update tracked wines.",
        variant: "destructive",
      })
      return false
    }

    try {
      setError(null)

      // Convert camelCase to snake_case for database
      const wineData: any = { ...wine }

      if (wine.agingProgress) {
        wineData.aging_progress = wine.agingProgress
        delete wineData.agingProgress
      }

      if (wine.tastingNotes) {
        wineData.tasting_notes = wine.tastingNotes
        delete wineData.tastingNotes
      }

      const { data, error: updateError } = await supabase
        .from("tracked_wines")
        .update(wineData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Refresh the tracked wines list
      await refreshTrackedWines()

      toast({
        title: "Wine Updated",
        description: "Your tracked wine has been updated.",
      })

      return true
    } catch (err) {
      console.error("Error updating tracked wine:", err)
      setError(err instanceof Error ? err.message : "Failed to update tracked wine")
      toast({
        title: "Error",
        description: "Failed to update your tracked wine. Please try again.",
      })
      return false
    }
  }

  const deleteTrackedWine = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete tracked wines.",
        variant: "destructive",
      })
      return false
    }

    try {
      setError(null)

      const { error: deleteError } = await supabase.from("tracked_wines").delete().eq("id", id).eq("user_id", user.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Refresh the tracked wines list
      setTrackedWines((prev) => prev.filter((wine) => wine.id !== id))

      toast({
        title: "Wine Removed",
        description: "Wine has been removed from your tracker.",
      })

      return true
    } catch (err) {
      console.error("Error deleting tracked wine:", err)
      setError(err instanceof Error ? err.message : "Failed to delete tracked wine")
      toast({
        title: "Error",
        description: "Failed to remove wine from your tracker. Please try again.",
      })
      return false
    }
  }

  return (
    <WineTrackerContext.Provider
      value={{
        trackedWines,
        isLoading,
        error,
        refreshTrackedWines,
        addWineToTracker,
        updateTrackedWine,
        deleteTrackedWine,
        addUntrackedWineToCollection,
        startTrackingWine,
      }}
    >
      {children}
    </WineTrackerContext.Provider>
  )
}

export function useWineTracker() {
  const context = useContext(WineTrackerContext)
  if (context === undefined) {
    throw new Error("useWineTracker must be used within a WineTrackerProvider")
  }
  return context
}
