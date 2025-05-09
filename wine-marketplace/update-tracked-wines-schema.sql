-- Add tracking_status column to tracked_wines table
ALTER TABLE tracked_wines 
ADD COLUMN tracking_status TEXT NOT NULL DEFAULT 'tracking';

-- Update existing records to have 'tracking' status
UPDATE tracked_wines SET tracking_status = 'tracking';

-- Comment out or drop the purchased_wines table if it exists
-- DROP TABLE IF EXISTS purchased_wines;

-- Create an index on tracking_status for faster queries
CREATE INDEX idx_tracked_wines_tracking_status ON tracked_wines(tracking_status);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can read their own tracked wines" ON tracked_wines;
CREATE POLICY "Users can read their own tracked wines" 
ON tracked_wines FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tracked wines" ON tracked_wines;
CREATE POLICY "Users can insert their own tracked wines" 
ON tracked_wines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tracked wines" ON tracked_wines;
CREATE POLICY "Users can update their own tracked wines" 
ON tracked_wines FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tracked wines" ON tracked_wines;
CREATE POLICY "Users can delete their own tracked wines" 
ON tracked_wines FOR DELETE 
USING (auth.uid() = user_id);
