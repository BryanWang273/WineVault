"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wine, ShoppingCart, DollarSign, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { format, parseISO, subMonths } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

type DashboardData = {
  totalRevenue: number
  orderCount: number
  productCount: number
  recentSales: {
    order_number: string
    total_amount: number
    created_at: string
  }[]
  topProducts: {
    name: string
    category: string
    sales: number
  }[]
  orders: any[]
  wines: any[]
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    orderCount: 0,
    productCount: 0,
    recentSales: [],
    topProducts: [],
    orders: [],
    wines: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Calculate month-over-month changes
  const [revenueChange, setRevenueChange] = useState(0)
  const [orderChange, setOrderChange] = useState(0)
  const [productChange, setProductChange] = useState(0)

  // Chart data
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([])
  const [salesByTypeData, setSalesByTypeData] = useState<{ name: string; value: number }[]>([])
  const [ordersByDayData, setOrdersByDayData] = useState<{ name: string; orders: number }[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError("")

        // Get current date info for month-over-month calculations
        const now = new Date()
        const currentMonth = now.getMonth()
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const currentYear = now.getFullYear()
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString()
        const previousMonthStart = new Date(previousYear, previousMonth, 1).toISOString()
        const previousMonthEnd = new Date(currentYear, currentMonth, 0).toISOString()

        // Fetch all orders
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError

        // Fetch all wines
        const { data: wines, error: winesError } = await supabase.from("wines").select("*")

        if (winesError) throw winesError

        // Calculate total revenue and order count
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
        const orderCount = orders.length
        const productCount = wines.length

        // Calculate current month revenue and orders
        const currentMonthOrders = orders.filter((order) => new Date(order.created_at) >= new Date(currentMonthStart))
        const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)
        const currentMonthOrderCount = currentMonthOrders.length

        // Calculate previous month revenue and orders
        const previousMonthOrders = orders.filter((order) => {
          const orderDate = new Date(order.created_at)
          return orderDate >= new Date(previousMonthStart) && orderDate <= new Date(previousMonthEnd)
        })
        const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)
        const previousMonthOrderCount = previousMonthOrders.length

        // Calculate month-over-month changes
        const calcPercentChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return ((current - previous) / previous) * 100
        }

        const revChange = calcPercentChange(currentMonthRevenue, previousMonthRevenue)
        const ordChange = calcPercentChange(currentMonthOrderCount, previousMonthOrderCount)

        // For product change, we'll need to check when wines were added
        const currentMonthProducts = wines.filter(
          (wine) => wine.created_at && new Date(wine.created_at) >= new Date(currentMonthStart),
        ).length

        setRevenueChange(Number.parseFloat(revChange.toFixed(1)))
        setOrderChange(Number.parseFloat(ordChange.toFixed(1)))
        setProductChange(currentMonthProducts)

        // Get recent sales (last 5 orders)
        const recentSales = orders.slice(0, 5).map((order) => ({
          order_number: order.order_number,
          total_amount: order.total_amount,
          created_at: order.created_at,
        }))

        // Calculate top products based on order items
        const productSales: Record<number, number> = {}

        // Count sales for each product
        orders.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              const wineId = item.id
              productSales[wineId] = (productSales[wineId] || 0) + item.quantity
            })
          }
        })

        // Map wine IDs to names and sort by sales
        const topProductsData = Object.entries(productSales)
          .map(([wineId, sales]) => {
            const wine = wines.find((w) => w.id === Number.parseInt(wineId))
            return {
              name: wine ? wine.name : `Product ${wineId}`,
              category: wine ? wine.type : "Unknown",
              sales,
            }
          })
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 4)

        setDashboardData({
          totalRevenue,
          orderCount,
          productCount,
          recentSales,
          topProducts: topProductsData,
          orders,
          wines,
        })

        // Prepare chart data
        prepareChartData(orders, wines)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Prepare data for charts
  const prepareChartData = (orders: any[], wines: any[]) => {
    // 1. Revenue over time (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 6)
    const revenueByMonth: Record<string, number> = {}

    // Initialize all months with 0
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(new Date(), i)
      const monthKey = format(monthDate, "MMM yyyy")
      revenueByMonth[monthKey] = 0
    }

    // Sum revenue by month
    orders.forEach((order) => {
      const orderDate = parseISO(order.created_at)
      if (orderDate >= sixMonthsAgo) {
        const monthKey = format(orderDate, "MMM yyyy")
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.total_amount
      }
    })

    // Convert to array format for chart
    const revenueChartData = Object.entries(revenueByMonth)
      .map(([date, revenue]) => ({ date, revenue }))
      .reverse()

    setRevenueData(revenueChartData)

    // 2. Sales by wine type
    const salesByType: Record<string, number> = {}

    // Count sales for each wine type
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const wine = wines.find((w) => w.id === item.id)
          if (wine) {
            const type = wine.type || "Unknown"
            salesByType[type] = (salesByType[type] || 0) + item.quantity
          }
        })
      }
    })

    // Convert to array format for chart
    const salesByTypeChartData = Object.entries(salesByType).map(([name, value]) => ({ name, value }))
    setSalesByTypeData(salesByTypeChartData)

    // 3. Orders by day of week
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const ordersByDay: Record<string, number> = {}

    // Initialize all days with 0
    dayNames.forEach((day) => {
      ordersByDay[day] = 0
    })

    // Count orders by day of week
    orders.forEach((order) => {
      const orderDate = parseISO(order.created_at)
      const dayOfWeek = dayNames[orderDate.getDay()]
      ordersByDay[dayOfWeek] = (ordersByDay[dayOfWeek] || 0) + 1
    })

    // Convert to array format for chart
    const ordersByDayChartData = Object.entries(ordersByDay).map(([name, orders]) => ({ name, orders }))
    setOrdersByDayData(ordersByDayChartData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#722F37]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/wines/new">
            <Button className="bg-[#722F37] hover:bg-[#5a252c]">
              <Wine className="mr-2 h-4 w-4" />
              Add New Wine
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {revenueChange > 0 ? "+" : ""}
              {revenueChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardData.orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {orderChange > 0 ? "+" : ""}
              {orderChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Wine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productCount}</div>
            <p className="text-xs text-muted-foreground">+{productChange} added this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.orderCount > 0
                ? formatCurrency(dashboardData.totalRevenue / dashboardData.orderCount)
                : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Sales */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  {dashboardData.orderCount > 0
                    ? `You made ${dashboardData.orderCount} sales total.`
                    : "No sales recorded yet."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent sales to display.</p>
                  ) : (
                    dashboardData.recentSales.map((sale, index) => (
                      <div key={index} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">Order #{sale.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(sale.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{formatCurrency(sale.total_amount)}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best-selling wines.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No product sales data available.</p>
                  ) : (
                    dashboardData.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="ml-auto font-medium">{product.sales} sold</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/admin/wines">
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Manage Wines</CardTitle>
                  <Wine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove wines from your inventory.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/orders">
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Process Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View and manage customer orders.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Revenue Over Time Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly revenue for the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {revenueData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} width={80} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#722F37" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Sales by Wine Type Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Wine Type</CardTitle>
                <CardDescription>Distribution of sales across wine categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {salesByTypeData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No sales data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesByTypeData.map((entry, index) => {
                          const COLORS = ["#722F37", "#A13941", "#D1454A", "#E67E22", "#2E86C1", "#8E44AD"]
                          return <Pie key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        })}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} bottles`, "Sales"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Orders by Day of Week Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Day of Week</CardTitle>
                <CardDescription>Number of orders received on each day</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {ordersByDayData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No order data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByDayData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                      <Bar dataKey="orders" fill="#722F37" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Products Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Your best-selling wines by quantity</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {dashboardData.topProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No product sales data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.topProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value) => [`${value} bottles`, "Sales"]} />
                    <Bar dataKey="sales" fill="#722F37" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
