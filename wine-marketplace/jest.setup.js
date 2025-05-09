// Import testing-library utilities
import "@testing-library/jest-dom"

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
