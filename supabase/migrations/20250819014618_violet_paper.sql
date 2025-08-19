/*
  # Update Ñ image URL

  1. Changes
    - Update the image_url for the Ñ character from LSG_Ñ to LSG_ENE
    - This matches the actual filename in Supabase Storage

  2. Reason
    - The Ñ character filename was changed to LSG_ENE in storage
    - Need to update the database to reflect this change
*/

-- Update the Ñ character image URL
UPDATE letters 
SET image_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_ENE'
WHERE character = 'Ñ';