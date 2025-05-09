-- Create a users table to store user information
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically insert a new user when a new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all users" 
  ON users FOR SELECT 
  USING (auth.role() = 'authenticated');
