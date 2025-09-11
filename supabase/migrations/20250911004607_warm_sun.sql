/*
  # Fix User Profile RLS Policies - Version 2

  1. Security Updates
    - Drop all existing conflicting policies
    - Create new simplified policies that allow proper migration
    - Ensure authenticated users can claim guest profiles
    - Maintain security while allowing legitimate operations

  2. Changes
    - Remove all existing user_profiles policies
    - Create new policies that handle guest-to-auth migration
    - Fix user_progress policies to work with migrations
*/

-- Drop ALL existing policies for user_profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Guest users can access by guest_id" ON user_profiles;
DROP POLICY IF EXISTS "Users can claim guest profiles" ON user_profiles;

-- Create new simplified policies for user_profiles
CREATE POLICY "Allow public read for guest profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (is_guest = true);

CREATE POLICY "Allow authenticated users to read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Allow public insert for guest profiles"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (is_guest = true AND auth_user_id IS NULL);

CREATE POLICY "Allow authenticated users to insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Allow public update for guest profiles"
  ON user_profiles
  FOR UPDATE
  TO public
  USING (is_guest = true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id OR is_guest = true)
  WITH CHECK (auth.uid() = auth_user_id);

-- Drop and recreate user_progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
DROP POLICY IF EXISTS "Guest users can manage progress" ON user_progress;

CREATE POLICY "Allow public access to progress for guest profiles"
  ON user_progress
  FOR ALL
  TO public
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE is_guest = true
    )
  );

CREATE POLICY "Allow authenticated users to manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );