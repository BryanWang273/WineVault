import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Wine, Clock, Bell } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image src="/warm-wine-haven.png" alt="Wine cellar" fill className="object-cover brightness-50" priority />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover, Purchase, and Age Your Perfect Wine</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your premier destination for fine wines and personalized aging recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/wines">
              <Button size="lg" className="bg-[#722F37] hover:bg-[#5a252c] text-white">
                Shop Wines
              </Button>
            </Link>
            <Link href="/tracker">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Track Your Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/wines?category=${category.id}`}
                className="group relative h-64 rounded-lg overflow-hidden"
              >
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="mt-2">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Our Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="bg-[#722F37]/10 p-4 rounded-full mb-4">
                <Wine className="w-8 h-8 text-[#722F37]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curated Selection</h3>
              <p className="text-gray-600">
                Discover a handpicked collection of the finest wines from around the world.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="bg-[#722F37]/10 p-4 rounded-full mb-4">
                <Clock className="w-8 h-8 text-[#722F37]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Aging Tracker</h3>
              <p className="text-gray-600">
                Get personalized recommendations on when to enjoy your wines at their peak.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="bg-[#722F37]/10 p-4 rounded-full mb-4">
                <Bell className="w-8 h-8 text-[#722F37]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Notifications</h3>
              <p className="text-gray-600">
                Receive timely alerts when your wines reach their optimal drinking window.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Wines</h2>
            <Link href="/wines" className="text-[#722F37] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWines.map((wine) => (
              <Link
                key={wine.id}
                href={`/wine/${wine.id}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <Image src={wine.image || "/placeholder.svg"} alt={wine.name} fill className="object-cover" />
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#722F37] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Tracking Your Wine Collection Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Sign up now to access your personalized wine aging dashboard and never miss a wine's peak drinking window
            again.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

const categories = [
  {
    id: "red",
    name: "Red Wines",
    description: "From bold Cabernets to smooth Pinot Noirs",
    image: "/cellar-red-wine.png",
  },
  {
    id: "white",
    name: "White Wines",
    description: "Crisp Chardonnays to refreshing Sauvignon Blancs",
    image: "/chilled-white-wine.png",
  },
  {
    id: "sparkling",
    name: "Sparkling Wines",
    description: "Champagne and other celebratory bubbles",
    image: "/celebratory-bubbles.png",
  },
]

const featuredWines = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Bordeaux, France",
    year: 2015,
    price: 699,
    image: "/chateau-margaux-bottle.png",
  },
  {
    id: 2,
    name: "Opus One 2018",
    region: "Napa Valley, USA",
    year: 2018,
    price: 399,
    image: "/elegant-red-wine.png",
  },
  {
    id: 3,
    name: "Dom Pérignon 2012",
    region: "Champagne, France",
    year: 2012,
    price: 249,
    image: "/elegant-champagne.png",
  },
  {
    id: 4,
    name: "Cloudy Bay Sauvignon Blanc 2022",
    region: "Marlborough, New Zealand",
    year: 2022,
    price: 39,
    image: "/sauvignon-blanc-bottle.png",
  },
]
