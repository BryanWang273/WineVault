import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/vintage-wine-cellar.png"
          alt="Wine Cellar"
          width={1200}
          height={400}
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About WineVault</h1>
          <p className="text-xl text-white/90 max-w-2xl">Curating exceptional wines and experiences since 2010</p>
        </div>
      </div>

      {/* Our Story */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#722F37] mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              WineVault was founded in 2010 by a group of passionate wine enthusiasts who believed that exceptional
              wines should be accessible to everyone. What began as a small collection of carefully selected bottles has
              grown into one of the most trusted online wine marketplaces.
            </p>
            <p className="text-gray-700 mb-4">
              Our journey started in the rolling hills of Napa Valley, where our founders spent years building
              relationships with local vineyards and winemakers. These connections allowed us to bring unique,
              small-batch wines directly to consumers who might never have discovered them otherwise.
            </p>
            <p className="text-gray-700">
              Today, WineVault offers an extensive collection of wines from around the world, from celebrated classics
              to emerging gems. Our commitment to quality, authenticity, and exceptional service remains at the heart of
              everything we do.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/napa-vineyard-estate.png"
              alt="Napa Valley Vineyard"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      <Separator className="my-16" />

      {/* Our Mission */}
      <section className="mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#722F37] mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700">
            To connect wine lovers with exceptional wines through education, accessibility, and personalized experiences
            that celebrate the art and culture of winemaking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-t-[#722F37]">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Curate</h3>
              <p className="text-gray-600">
                We meticulously select wines that represent the best of their regions, styles, and price points,
                ensuring every bottle meets our standards of excellence.
              </p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-[#722F37]">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Educate</h3>
              <p className="text-gray-600">
                We empower our customers with knowledge about wine regions, grape varieties, tasting notes, and food
                pairings to enhance their appreciation and enjoyment.
              </p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-[#722F37]">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-gray-600">
                We build meaningful relationships between wine enthusiasts, winemakers, and vineyards, creating a
                community united by a shared passion for exceptional wine.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Wine Selection Process */}
      <section className="mb-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-[#722F37] mb-8 text-center">Our Wine Selection Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sourcing</h3>
                  <p className="text-gray-600">
                    Our team travels to wine regions worldwide, meeting with winemakers and vineyard owners to discover
                    exceptional wines that tell the story of their terroir.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tasting</h3>
                  <p className="text-gray-600">
                    Each wine undergoes a rigorous blind tasting by our panel of sommeliers and wine experts, who
                    evaluate aroma, flavor profile, structure, and aging potential.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Selection</h3>
                  <p className="text-gray-600">
                    Only wines that receive unanimous approval from our panel make it into our collection, ensuring that
                    every bottle represents exceptional quality and value.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <div>
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Documentation</h3>
                  <p className="text-gray-600">
                    We create detailed profiles for each selected wine, including tasting notes, food pairings, aging
                    recommendations, and the story behind the winery.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Storage</h3>
                  <p className="text-gray-600">
                    All wines are stored in our temperature-controlled facilities to ensure they reach you in perfect
                    condition, preserving their intended flavors and aromas.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Delivery</h3>
                  <p className="text-gray-600">
                    We use specialized packaging and shipping methods to protect your wines during transit, ensuring
                    they arrive in optimal condition for immediate enjoyment or aging.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-[#722F37] mb-8 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: "Elena Rodriguez",
              role: "Founder & Head Sommelier",
              bio: "With over 20 years of experience in the wine industry and a Master Sommelier certification, Elena leads our wine selection process.",
              image: "/confident-sommelier.png",
            },
            {
              name: "Marcus Chen",
              role: "Wine Curator",
              bio: "A certified wine educator who specializes in Old World wines, Marcus travels extensively to discover hidden gems from European vineyards.",
              image: "/discerning-sommelier.png",
            },
            {
              name: "Sophia Williams",
              role: "Customer Experience Director",
              bio: "With a background in luxury hospitality, Sophia ensures that every customer interaction with WineVault exceeds expectations.",
              image: "/empathetic-support.png",
            },
            {
              name: "James Thompson",
              role: "Wine Technology Expert",
              bio: "James combines his passion for wine with technical expertise to develop our wine tracking and aging prediction algorithms.",
              image: "/confident-tech-leader.png",
            },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 rounded-full overflow-hidden mx-auto w-40 h-40">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-[#722F37] font-medium mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-[#722F37] text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-6">
          Have questions about our wines, aging recommendations, or need personalized assistance? Our team of wine
          experts is here to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#722F37]"
          >
            Contact Us
          </Button>
          <Link href="/wines">
            <Button className="bg-white text-[#722F37] hover:bg-gray-100">Explore Our Collection</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
