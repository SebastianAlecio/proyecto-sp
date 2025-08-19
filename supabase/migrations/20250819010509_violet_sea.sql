/*
  # Create Sign Language Database Schema

  1. New Tables
    - `letters`
      - `id` (uuid, primary key)
      - `character` (text, the letter/number/special character)
      - `type` (text, 'letter', 'number', or 'special')
      - `image_url` (text, URL to the sign image)
      - `description` (text, description of the sign)
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on `letters` table
    - Add policy for public read access (since it's educational content)
    
  3. Data
    - Insert all 39 sign language images (A-Z, Ñ, RR, LL, 1-10)
*/

-- Create the letters table
CREATE TABLE IF NOT EXISTS letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('letter', 'number', 'special')),
  image_url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (educational content should be accessible to all)
CREATE POLICY "Letters are publicly readable"
  ON letters
  FOR SELECT
  TO public
  USING (true);

-- Insert all the letters (A-Z)
INSERT INTO letters (character, type, image_url, description) VALUES
('A', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_A', 'Letra A en lenguaje de señas'),
('B', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_B', 'Letra B en lenguaje de señas'),
('C', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_C', 'Letra C en lenguaje de señas'),
('D', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_D', 'Letra D en lenguaje de señas'),
('E', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_E', 'Letra E en lenguaje de señas'),
('F', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_F', 'Letra F en lenguaje de señas'),
('G', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_G', 'Letra G en lenguaje de señas'),
('H', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_H', 'Letra H en lenguaje de señas'),
('I', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_I', 'Letra I en lenguaje de señas'),
('J', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_J', 'Letra J en lenguaje de señas'),
('K', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_K', 'Letra K en lenguaje de señas'),
('L', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_L', 'Letra L en lenguaje de señas'),
('M', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_M', 'Letra M en lenguaje de señas'),
('N', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_N', 'Letra N en lenguaje de señas'),
('Ñ', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_Ñ', 'Letra Ñ en lenguaje de señas'),
('O', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_O', 'Letra O en lenguaje de señas'),
('P', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_P', 'Letra P en lenguaje de señas'),
('Q', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_Q', 'Letra Q en lenguaje de señas'),
('R', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_R', 'Letra R en lenguaje de señas'),
('S', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_S', 'Letra S en lenguaje de señas'),
('T', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_T', 'Letra T en lenguaje de señas'),
('U', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_U', 'Letra U en lenguaje de señas'),
('V', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_V', 'Letra V en lenguaje de señas'),
('W', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_W', 'Letra W en lenguaje de señas'),
('X', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_X', 'Letra X en lenguaje de señas'),
('Y', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_Y', 'Letra Y en lenguaje de señas'),
('Z', 'letter', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_Z', 'Letra Z en lenguaje de señas');

-- Insert special letters (RR, LL)
INSERT INTO letters (character, type, image_url, description) VALUES
('RR', 'special', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_RR', 'Doble R en lenguaje de señas'),
('LL', 'special', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_LL', 'Doble L en lenguaje de señas');

-- Insert numbers (1-10)
INSERT INTO letters (character, type, image_url, description) VALUES
('1', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_1', 'Número 1 en lenguaje de señas'),
('2', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_2', 'Número 2 en lenguaje de señas'),
('3', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_3', 'Número 3 en lenguaje de señas'),
('4', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_4', 'Número 4 en lenguaje de señas'),
('5', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_5', 'Número 5 en lenguaje de señas'),
('6', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_6', 'Número 6 en lenguaje de señas'),
('7', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_7', 'Número 7 en lenguaje de señas'),
('8', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_8', 'Número 8 en lenguaje de señas'),
('9', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_9', 'Número 9 en lenguaje de señas'),
('10', 'number', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/sign-images/LSG_10', 'Número 10 en lenguaje de señas');

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_letters_character ON letters(character);
CREATE INDEX IF NOT EXISTS idx_letters_type ON letters(type);