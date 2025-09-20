/*
  # Add Streak System to User Profiles

  1. New Columns
    - `current_streak` (integer): Días consecutivos actuales
    - `max_streak` (integer): Récord histórico de días consecutivos
    - `last_activity_date` (date): Última fecha de actividad para calcular rachas

  2. Changes
    - Add streak columns to user_profiles table
    - Set default values for existing users
*/

-- Add streak columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date date;

-- Update existing users to have default streak values
UPDATE user_profiles 
SET current_streak = 0, max_streak = 0, last_activity_date = CURRENT_DATE
WHERE current_streak IS NULL OR max_streak IS NULL OR last_activity_date IS NULL;