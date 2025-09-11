/*
  # Fix User Profile RLS Policies

  1. Security Updates
    - Allow authenticated users to update guest profiles when migrating
    - Fix policies for profile migration from guest to authenticated user
    - Ensure proper permissions for user registration flow

  2. Changes
    - Update user_profiles policies to allow migration
    - Add policy for authenticated users to update profiles they're claiming
    - Maintain security while allowing legitimate migrations
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create more flexible policies for authenticated users
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = auth_user_id OR 
    (is_guest = true AND auth_user_id IS NULL)
  )
  WITH CHECK (
    auth.uid() = auth_user_id
  );

-- Allow authenticated users to claim guest profiles during migration
CREATE POLICY "Users can claim guest profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    is_guest = true AND 
    auth_user_id IS NULL
  )
  WITH CHECK (
    auth.uid() = auth_user_id AND
    is_guest = false
  );

-- Update user_progress policies to handle profile migrations
DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;

CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles 
      WHERE auth_user_id = auth.uid() OR 
            (is_guest = true AND auth_user_id IS NULL)
    )
  )
  WITH CHECK (
    user_profile_id IN (
      SELECT id FROM user_profiles 
      WHERE auth_user_id = auth.uid()
    )
  );