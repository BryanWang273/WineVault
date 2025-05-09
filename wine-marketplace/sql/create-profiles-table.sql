-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create storage bucket for user content if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-content', 'user-content', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-content' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = SUBSTRING(storage.filename(name) from 1 for 36)
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-content' AND (storage.foldername(name))[1] = 'avatars');
