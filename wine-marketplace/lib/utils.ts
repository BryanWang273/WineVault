import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false

  // Check if it's a valid URL format
  try {
    new URL(url)
  } catch (e) {
    return false
  }

  // Check if it's a common image extension or data URL for images
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]
  const isDataUrl = url.startsWith("data:image/")
  const hasImageExtension = imageExtensions.some((ext) => url.toLowerCase().endsWith(ext))

  return isDataUrl || hasImageExtension || url.includes("/placeholder.svg")
}
