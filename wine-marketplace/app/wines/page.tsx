"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image"
import Link from "next/link"
import { Search, SlidersHorizontal, Loader2, X } from "lucide-react"
import { useWineShop } from "@/lib/wine-shop-context"
import type { Wine } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function WinesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { wines, isLoading, error } = useWineShop()

  // State for filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [filteredWines, setFilteredWines] = useState<Wine[]>([])
  const [totalWines, setTotalWines] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedVintages, setSelectedVintages] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])

  // Initialize filters from URL parameters
  useEffect(() => {
    // Parse search query from URL
    const query = searchParams.get("search")
    if (query) {
      setSearchTerm(query)
    }

    // Parse category from URL
    const category = searchParams.get("category")
    if (category) {
      setSelectedTypes([category.toLowerCase()])
    }

    // Parse price range from URL
    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")

    if (minPriceParam) {
      const min = Number.parseInt(minPriceParam)
      setMinPrice(min)
      setPriceRange((prev) => [min, prev[1]])
    }

    if (maxPriceParam) {
      const max = Number.parseInt(maxPriceParam)
      setMaxPrice(max)
      setPriceRange((prev) => [prev[0], max])
    }

    // Parse sort parameter
    const sortParam = searchParams.get("sort")
    if (sortParam) {
      setSortBy(sortParam)
    }

    // Parse type parameter
    const typeParam = searchParams.get("type")
    if (typeParam) {
      setSelectedTypes(typeParam.split(","))
    }

    // Parse region parameter
    const regionParam = searchParams.get("region")
    if (regionParam) {
      setSelectedRegions(regionParam.split(","))
    }

    // Parse vintage parameter
    const vintageParam = searchParams.get("vintage")
    if (vintageParam) {
      setSelectedVintages(vintageParam.split(","))
    }

    // Parse rating parameter
    const ratingParam = searchParams.get("rating")
    if (ratingParam) {
      setSelectedRatings(ratingParam.split(","))
    }
  }, [searchParams])

  // Update active filters display
  useEffect(() => {
    const filters: string[] = []

    if (minPrice > 0 || maxPrice < 1000) {
      filters.push(`Price: $${minPrice} - $${maxPrice}`)
    }

    selectedTypes.forEach((type) => filters.push(`Type: ${type}`))
    selectedRegions.forEach((region) => filters.push(`Region: ${region}`))

    selectedVintages.forEach((vintage) => {
      let label = ""
      if (vintage === "2020s") label = "2020s"
      if (vintage === "2010s") label = "2010s"
      if (vintage === "2000s") label = "2000s"
      if (vintage === "1990s") label = "1990s"
      if (vintage === "older") label = "Before 1990"
      filters.push(`Vintage: ${label}`)
    })

    selectedRatings.forEach((rating) => {
      let label = ""
      if (rating === "5stars") label = "5 Stars"
      if (rating === "4stars") label = "4+ Stars"
      if (rating === "3stars") label = "3+ Stars"
      filters.push(`Rating: ${label}`)
    })

    setActiveFilters(filters)
  }, [minPrice, maxPrice, selectedTypes, selectedRegions, selectedVintages, selectedRatings])

  // Client-side search function
  const searchWinesClientSide = (query: string, wineList: Wine[]): Wine[] => {
    if (!query.trim()) return wineList

    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0)

    return wineList.filter((wine) => {
      return searchTerms.some((term) => {
        return (
          wine.name.toLowerCase().includes(term) ||
          wine.region.toLowerCase().includes(term) ||
          wine.type.toLowerCase().includes(term) ||
          (wine.grape && wine.grape.toLowerCase().includes(term)) ||
          (wine.description && wine.description.toLowerCase().includes(term))
        )
      })
    })
  }

  // Apply all filters and sorting client-side
  const filteredAndSortedWines = useMemo(() => {
    if (wines.length === 0) return []

    // First apply search if there's a search term
    let filtered = searchTerm ? searchWinesClientSide(searchTerm, wines) : [...wines]

    // Apply price filter
    filtered = filtered.filter((wine) => wine.price >= minPrice && wine.price <= maxPrice)

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((wine) => selectedTypes.includes(wine.type.toLowerCase()))
    }

    // Apply region filter
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((wine) => {
        const region = wine.region.toLowerCase()
        return selectedRegions.some((r) => region.includes(r.toLowerCase()))
      })
    }

    // Apply vintage filter
    if (selectedVintages.length > 0) {
      filtered = filtered.filter((wine) => {
        const year = typeof wine.year === "string" ? Number.parseInt(wine.year) : wine.year

        return selectedVintages.some((v) => {
          if (v === "2020s") return year >= 2020 && year < 2030
          if (v === "2010s") return year >= 2010 && year < 2020
          if (v === "2000s") return year >= 2000 && year < 2010
          if (v === "1990s") return year >= 1990 && year < 2000
          if (v === "older") return year < 1990
          return false
        })
      })
    }

    // Apply rating filter
    if (selectedRatings.length > 0) {
      filtered = filtered.filter((wine) => {
        return selectedRatings.some((r) => {
          if (r === "5stars") return wine.rating === 5
          if (r === "4stars") return wine.rating >= 4
          if (r === "3stars") return wine.rating >= 3
          return false
        })
      })
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          const yearA = typeof a.year === "string" ? Number.parseInt(a.year) : a.year
          const yearB = typeof b.year === "string" ? Number.parseInt(b.year) : b.year
          return yearB - yearA
        case "rating":
          return b.rating - a.rating
        default: // featured or any other value
          return 0 // maintain original order for featured
      }
    })
  }, [wines, searchTerm, minPrice, maxPrice, selectedTypes, selectedRegions, selectedVintages, selectedRatings, sortBy])

  // Apply pagination to the filtered and sorted wines
  useEffect(() => {
    if (filteredAndSortedWines.length === 0) {
      setFilteredWines([])
      setTotalWines(0)
      return
    }

    setTotalWines(filteredAndSortedWines.length)

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedWines = filteredAndSortedWines.slice(startIndex, startIndex + itemsPerPage)

    setFilteredWines(paginatedWines)
  }, [filteredAndSortedWines, currentPage, itemsPerPage])

  const toggleFilter = (filter: string, category: "type" | "region" | "vintage" | "rating") => {
    switch (category) {
      case "type":
        setSelectedTypes((prev) => (prev.includes(filter) ? prev.filter((t) => t !== filter) : [...prev, filter]))
        break
      case "region":
        setSelectedRegions((prev) => (prev.includes(filter) ? prev.filter((r) => r !== filter) : [...prev, filter]))
        break
      case "vintage":
        setSelectedVintages((prev) => (prev.includes(filter) ? prev.filter((v) => v !== filter) : [...prev, filter]))
        break
      case "rating":
        setSelectedRatings((prev) => (prev.includes(filter) ? prev.filter((r) => r !== filter) : [...prev, filter]))
        break
    }
    setCurrentPage(1) // Reset to first page when changing filters
  }

  const handleSearch = (query: string) => {
    setCurrentPage(1) // Reset to first page when searching
    setSearchTerm(query)

    // Update URL with search parameter
    updateUrlParams({ search: query || null })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchTerm)
  }

  // Helper function to update URL parameters
  const updateUrlParams = (params: Record<string, string | null>) => {
    const urlParams = new URLSearchParams(searchParams.toString())

    // Update or remove each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        urlParams.delete(key)
      } else {
        urlParams.set(key, value)
      }
    })

    const queryString = urlParams.toString()
    router.push(`/wines${queryString ? `?${queryString}` : ""}`)
  }

  const applyFilters = () => {
    // Update URL with filter parameters
    const params: Record<string, string | null> = {}

    if (minPrice > 0) {
      params.minPrice = minPrice.toString()
    }

    if (maxPrice < 1000) {
      params.maxPrice = maxPrice.toString()
    }

    if (selectedTypes.length > 0) {
      params.type = selectedTypes.join(",")
    }

    if (selectedRegions.length > 0) {
      params.region = selectedRegions.join(",")
    }

    if (selectedVintages.length > 0) {
      params.vintage = selectedVintages.join(",")
    }

    if (selectedRatings.length > 0) {
      params.rating = selectedRatings.join(",")
    }

    if (sortBy !== "featured") {
      params.sort = sortBy
    }

    updateUrlParams(params)
    setIsFiltersVisible(false) // Close mobile filters
  }

  const clearFilters = () => {
    setPriceRange([0, 1000])
    setMinPrice(0)
    setMaxPrice(1000)
    setSelectedTypes([])
    setSelectedRegions([])
    setSelectedVintages([])
    setSelectedRatings([])
    setSortBy("featured")
    setCurrentPage(1) // Reset to first page when clearing filters

    // Clear URL parameters but keep search if present
    const search = searchParams.get("search")
    if (search) {
      router.push(`/wines?search=${encodeURIComponent(search)}`)
    } else {
      router.push("/wines")
    }
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Price:")) {
      setPriceRange([0, 1000])
      setMinPrice(0)
      setMaxPrice(1000)
      updateUrlParams({ minPrice: null, maxPrice: null })
    } else if (filter.startsWith("Type:")) {
      const type = filter.split(": ")[1].toLowerCase()
      const newTypes = selectedTypes.filter((t) => t !== type)
      setSelectedTypes(newTypes)
      updateUrlParams({ type: newTypes.length ? newTypes.join(",") : null })
    } else if (filter.startsWith("Region:")) {
      const region = filter.split(": ")[1].toLowerCase()
      const newRegions = selectedRegions.filter((r) => r !== region)
      setSelectedRegions(newRegions)
      updateUrlParams({ region: newRegions.length ? newRegions.join(",") : null })
    } else if (filter.startsWith("Vintage:")) {
      const vintage = filter.split(": ")[1]
      let value = ""
      if (vintage === "2020s") value = "2020s"
      if (vintage === "2010s") value = "2010s"
      if (vintage === "2000s") value = "2000s"
      if (vintage === "1990s") value = "1990s"
      if (vintage === "Before 1990") value = "older"
      const newVintages = selectedVintages.filter((v) => v !== value)
      setSelectedVintages(newVintages)
      updateUrlParams({ vintage: newVintages.length ? newVintages.join(",") : null })
    } else if (filter.startsWith("Rating:")) {
      const rating = filter.split(": ")[1]
      let value = ""
      if (rating === "5 Stars") value = "5stars"
      if (rating === "4+ Stars") value = "4stars"
      if (rating === "3+ Stars") value = "3stars"
      const newRatings = selectedRatings.filter((r) => r !== value)
      setSelectedRatings(newRatings)
      updateUrlParams({ rating: newRatings.length ? newRatings.join(",") : null })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37] mb-4" />
        <p className="text-gray-500">Loading wines...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop Wines</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  className="py-4"
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number])
                    setMinPrice(value[0])
                    setMaxPrice(value[1])
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        setMinPrice(value)
                        setPriceRange([value, priceRange[1]])
                      }}
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        setMaxPrice(value)
                        setPriceRange([priceRange[0], value])
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Accordion type="multiple" className="w-full" defaultValue={["type", "region", "vintage"]}>
              <AccordionItem value="type">
                <AccordionTrigger className="py-3">Wine Type</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="red"
                        checked={selectedTypes.includes("red")}
                        onCheckedChange={() => toggleFilter("red", "type")}
                      />
                      <Label htmlFor="red" className="font-normal">
                        Red
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="white"
                        checked={selectedTypes.includes("white")}
                        onCheckedChange={() => toggleFilter("white", "type")}
                      />
                      <Label htmlFor="white" className="font-normal">
                        White
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sparkling"
                        checked={selectedTypes.includes("sparkling")}
                        onCheckedChange={() => toggleFilter("sparkling", "type")}
                      />
                      <Label htmlFor="sparkling" className="font-normal">
                        Sparkling
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rose"
                        checked={selectedTypes.includes("rose")}
                        onCheckedChange={() => toggleFilter("rose", "type")}
                      />
                      <Label htmlFor="rose" className="font-normal">
                        Rosé
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dessert"
                        checked={selectedTypes.includes("dessert")}
                        onCheckedChange={() => toggleFilter("dessert", "type")}
                      />
                      <Label htmlFor="dessert" className="font-normal">
                        Dessert
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="region">
                <AccordionTrigger className="py-3">Region</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="france"
                        checked={selectedRegions.includes("france")}
                        onCheckedChange={() => toggleFilter("france", "region")}
                      />
                      <Label htmlFor="france" className="font-normal">
                        France
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="italy"
                        checked={selectedRegions.includes("italy")}
                        onCheckedChange={() => toggleFilter("italy", "region")}
                      />
                      <Label htmlFor="italy" className="font-normal">
                        Italy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="spain"
                        checked={selectedRegions.includes("spain")}
                        onCheckedChange={() => toggleFilter("spain", "region")}
                      />
                      <Label htmlFor="spain" className="font-normal">
                        Spain
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="usa"
                        checked={selectedRegions.includes("usa")}
                        onCheckedChange={() => toggleFilter("usa", "region")}
                      />
                      <Label htmlFor="usa" className="font-normal">
                        United States
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="australia"
                        checked={selectedRegions.includes("australia")}
                        onCheckedChange={() => toggleFilter("australia", "region")}
                      />
                      <Label htmlFor="australia" className="font-normal">
                        Australia
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vintage">
                <AccordionTrigger className="py-3">Vintage</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="2020s"
                        checked={selectedVintages.includes("2020s")}
                        onCheckedChange={() => toggleFilter("2020s", "vintage")}
                      />
                      <Label htmlFor="2020s" className="font-normal">
                        2020s
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="2010s"
                        checked={selectedVintages.includes("2010s")}
                        onCheckedChange={() => toggleFilter("2010s", "vintage")}
                      />
                      <Label htmlFor="2010s" className="font-normal">
                        2010s
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="2000s"
                        checked={selectedVintages.includes("2000s")}
                        onCheckedChange={() => toggleFilter("2000s", "vintage")}
                      />
                      <Label htmlFor="2000s" className="font-normal">
                        2000s
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="1990s"
                        checked={selectedVintages.includes("1990s")}
                        onCheckedChange={() => toggleFilter("1990s", "vintage")}
                      />
                      <Label htmlFor="1990s" className="font-normal">
                        1990s
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="older"
                        checked={selectedVintages.includes("older")}
                        onCheckedChange={() => toggleFilter("older", "vintage")}
                      />
                      <Label htmlFor="older" className="font-normal">
                        Older
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rating">
                <AccordionTrigger className="py-3">Rating</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="5stars"
                        checked={selectedRatings.includes("5stars")}
                        onCheckedChange={() => toggleFilter("5stars", "rating")}
                      />
                      <Label htmlFor="5stars" className="font-normal">
                        5 Stars
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="4stars"
                        checked={selectedRatings.includes("4stars")}
                        onCheckedChange={() => toggleFilter("4stars", "rating")}
                      />
                      <Label htmlFor="4stars" className="font-normal">
                        4+ Stars
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="3stars"
                        checked={selectedRatings.includes("3stars")}
                        onCheckedChange={() => toggleFilter("3stars", "rating")}
                      />
                      <Label htmlFor="3stars" className="font-normal">
                        3+ Stars
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex gap-2">
              <Button className="flex-1 bg-[#722F37] hover:bg-[#5a252c]" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" className="flex-1" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search wines..."
                  className="pl-10 focus-visible:ring-[#722F37]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => {
                      setSearchTerm("")
                      handleSearch("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value)
                  // Update URL with sort parameter
                  updateUrlParams({ sort: value !== "featured" ? value : null })
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  {filter}
                  <button onClick={() => removeFilter(filter)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}

          {/* Mobile Filters */}
          {isFiltersVisible && (
            <div className="lg:hidden mb-6 border rounded-md p-4">
              <h3 className="font-medium mb-3">Filters</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Price Range</h4>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    className="py-4"
                    onValueChange={(value) => {
                      setPriceRange(value as [number, number])
                      setMinPrice(value[0])
                      setMaxPrice(value[1])
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          setMinPrice(value)
                          setPriceRange([value, priceRange[1]])
                        }}
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          setMaxPrice(value)
                          setPriceRange([priceRange[0], value])
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Wine Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-red"
                        checked={selectedTypes.includes("red")}
                        onCheckedChange={() => toggleFilter("red", "type")}
                      />
                      <Label htmlFor="mobile-red" className="font-normal">
                        Red
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-white"
                        checked={selectedTypes.includes("white")}
                        onCheckedChange={() => toggleFilter("white", "type")}
                      />
                      <Label htmlFor="mobile-white" className="font-normal">
                        White
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-sparkling"
                        checked={selectedTypes.includes("sparkling")}
                        onCheckedChange={() => toggleFilter("sparkling", "type")}
                      />
                      <Label htmlFor="mobile-sparkling" className="font-normal">
                        Sparkling
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-rose"
                        checked={selectedTypes.includes("rose")}
                        onCheckedChange={() => toggleFilter("rose", "type")}
                      />
                      <Label htmlFor="mobile-rose" className="font-normal">
                        Rosé
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Region</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-france"
                        checked={selectedRegions.includes("france")}
                        onCheckedChange={() => toggleFilter("france", "region")}
                      />
                      <Label htmlFor="mobile-france" className="font-normal">
                        France
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-italy"
                        checked={selectedRegions.includes("italy")}
                        onCheckedChange={() => toggleFilter("italy", "region")}
                      />
                      <Label htmlFor="mobile-italy" className="font-normal">
                        Italy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-usa"
                        checked={selectedRegions.includes("usa")}
                        onCheckedChange={() => toggleFilter("usa", "region")}
                      />
                      <Label htmlFor="mobile-usa" className="font-normal">
                        USA
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Vintage</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-2020s"
                        checked={selectedVintages.includes("2020s")}
                        onCheckedChange={() => toggleFilter("2020s", "vintage")}
                      />
                      <Label htmlFor="mobile-2020s" className="font-normal">
                        2020s
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-2010s"
                        checked={selectedVintages.includes("2010s")}
                        onCheckedChange={() => toggleFilter("2010s", "vintage")}
                      />
                      <Label htmlFor="mobile-2010s" className="font-normal">
                        2010s
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#722F37] hover:bg-[#5a252c]" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Wine Grid */}
          {filteredWines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWines.map((wine) => (
                <Link
                  key={wine.id}
                  href={`/wine/${wine.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative">
                    <Image src={wine.image || "/placeholder.svg"} alt={wine.name} fill className="object-cover" />
                    {wine.ageWorthy && (
                      <div className="absolute top-2 right-2 bg-[#722F37] text-white text-xs px-2 py-1 rounded">
                        Age Worthy
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-1">{wine.region}</div>
                    <h3 className="font-medium group-hover:text-[#722F37] transition-colors">{wine.name}</h3>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-bold">${wine.price}</span>
                      <div className="text-sm text-gray-500">{wine.year}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <div className="mx-auto w-16 h-16 text-gray-300 mb-4">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium mb-2">No wines found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? `No wines match "${searchTerm}".` : "No wines match your filter criteria."}
              </p>
              <Button className="bg-[#722F37] hover:bg-[#5a252c]" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredWines.length > 0 && totalWines > itemsPerPage && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </Button>

                {/* Generate page buttons */}
                {Array.from({ length: Math.min(5, Math.ceil(totalWines / itemsPerPage)) }, (_, i) => {
                  // Calculate page number logic to show correct page numbers when there are many pages
                  let pageNum = i + 1
                  if (Math.ceil(totalWines / itemsPerPage) > 5) {
                    if (currentPage > 3 && currentPage < Math.ceil(totalWines / itemsPerPage) - 1) {
                      pageNum = currentPage - 2 + i
                    } else if (currentPage >= Math.ceil(totalWines / itemsPerPage) - 1) {
                      pageNum = Math.ceil(totalWines / itemsPerPage) - 4 + i
                    }
                  }

                  return (
                    <Button
                      key={i}
                      variant="outline"
                      size="icon"
                      className={pageNum === currentPage ? "bg-[#722F37] text-white hover:bg-[#5a252c]" : ""}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.min(Math.ceil(totalWines / itemsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(totalWines / itemsPerPage) || totalWines <= itemsPerPage}
                >
                  &raquo;
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
