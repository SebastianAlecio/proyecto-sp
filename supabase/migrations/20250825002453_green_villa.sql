-- Create the words table
CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  video_url text NOT NULL,
  description text,
  category text DEFAULT 'general',
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

-- Insert some example words (you can add your actual words later)
INSERT INTO words (word, video_url, description, category) VALUES
('hola', 'https://your-supabase-url/storage/v1/object/public/word-videos/hola.mp4', 'Saludo básico', 'saludos'),
('gracias', 'https://your-supabase-url/storage/v1/object/public/word-videos/gracias.mp4', 'Expresión de agradecimiento', 'cortesia'),
('adios', 'https://your-supabase-url/storage/v1/object/public/word-videos/adios.mp4', 'Despedida básica', 'saludos'),
('si', 'https://your-supabase-url/storage/v1/object/public/word-videos/si.mp4', 'Afirmación', 'basicas'),
('no', 'https://your-supabase-url/storage/v1/object/public/word-videos/no.mp4', 'Negación', 'basicas');