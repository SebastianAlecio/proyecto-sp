/*
  # Add Preguntas Category

  1. New Words
    - Add 10 question words in Spanish with proper accents
    - Category: "preguntas"
    - Video URLs point to files without accents (as uploaded)

  2. Words Added
    - Cómo, Cuál, Cuándo, Cuántos, Dónde
    - Para qué, Por qué, Pregunta, Qué, Quién
*/

-- Insert all 10 preguntas
INSERT INTO words (word, video_url, description, category) VALUES
('cómo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Como.mp4', 'Pregunta: cómo', 'preguntas'),
('cuál', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Cual.mp4', 'Pregunta: cuál', 'preguntas'),
('cuándo', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Cuando.mp4', 'Pregunta: cuándo', 'preguntas'),
('cuántos', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Cuantos.mp4', 'Pregunta: cuántos', 'preguntas'),
('dónde', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Donde.mp4', 'Pregunta: dónde', 'preguntas'),
('para qué', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Para_que.mp4', 'Pregunta: para qué', 'preguntas'),
('por qué', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Por_que.mp4', 'Pregunta: por qué', 'preguntas'),
('pregunta', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Pregunta.mp4', 'Pregunta: pregunta', 'preguntas'),
('qué', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Que.mp4', 'Pregunta: qué', 'preguntas'),
('quién', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Quien.mp4', 'Pregunta: quién', 'preguntas');