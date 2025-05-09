import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://dedjurtfbwbepzipmwku.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZGp1cnRmYndiZXB6aXBtd2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDg1NzYsImV4cCI6MjA2MTEyNDU3Nn0.u8C6z0elavY-gDQiytA8D9f1Ex7ry6D0QOXIJ8TGgx8"

export const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      // Add global error handler
      global: {
        fetch: (...args) => {
          return fetch(...args).catch((err) => {
            console.error("Supabase fetch error:", err)
            throw err
          })
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

export const supabase = createSupabaseClient()

// A function to check if the client is working
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("wines").select("count").limit(1)
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return { success: false, error }
  }
}

// Database types based on our schema
export type Wine = {
  id: number
  name: string
  region: string
  year: number | string
  price: number
  rating: number
  reviewCount: number
  ageWorthy: boolean
  description: string
  tastingNotes: string
  agingPotential: {
    drinkFrom: number
    peakMaturity: number
    drinkUntil: number
  }
  storageRecommendations: string
  foodPairings: string[]
  image: string
  images: string[]
  type: string
  grape: string
  created_at?: string
}

export type TrackedWine = {
  id: string
  user_id: string
  wine_id: number
  name: string
  region: string
  year: number | string
  status: "Ready" | "Aging" | "Past Peak"
  storage: string
  // Both snake_case and camelCase versions for flexibility
  aging_progress?: {
    start: string
    peak: string
    end: string
    current: number
  }
  agingProgress?: {
    start: string
    peak: string
    end: string
    current: number
  }
  image?: string
  tasting_notes?: {
    date: string
    rating: number
    notes: string
  }[]
  tastingNotes?: {
    date: string
    rating: number
    notes: string
  }[]
  price?: number
  created_at?: string
  tracking_status?: "tracking" | "untracked" | "consumed"
}

// SQL to run in Supabase SQL Editor to create tables:
/*
-- Create wines table
CREATE TABLE wines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  year TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,1) NOT NULL,
  review_count INTEGER NOT NULL,
  age_worthy BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  tasting_notes TEXT NOT NULL,
  aging_potential JSONB NOT NULL,
  storage_recommendations TEXT NOT NULL,
  food_pairings TEXT[] NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] NOT NULL,
  type TEXT NOT NULL,
  grape TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracked_wines table
CREATE TABLE tracked_wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  wine_id INTEGER REFERENCES wines(id),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  year TEXT NOT NULL,
  status TEXT NOT NULL,
  storage TEXT NOT NULL,
  aging_progress JSONB NOT NULL,
  image TEXT,
  tasting_notes JSONB,
  price DECIMAL(10,2),
  tracking_status TEXT NOT NULL DEFAULT 'tracking',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_wines ENABLE ROW LEVEL SECURITY;

-- Everyone can read wines
CREATE POLICY "Everyone can read wines" 
ON wines FOR SELECT 
USING (true);

-- Users can only read their own tracked wines
CREATE POLICY "Users can read their own tracked wines" 
ON tracked_wines FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own tracked wines
CREATE POLICY "Users can insert their own tracked wines" 
ON tracked_wines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracked wines
CREATE POLICY "Users can update their own tracked wines" 
ON tracked_wines FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own tracked wines
CREATE POLICY "Users can delete their own tracked wines" 
ON tracked_wines FOR DELETE 
USING (auth.uid() = user_id);
*/
