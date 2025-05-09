"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, Search, Loader2, AlertCircle, ArrowUpDown, RefreshCw } from "lucide-react"
import { format } from "date-fns"

type Order = {
  id: string
  order_number: string
  user_id: string
  total_amount: number
  status: string
  items: any[]
  created_at: string
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const ordersPerPage = 10

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/admin/orders")
    }
  }, [user, router])

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Fetching orders with params:", {
        statusFilter,
        searchTerm,
        sortField,
        sortDirection,
        currentPage,
        ordersPerPage,
      })

      // First, get the total count for pagination
      let countQuery = supabase.from("orders").select("id", { count: "exact" })

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        countQuery = countQuery.eq("status", statusFilter)
      }

      // Apply search filter if present
      if (searchTerm) {
        countQuery = countQuery.ilike("order_number", `%${searchTerm}%`)
      }

      const { count: totalCount, error: countError } = await countQuery

      if (countError) {
        throw countError
      }

      console.log("Total orders count:", totalCount)
      setTotalOrders(totalCount || 0)
      setTotalPages(Math.max(1, Math.ceil((totalCount || 0) / ordersPerPage)))

      // Now fetch the actual data with pagination
      let query = supabase
        .from("orders")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" })

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      // Apply search filter if present
      if (searchTerm) {
        query = query.ilike("order_number", `%${searchTerm}%`)
      }

      // Calculate pagination
      const from = (currentPage - 1) * ordersPerPage
      const to = from + ordersPerPage - 1

      // Execute the query with pagination
      const { data, error: fetchError } = await query.range(from, to)

      if (fetchError) {
        throw fetchError
      }

      console.log("Fetched orders:", data)
      setOrders(data || [])

      // Adjust current page if it's out of bounds
      if (data && data.length === 0 && currentPage > 1) {
        setCurrentPage(1)
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch orders when dependencies change
  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, searchTerm, statusFilter, sortField, sortDirection, currentPage])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "shipped":
        return <Badge className="bg-purple-500">Shipped</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status || "Unknown"}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage customer orders and track their status</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by order number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="mb-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-medium"
                      onClick={() => handleSort("order_number")}
                    >
                      Order Number
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-medium"
                      onClick={() => handleSort("total_amount")}
                    >
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("status")}>
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("created_at")}>
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.created_at ? format(new Date(order.created_at), "MMM d, yyyy") : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {orders.length} of {totalOrders} orders
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNum)
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
