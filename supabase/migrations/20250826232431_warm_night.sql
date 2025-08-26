/*
  # Add missing 'cómo estás' phrase

  1. Data
    - Insert the missing 'cómo estás' phrase that exists in storage but not in database
    - Video stored as 'Como_estas.mp4' in Supabase Storage
    - Categorized as 'frases_emociones'

  2. Fix
    - This phrase was missing from previous migrations
    - Storage file exists but database entry was missing
*/

-- Insert the missing 'cómo estás' phrase
INSERT INTO words (word, video_url, description, category) VALUES
('cómo estás', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Como_estas.mp4', 'Frase: cómo estás', 'frases_emociones')
ON CONFLICT (word) DO NOTHING;