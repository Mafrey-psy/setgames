DROP POLICY IF EXISTS "games public read" ON public.games;
CREATE POLICY "games public read"
ON public.games
FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "guides public read" ON public.guides;
CREATE POLICY "guides public read"
ON public.guides
FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "culture public read" ON public.culture_posts;
CREATE POLICY "culture public read"
ON public.culture_posts
FOR SELECT
TO anon, authenticated
USING (published = true);