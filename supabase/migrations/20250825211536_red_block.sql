-- Update video URLs for words with accents/special characters
UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Pequeno.mp4'
WHERE word = 'pequeño';

UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Rapido.mp4'
WHERE word = 'rápido';

UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Ridiculo.mp4'
WHERE word = 'ridículo';

UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Dificil.mp4'
WHERE word = 'difícil';

UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Facil.mp4'
WHERE word = 'fácil';

UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Frio.mp4'
WHERE word = 'frío';

UPDATE words 
SET video_url = 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Haragan.mp4'
WHERE word = 'haragán';