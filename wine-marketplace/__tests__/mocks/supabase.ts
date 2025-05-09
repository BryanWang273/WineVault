import { jest } from "@jest/globals"

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      order: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: "https://example.com/image.jpg" } })),
    })),
  },
}

// Mock the supabase module
jest.mock("../../lib/supabase", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))
