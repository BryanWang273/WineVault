import { cn, isValidImageUrl } from "../lib/utils"

describe("Utility Functions", () => {
  // Test the cn (className) utility function
  describe("cn function", () => {
    test("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500", "p-4")
      expect(result).toBe("text-red-500 bg-blue-500 p-4")
    })

    test("should handle conditional class names", () => {
      const isActive = true
      const result = cn("text-gray-500", isActive && "text-blue-500")
      expect(result).toBe("text-gray-500 text-blue-500")
    })

    test("should handle falsy values", () => {
      const result = cn("base-class", false && "hidden", null, undefined, 0)
      expect(result).toBe("base-class")
    })
  })

  // Test the isValidImageUrl utility function
  describe("isValidImageUrl function", () => {
    test("should return false for undefined or empty URLs", () => {
      expect(isValidImageUrl(undefined)).toBe(false)
      expect(isValidImageUrl("")).toBe(false)
    })

    test("should return true for valid image URLs with extensions", () => {
      expect(isValidImageUrl("https://example.com/image.jpg")).toBe(true)
      expect(isValidImageUrl("https://example.com/image.png")).toBe(true)
      expect(isValidImageUrl("https://example.com/image.webp")).toBe(true)
    })

    test("should return true for data URLs", () => {
      expect(isValidImageUrl("data:image/png;base64,abc123")).toBe(true)
    })

    test("should return true for placeholder SVGs", () => {
      expect(isValidImageUrl("/placeholder.svg?text=Wine")).toBe(true)
    })

    test("should return false for invalid URLs", () => {
      expect(isValidImageUrl("not-a-url")).toBe(false)
    })

    test("should return false for non-image URLs", () => {
      expect(isValidImageUrl("https://example.com/document.pdf")).toBe(false)
    })
  })
})
