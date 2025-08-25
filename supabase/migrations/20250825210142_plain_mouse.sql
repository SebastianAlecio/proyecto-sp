/*
  # Create words table for complete sign language words

  1. New Tables
    - `words`
      - `id` (uuid, primary key)
      - `word` (text, unique, the complete word)
      - `video_url` (text, URL to the video file)
      - `description` (text, optional description)
      - `category` (text, for organizing words by categories)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `words` table
    - Add policy for public read access

  3. Data
    - Insert all 53 adjetivos with their video URLs
    - Videos will be stored in Supabase Storage under 'word-videos' bucket

  4. Indexes
    - Add index on word for faster searches
    - Add index on category for filtering
*/

-- Create the words table
CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  video_url text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Words are publicly readable"
  ON words
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);

-- Insert all adjetivos (53 words)
INSERT INTO words (word, video_url, description, category) VALUES
('adulto', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Adulto.mp4', 'Adjetivo: adulto', 'adjetivos'),
('bonito', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Bonito.mp4', 'Adjetivo: bonito', 'adjetivos'),
('bueno', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Bueno.mp4', 'Adjetivo: bueno', 'adjetivos'),
('chismoso', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Chismoso.mp4', 'Adjetivo: chismoso', 'adjetivos'),
('claro', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Claro.mp4', 'Adjetivo: claro', 'adjetivos'),
('correcto', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Correcto.mp4', 'Adjetivo: correcto', 'adjetivos'),
('cuidado', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Cuidado.mp4', 'Adjetivo: cuidado', 'adjetivos'),
('curioso', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Curioso.mp4', 'Adjetivo: curioso', 'adjetivos'),
('delgado', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Delgado.mp4', 'Adjetivo: delgado', 'adjetivos'),
('desnudo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Desnudo.mp4', 'Adjetivo: desnudo', 'adjetivos'),
('difícil', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Difícil.mp4', 'Adjetivo: difícil', 'adjetivos'),
('divertido', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Divertido.mp4', 'Adjetivo: divertido', 'adjetivos'),
('duro', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Duro.mp4', 'Adjetivo: duro', 'adjetivos'),
('especial', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Especial.mp4', 'Adjetivo: especial', 'adjetivos'),
('fácil', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Fácil.mp4', 'Adjetivo: fácil', 'adjetivos'),
('feo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Feo.mp4', 'Adjetivo: feo', 'adjetivos'),
('frío', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Frío.mp4', 'Adjetivo: frío', 'adjetivos'),
('gordo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Gordo.mp4', 'Adjetivo: gordo', 'adjetivos'),
('grande', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Grande.mp4', 'Adjetivo: grande', 'adjetivos'),
('guapo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Guapo.mp4', 'Adjetivo: guapo', 'adjetivos'),
('haragán', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Haragán.mp4', 'Adjetivo: haragán', 'adjetivos'),
('importante', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Importante.mp4', 'Adjetivo: importante', 'adjetivos'),
('inteligente', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Inteligente.mp4', 'Adjetivo: inteligente', 'adjetivos'),
('joven', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Joven.mp4', 'Adjetivo: joven', 'adjetivos'),
('lento', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Lento.mp4', 'Adjetivo: lento', 'adjetivos'),
('limpio', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Limpio.mp4', 'Adjetivo: limpio', 'adjetivos'),
('listo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Listo.mp4', 'Adjetivo: listo', 'adjetivos'),
('maduro', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Maduro.mp4', 'Adjetivo: maduro', 'adjetivos'),
('malo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Malo.mp4', 'Adjetivo: malo', 'adjetivos'),
('mentiroso', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Mentiroso.mp4', 'Adjetivo: mentiroso', 'adjetivos'),
('mojado', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Mojado.mp4', 'Adjetivo: mojado', 'adjetivos'),
('muerto', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Muerto.mp4', 'Adjetivo: muerto', 'adjetivos'),
('necesario', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Necesario.mp4', 'Adjetivo: necesario', 'adjetivos'),
('necio', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Necio.mp4', 'Adjetivo: necio', 'adjetivos'),
('nuevo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Nuevo.mp4', 'Adjetivo: nuevo', 'adjetivos'),
('ocupado', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Ocupado.mp4', 'Adjetivo: ocupado', 'adjetivos'),
('oscuro', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Oscuro.mp4', 'Adjetivo: oscuro', 'adjetivos'),
('peligroso', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Peligroso.mp4', 'Adjetivo: peligroso', 'adjetivos'),
('pequeño', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Pequeño.mp4', 'Adjetivo: pequeño', 'adjetivos'),
('perfecto', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Perfecto.mp4', 'Adjetivo: perfecto', 'adjetivos'),
('pobre', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Pobre.mp4', 'Adjetivo: pobre', 'adjetivos'),
('preocupado', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Preocupado.mp4', 'Adjetivo: preocupado', 'adjetivos'),
('rápido', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Rápido.mp4', 'Adjetivo: rápido', 'adjetivos'),
('raro', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Raro.mp4', 'Adjetivo: raro', 'adjetivos'),
('responsable', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Responsable.mp4', 'Adjetivo: responsable', 'adjetivos'),
('rico', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Rico.mp4', 'Adjetivo: rico', 'adjetivos'),
('ridículo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Ridículo.mp4', 'Adjetivo: ridículo', 'adjetivos'),
('sabio', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Sabio.mp4', 'Adjetivo: sabio', 'adjetivos'),
('seco', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Seco.mp4', 'Adjetivo: seco', 'adjetivos'),
('sucio', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Sucio.mp4', 'Adjetivo: sucio', 'adjetivos'),
('tonto', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Tonto.mp4', 'Adjetivo: tonto', 'adjetivos'),
('viejo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Viejo.mp4', 'Adjetivo: viejo', 'adjetivos'),
('vivo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Vivo.mp4', 'Adjetivo: vivo', 'adjetivos');