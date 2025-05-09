"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, type Wine } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

type WineShopContextType = {
  wines: Wine[]
  featuredWines: Wine[]
  getWineById: (id: number) => Promise<Wine | null>
  getWinesByCategory: (category: string) => Promise<Wine[]>
  isLoading: boolean
  error: string | null
}

const WineShopContext = createContext<WineShopContextType | undefined>(undefined)

export function WineShopProvider({ children }: { children: ReactNode }) {
  const [wines, setWines] = useState<Wine[]>([])
  const [featuredWines, setFeaturedWines] = useState<Wine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch wines on initial load
  useEffect(() => {
    const fetchWines = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch all wines at once
        const { data, error } = await supabase.from("wines").select("*").order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setWines(data || [])

        // Get featured wines (could be based on some criteria)
        if (data && data.length > 0) {
          // For better featured wines selection, we'll use a mix of criteria
          // Let's get wines with high ratings or marked as featured
          const featured = data.filter((wine) => wine.rating >= 4.5 || wine.featured === true).slice(0, 4)

          // If we don't have enough featured wines, add some recent ones
          if (featured.length < 4) {
            const additional = data
              .filter((wine) => !featured.some((f) => f.id === wine.id))
              .slice(0, 4 - featured.length)

            setFeaturedWines([...featured, ...additional])
          } else {
            setFeaturedWines(featured)
          }
        }
      } catch (err) {
        console.error("Error fetching wines:", err)
        setError("Failed to load wines")
        toast({
          title: "Error",
          description: "Failed to load wines. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWines()
  }, [toast])

  const getWineById = async (id: number): Promise<Wine | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("wines").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error("Error fetching wine:", err)
      setError("Failed to load wine details")
      toast({
        title: "Error",
        description: "Failed to load wine details. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const getWinesByCategory = async (category: string): Promise<Wine[]> => {
    // Filter wines client-side by category
    return wines.filter((wine) => wine.type.toLowerCase() === category.toLowerCase())
  }

  return (
    <WineShopContext.Provider
      value={{
        wines,
        featuredWines,
        getWineById,
        getWinesByCategory,
        isLoading,
        error,
      }}
    >
      {children}
    </WineShopContext.Provider>
  )
}

export function useWineShop() {
  const context = useContext(WineShopContext)
  if (context === undefined) {
    throw new Error("useWineShop must be used within a WineShopProvider")
  }
  return context
}
