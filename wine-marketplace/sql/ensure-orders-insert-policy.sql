-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;

-- Create a clear policy for inserting orders
CREATE POLICY "Allow authenticated users to insert orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Verify the policy exists
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders';

-- Grant necessary permissions
GRANT INSERT ON orders TO authenticated;
GRANT USAGE ON SEQUENCE orders_id_seq TO authenticated;
