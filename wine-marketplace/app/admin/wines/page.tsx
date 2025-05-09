"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Wine, Plus, Search, MoreHorizontal, Loader2, Trash2, Edit, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminWinesPage() {
  const [wines, setWines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("")
  const [selectedWines, setSelectedWines] = useState([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingWineId, setDeletingWineId] = useState(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch wines from Supabase
  useEffect(() => {
    const fetchWines = async () => {
      try {
        setLoading(true)
        let query = supabase.from("wines").select("*")

        // Apply filters if any
        if (filterType) {
          query = query.eq("type", filterType.toLowerCase())
        }

        // Apply search if any
        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`)
        }

        // Order by created_at
        query = query.order("created_at", { ascending: false })

        const { data, error } = await query

        if (error) {
          throw error
        }

        setWines(data || [])
      } catch (error) {
        console.error("Error fetching wines:", error)
        toast({
          title: "Error",
          description: "Failed to load wines. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWines()
  }, [searchQuery, filterType, toast])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    // The search is already handled by the useEffect dependency
  }

  // Handle wine selection
  const handleSelectWine = (wineId) => {
    setSelectedWines((prev) => (prev.includes(wineId) ? prev.filter((id) => id !== wineId) : [...prev, wineId]))
  }

  // Handle select all wines
  const handleSelectAll = () => {
    if (selectedWines.length === wines.length) {
      setSelectedWines([])
    } else {
      setSelectedWines(wines.map((wine) => wine.id))
    }
  }

  // Handle delete wine
  const handleDeleteWine = async () => {
    try {
      const { error } = await supabase.from("wines").delete().eq("id", deletingWineId)

      if (error) {
        if (error.message.includes("row-level security policy")) {
          throw new Error(
            "Permission denied: You don't have permission to delete wines. Please check your database RLS policies.",
          )
        } else {
          throw error
        }
      }

      // Remove the wine from the state
      setWines((prev) => prev.filter((wine) => wine.id !== deletingWineId))

      toast({
        title: "Wine deleted",
        description: "The wine has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting wine:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete wine. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingWineId(null)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true)

      // Delete each selected wine
      for (const wineId of selectedWines) {
        const { error } = await supabase.from("wines").delete().eq("id", wineId)

        if (error) {
          if (error.message.includes("row-level security policy")) {
            throw new Error(
              "Permission denied: You don't have permission to delete wines. Please check your database RLS policies.",
            )
          } else {
            throw error
          }
        }
      }

      // Remove the wines from the state
      setWines((prev) => prev.filter((wine) => !selectedWines.includes(wine.id)))
      setSelectedWines([])

      toast({
        title: "Wines deleted",
        description: `${selectedWines.length} wines have been successfully deleted.`,
      })
    } catch (error) {
      console.error("Error bulk deleting wines:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete some wines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Wines</h1>
        <Link href="/admin/wines/new">
          <Button className="bg-[#722F37] hover:bg-[#5a252c]">
            <Plus className="mr-2 h-4 w-4" />
            Add New Wine
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wine Inventory</CardTitle>
          <CardDescription>Manage your wine catalog. Add, edit, or remove wines from your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search wines..."
                className="pl-10 focus-visible:ring-[#722F37]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="red">Red Wine</SelectItem>
                  <SelectItem value="white">White Wine</SelectItem>
                  <SelectItem value="sparkling">Sparkling</SelectItem>
                  <SelectItem value="rose">Rosé</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedWines.length > 0 && (
            <div className="bg-gray-50 p-2 rounded-md mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">{selectedWines.length} wines selected</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Wines Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
            </div>
          ) : wines.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Wine className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No wines found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterType ? "No wines match your search criteria." : "Your wine inventory is empty."}
              </p>
              <Link href="/admin/wines/new">
                <Button className="bg-[#722F37] hover:bg-[#5a252c]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Wine
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedWines.length === wines.length && wines.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Age Worthy</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wines.map((wine) => (
                    <TableRow key={wine.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedWines.includes(wine.id)}
                          onCheckedChange={() => handleSelectWine(wine.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-12 h-12 relative rounded overflow-hidden">
                          <Image src={wine.image || "/placeholder.svg"} alt={wine.name} fill className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{wine.name}</TableCell>
                      <TableCell className="capitalize">{wine.type}</TableCell>
                      <TableCell>{wine.region}</TableCell>
                      <TableCell>{wine.year}</TableCell>
                      <TableCell>${wine.price}</TableCell>
                      <TableCell>{wine.ageWorthy ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/wine/${wine.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/wines/${wine.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setDeletingWineId(wine.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wine? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWine}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
