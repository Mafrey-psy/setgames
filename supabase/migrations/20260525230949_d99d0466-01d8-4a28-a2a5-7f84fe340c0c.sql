-- Update default value for author column in culture_posts table
ALTER TABLE public.culture_posts ALTER COLUMN author SET DEFAULT 'Set Games';

-- Update existing records if they have the old default
UPDATE public.culture_posts SET author = 'Set Games' WHERE author = 'Portal Gamer';
