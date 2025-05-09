-- Drop the existing purchased_wines table if it exists
DROP TABLE IF EXISTS purchased_wines;

-- Create purchased_wines table with proper schema
CREATE TABLE purchased_wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  wine_id INTEGER REFERENCES wines(id) NULL, -- Allow NULL for wines not in the database
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  year TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT NOT NULL,
  order_id TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for purchased_wines
ALTER TABLE purchased_wines ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchased wines
CREATE POLICY "Users can read their own purchased wines" 
ON purchased_wines FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own purchased wines
CREATE POLICY "Users can insert their own purchased wines" 
ON purchased_wines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: Add a policy to allow authenticated users to insert purchased wines
CREATE POLICY "Authenticated users can insert purchased wines" 
ON purchased_wines FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);
