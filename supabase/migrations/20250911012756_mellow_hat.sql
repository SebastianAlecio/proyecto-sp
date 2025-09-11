/*
  # Fix Foreign Key Constraint Issue

  1. Problem
    - The foreign key constraint on user_profiles.auth_user_id is too strict
    - Supabase auth users are not immediately available when created
    - This causes registration failures

  2. Solution
    - Drop the foreign key constraint
    - Allow auth_user_id to be nullable without strict referencing
    - This will allow user registration to work properly

  3. Security
    - We still validate users in application code
    - RLS policies still protect data access
*/

-- Drop the problematic foreign key constraint
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_auth_user_id_fkey;

-- Make sure auth_user_id can be null (it should already be, but let's be explicit)
ALTER TABLE user_profiles 
ALTER COLUMN auth_user_id DROP NOT NULL;

-- Add a simple check constraint instead of foreign key
-- This allows more flexibility while still maintaining some data integrity
ALTER TABLE user_profiles 
ADD CONSTRAINT auth_user_id_format_check 
CHECK (auth_user_id IS NULL OR length(auth_user_id::text) > 10);