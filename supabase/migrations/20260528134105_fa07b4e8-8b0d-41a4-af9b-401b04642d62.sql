
CREATE TABLE public.contact_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_tickets TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_tickets TO authenticated;
GRANT ALL ON public.contact_tickets TO service_role;

ALTER TABLE public.contact_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact anon insert" ON public.contact_tickets
  FOR INSERT TO anon
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
    AND message IS NOT NULL
    AND length(message) BETWEEN 5 AND 2000
  );

CREATE POLICY "contact auth insert" ON public.contact_tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
    AND message IS NOT NULL
    AND length(message) BETWEEN 5 AND 2000
  );

CREATE POLICY "contact admin read" ON public.contact_tickets
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "contact admin update" ON public.contact_tickets
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "contact admin delete" ON public.contact_tickets
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
