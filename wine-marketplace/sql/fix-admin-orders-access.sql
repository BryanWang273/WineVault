-- First, check if the RLS is enabled for orders table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'orders';

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow users to view their own orders" ON orders;
DROP POLICY IF EXISTS "Allow users to update their own orders" ON orders;
DROP POLICY IF EXISTS "Allow all authenticated users to view all orders" ON orders;
DROP POLICY IF EXISTS "Allow all authenticated users to update all orders" ON orders;
DROP POLICY IF EXISTS "Allow any authenticated user to insert orders" ON orders;

-- Create policies for regular users
-- Allow any authenticated user to insert orders
CREATE POLICY "Allow any authenticated user to insert orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own orders
CREATE POLICY "Allow users to view their own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own orders
CREATE POLICY "Allow users to update their own orders" 
ON orders FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a policy that allows any authenticated user to view all orders (for admin access)
CREATE POLICY "Allow all authenticated users to view all orders" 
ON orders FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a policy that allows any authenticated user to update all orders (for admin access)
CREATE POLICY "Allow all authenticated users to update all orders" 
ON orders FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions to authenticated role
GRANT INSERT, SELECT, UPDATE ON orders TO authenticated;

-- Verify the policies have been applied
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;
