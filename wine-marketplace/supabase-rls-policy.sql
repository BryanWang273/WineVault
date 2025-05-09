--RLS policy to allow authenticated users to insert wines
CREATE POLICY "Allow authenticated users to insert wines" 
ON wines FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

--RLS policy to allow authenticated users to update wines
CREATE POLICY "Allow authenticated users to update wines" 
ON wines FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- RLS policy to allow authenticated users to delete wines
CREATE POLICY "Allow authenticated users to delete wines" 
ON wines FOR DELETE
USING (auth.uid() IS NOT NULL);
