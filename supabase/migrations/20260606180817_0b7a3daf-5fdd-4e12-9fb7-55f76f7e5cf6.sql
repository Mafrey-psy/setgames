CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT SELECT ON public.faqs TO anon;
GRANT ALL ON public.faqs TO service_role;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs public read" ON public.faqs
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "faqs admin all" ON public.faqs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.faqs_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.faqs_set_updated_at();

INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('Os jogos grátis são realmente meus?', 'Sim. Ao resgatar dentro do prazo, o jogo fica permanentemente na sua biblioteca.', 1),
  ('Por que não listam free-to-play?', 'Free-to-play está sempre grátis e não é notícia. Aqui só entram jogos pagos liberados por tempo limitado.', 2),
  ('Posso jogar offline?', 'Depende do launcher — Steam permite modo offline; Epic exige login inicial.', 3);