/*
  # User Authentication System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `guest_id` (text, for anonymous users)
      - `display_name` (text)
      - `is_guest` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `category` (text, e.g., 'letters', 'words', 'phrases')
      - `item_id` (text, e.g., 'A', 'hola', etc.)
      - `completed` (boolean)
      - `attempts` (integer)
      - `last_practiced` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own data
    - Guest users can access data by guest_id
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id text UNIQUE,
  display_name text,
  email text,
  is_guest boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'letters', 'words', 'phrases', 'lessons'
  item_id text NOT NULL, -- 'A', 'hola', 'lesson_1', etc.
  completed boolean DEFAULT false,
  attempts integer DEFAULT 0,
  score integer DEFAULT 0, -- For future scoring system
  last_practiced timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy for guest users (public access by guest_id)
CREATE POLICY "Guest users can access by guest_id"
  ON user_profiles
  FOR ALL
  TO public
  USING (is_guest = true);

-- Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Policy for guest progress (public access)
CREATE POLICY "Guest users can manage progress"
  ON user_progress
  FOR ALL
  TO public
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE is_guest = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_guest_id ON user_profiles(guest_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_profile_id ON user_progress(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_category ON user_progress(category);
CREATE INDEX IF NOT EXISTS idx_user_progress_item_id ON user_progress(item_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();