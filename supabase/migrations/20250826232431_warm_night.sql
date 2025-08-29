-- Insert the missing 'cómo estás' phrase
INSERT INTO words (word, video_url, description, category) VALUES
('cómo estás', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Como_estas.mp4', 'Frase: cómo estás', 'frases_emociones')
ON CONFLICT (word) DO NOTHING;