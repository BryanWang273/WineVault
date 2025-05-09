import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">WineVault</h3>
            <p className="text-sm mb-4">
              Your premier destination for fine wines and personalized aging recommendations.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wines/red" className="hover:text-white">
                  Red Wines
                </Link>
              </li>
              <li>
                <Link href="/wines/white" className="hover:text-white">
                  White Wines
                </Link>
              </li>
              <li>
                <Link href="/wines/sparkling" className="hover:text-white">
                  Sparkling Wines
                </Link>
              </li>
              <li>
                <Link href="/wines/rose" className="hover:text-white">
                  Rosé Wines
                </Link>
              </li>
              <li>
                <Link href="/wines/dessert" className="hover:text-white">
                  Dessert Wines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/tracker" className="hover:text-white">
                  Wine Tracker
                </Link>
              </li>
              <li>
                <Link href="/account/settings" className="hover:text-white">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} WineVault. All rights reserved.</p>
          <p className="mt-2">You must be 21 years or older to purchase alcohol. Please drink responsibly.</p>
        </div>
      </div>
    </footer>
  )
}
