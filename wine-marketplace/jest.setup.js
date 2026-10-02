// Import testing-library utilities
import "@testing-library/jest-dom"

// lib/supabase.ts reads these at import time. Tests get dummy values so no real project is contacted.
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"

// Mock the next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({
    id: "1",
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock the next/image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Setup global fetch mock
global.fetch = jest.fn()
