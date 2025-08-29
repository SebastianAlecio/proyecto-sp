-- First, remove any existing frases_emociones to avoid duplicates
DELETE FROM words WHERE category = 'frases_emociones';

-- Insert all 28 frases y emociones
INSERT INTO words (word, video_url, description, category) VALUES
('adiós', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Adios.mp4', 'Frase: adiós', 'frases_emociones'),
('aplausos', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Aplausos.mp4', 'Frase: aplausos', 'frases_emociones'),
('bienvenido', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Bienvenido.mp4', 'Frase: bienvenido', 'frases_emociones'),
('buen provecho', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Buen_provecho.mp4', 'Frase: buen provecho', 'frases_emociones'),
('buenas noches', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Buenas_noches.mp4', 'Frase: buenas noches', 'frases_emociones'),
('buenas tardes', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Buenas_tardes.mp4', 'Frase: buenas tardes', 'frases_emociones'),
('buenos días', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Buenos_dias.mp4', 'Frase: buenos días', 'frases_emociones'),
('cómo estás', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Como_estas.mp4', 'Frase: cómo estás', 'frases_emociones'),
('de nada', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/De_nada.mp4', 'Frase: de nada', 'frases_emociones'),
('dios te bendiga', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Dios_te_bendiga.mp4', 'Frase: dios te bendiga', 'frases_emociones'),
('disculpa', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Disculpa.mp4', 'Frase: disculpa', 'frases_emociones'),
('entendiste', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Entendiste.mp4', 'Frase: entendiste', 'frases_emociones'),
('feliz cumpleaños', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Feliz_cumpleanos.mp4', 'Frase: feliz cumpleaños', 'frases_emociones'),
('gracias', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Gracias.mp4', 'Frase: gracias', 'frases_emociones'),
('hola', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Hola.mp4', 'Frase: hola', 'frases_emociones'),
('me equivoqué', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Me_equivoque.mp4', 'Frase: me equivoqué', 'frases_emociones'),
('me gusta', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Me_gusta.mp4', 'Frase: me gusta', 'frases_emociones'),
('mi apodo es', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Mi_apodo_es.mp4', 'Frase: mi apodo es', 'frases_emociones'),
('mi nombre', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Mi_nombre.mp4', 'Frase: mi nombre', 'frases_emociones'),
('mucho gusto', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Mucho_gusto.mp4', 'Frase: mucho gusto', 'frases_emociones'),
('no importa', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/No_importa.mp4', 'Frase: no importa', 'frases_emociones'),
('no sé', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/No_se.mp4', 'Frase: no sé', 'frases_emociones'),
('no', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/No.mp4', 'Frase: no', 'frases_emociones'),
('ok', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Ok.mp4', 'Frase: ok', 'frases_emociones'),
('permiso', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Permiso.mp4', 'Frase: permiso', 'frases_emociones'),
('por favor', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Por_favor.mp4', 'Frase: por favor', 'frases_emociones'),
('sí', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Si.mp4', 'Frase: sí', 'frases_emociones'),
('tal vez', 'https://aipphlqzhtkwmlnkkrgt.supabase.co/storage/v1/object/public/word-videos/Tal_vez.mp4', 'Frase: tal vez', 'frases_emociones');