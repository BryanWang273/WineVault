-- Enable Row Level Security for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own orders
CREATE POLICY "Allow authenticated users to insert orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own orders
CREATE POLICY "Allow users to view their own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own orders (optional)
CREATE POLICY "Allow users to update their own orders" 
ON orders FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow all authenticated users to view all orders (for admin access)
CREATE POLICY "Allow all authenticated users to view all orders" 
ON orders FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to update all orders (for admin access)
CREATE POLICY "Allow all authenticated users to update all orders" 
ON orders FOR UPDATE 
USING (auth.uid() IS NOT NULL);
