
DELETE FROM public.newsletter_subscribers
WHERE email !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$';

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_email_format
  CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$');

DROP POLICY IF EXISTS "newsletter anon insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter auth insert" ON public.newsletter_subscribers;

CREATE POLICY "newsletter anon insert"
ON public.newsletter_subscribers
FOR INSERT
TO anon
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
);

CREATE POLICY "newsletter auth insert"
ON public.newsletter_subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
);
