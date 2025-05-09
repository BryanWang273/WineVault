import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import WineDetailPage from "../../app/wine/[id]/page"
import { AuthProvider } from "../../lib/auth-context"
import { WineShopProvider } from "../../lib/wine-shop-context"
import { CartProvider } from "../../lib/cart-context"

// Mock useParams
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useParams: () => ({ id: "1" }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock wine data
const mockWine = {
  id: 1,
  name: "Château Margaux 2015",
  region: "Bordeaux",
  year: "2015",
  price: 500,
  rating: 4.8,
  reviewCount: 120,
  ageWorthy: true,
  type: "Red",
  grape: "Cabernet Sauvignon",
  image: "/chateau-margaux.jpg",
  images: ["/chateau-margaux.jpg", "/chateau-margaux-2.jpg"],
  description:
    "A fine Bordeaux wine with exceptional aging potential. Rich and complex with notes of blackcurrant, cedar, and tobacco.",
  tastingNotes: "Rich and complex with notes of blackcurrant, cedar, and tobacco.",
  agingPotential: { drinkFrom: 2020, peakMaturity: 2030, drinkUntil: 2040 },
  storageRecommendations: "Store in a cool, dark place at 55-60°F with 70% humidity.",
  foodPairings: ["Beef", "Lamb", "Game", "Aged Cheeses"],
}

// Mock the wine shop context
jest.mock("../../lib/wine-shop-context", () => ({
  useWineShop: () => ({
    getWineById: jest.fn().mockResolvedValue(mockWine),
    isLoading: false,
    error: null,
  }),
  WineShopProvider: ({ children }) => <div>{children}</div>,
}))

// Mock the cart context
jest.mock("../../lib/cart-context", () => ({
  useCart: () => ({
    addToCart: jest.fn(),
    isInCart: jest.fn().mockReturnValue(false),
  }),
  CartProvider: ({ children }) => <div>{children}</div>,
}))

describe("WineDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders wine details correctly", async () => {
    render(
      <AuthProvider>
        <WineShopProvider>
          <CartProvider>
            <WineDetailPage />
          </CartProvider>
        </WineShopProvider>
      </AuthProvider>,
    )

    // Wait for data to load and check basic wine information
    await waitFor(() => {
      expect(screen.getByText("Château Margaux 2015")).toBeInTheDocument()
    })

    expect(screen.getByText("Bordeaux")).toBeInTheDocument()
    expect(screen.getByText("2015")).toBeInTheDocument()
    expect(screen.getByText("$500")).toBeInTheDocument()
    expect(screen.getByText("Cabernet Sauvignon")).toBeInTheDocument()

    // Check description
    expect(screen.getByText(/A fine Bordeaux wine with exceptional aging potential/)).toBeInTheDocument()

    // Check aging potential
    expect(screen.getByText("Aging Potential")).toBeInTheDocument()
    expect(screen.getByText("2020")).toBeInTheDocument()
    expect(screen.getByText("2030")).toBeInTheDocument()
    expect(screen.getByText("2040")).toBeInTheDocument()
  })

  test("handles add to cart", async () => {
    const addToCartMock = jest.fn()

    // Override the mock implementation for this test
    require("../../lib/cart-context").useCart.mockReturnValue({
      addToCart: addToCartMock,
      isInCart: jest.fn().mockReturnValue(false),
    })

    render(
      <AuthProvider>
        <WineShopProvider>
          <CartProvider>
            <WineDetailPage />
          </CartProvider>
        </WineShopProvider>
      </AuthProvider>,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Château Margaux 2015")).toBeInTheDocument()
    })

    // Find and click the add to cart button
    const addToCartButton = screen.getByRole("button", { name: /add to cart/i })
    await userEvent.click(addToCartButton)

    // Verify the addToCart function was called with the wine data
    expect(addToCartMock).toHaveBeenCalledWith(mockWine)
  })
})
