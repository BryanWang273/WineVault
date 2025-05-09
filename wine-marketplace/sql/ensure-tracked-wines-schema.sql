-- Check if tracking_status column exists in tracked_wines table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tracked_wines'
        AND column_name = 'tracking_status'
    ) THEN
        ALTER TABLE tracked_wines ADD COLUMN tracking_status TEXT NOT NULL DEFAULT 'tracking';
    END IF;
END $$;

-- Ensure RLS policies are set up correctly
-- Check if the policy exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'tracked_wines'
        AND policyname =
