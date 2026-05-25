ALTER TABLE public.games ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS reviews_summary text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS reviews_summary_updated_at timestamptz;

UPDATE public.games SET image_url = 'https://cdn.akamai.steamstatic.com/steam/apps/870780/header.jpg' WHERE title = 'Control: Ultimate Edition' AND image_url IS NULL;
UPDATE public.games SET image_url = 'https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg' WHERE title = 'Hollow Knight' AND image_url IS NULL;
UPDATE public.games SET image_url = 'https://cdn.akamai.steamstatic.com/steam/apps/964440/header.jpg' WHERE title = 'Alan Wake Remastered' AND image_url IS NULL;
UPDATE public.games SET image_url = 'https://cdn.akamai.steamstatic.com/steam/apps/264710/header.jpg' WHERE title = 'Subnautica' AND image_url IS NULL;
UPDATE public.games SET image_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1850570/header.jpg' WHERE title = 'Death Stranding' AND image_url IS NULL;