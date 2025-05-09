-- Create purchased_wines table
CREATE TABLE IF NOT EXISTS purchased_wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  wine_id INTEGER REFERENCES wines(id),
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

-- Sample data (replace 'your-user-id' with an actual user ID from your auth.users table)
-- You'll need to replace this with an actual user ID when running the query

-- First, let's create a function to insert sample data for a specific user
CREATE OR REPLACE FUNCTION insert_sample_purchased_wines(user_uuid UUID) 
RETURNS void AS $$
BEGIN
  -- Order 1
  INSERT INTO purchased_wines (user_id, wine_id, name, region, year, price, quantity, image, order_id, purchase_date)
  VALUES 
    (user_uuid, 1, 'Château Margaux 2015', 'Bordeaux, France', '2015', 699, 1, '/chateau-margaux-bottle.png', 'WV-123456', NOW() - INTERVAL '30 days'),
    (user_uuid, 2, 'Opus One 2018', 'Napa Valley, USA', '2018', 399, 2, '/elegant-red-wine.png', 'WV-123456', NOW() - INTERVAL '30 days');

  -- Order 2
  INSERT INTO purchased_wines (user_id, wine_id, name, region, year, price, quantity, image, order_id, purchase_date)
  VALUES 
    (user_uuid, 3, 'Dom Pérignon 2012', 'Champagne, France', '2012', 249, 1, '/elegant-champagne.png', 'WV-234567', NOW() - INTERVAL '14 days'),
    (user_uuid, 4, 'Cloudy Bay Sauvignon Blanc 2022', 'Marlborough, New Zealand', '2022', 39, 3, '/sauvignon-blanc-bottle.png', 'WV-234567', NOW() - INTERVAL '14 days');

  -- Order 3 (most recent)
  INSERT INTO purchased_wines (user_id, wine_id, name, region, year, price, quantity, image, order_id, purchase_date)
  VALUES 
    (user_uuid, 5, 'Tignanello 2019', 'Tuscany, Italy', '2019', 149, 1, '/placeholder.svg?height=300&width=300&query=bottle of Tignanello red wine', 'WV-345678', NOW() - INTERVAL '2 days'),
    (user_uuid, 7, 'Veuve Clicquot Brut', 'Champagne, France', 'NV', 59, 2, '/elegant-champagne.png', 'WV-345678', NOW() - INTERVAL '2 days');
END;
$$ LANGUAGE plpgsql;

-- To use this function, run:
-- SELECT insert_sample_purchased_wines('your-user-id-here');
-- Replace 'your-user-id-here' with an actual UUID from your auth.users table
