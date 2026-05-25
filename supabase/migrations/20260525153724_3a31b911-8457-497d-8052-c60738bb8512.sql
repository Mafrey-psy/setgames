-- Sync logs table
CREATE TABLE public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  inserted_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  message text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_logs admin read" ON public.sync_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "sync_logs admin all" ON public.sync_logs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add source_id to games for dedup (nullable, unique when present)
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS source_id text;
CREATE UNIQUE INDEX IF NOT EXISTS games_source_id_uniq ON public.games (source_id) WHERE source_id IS NOT NULL;

-- Extensions for cron + http
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule: every Friday 13:00 SP (UTC-3) = 16:00 UTC
SELECT cron.schedule(
  'sync-free-games-weekly',
  '0 16 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://project--b8ded7e4-50d5-4bb7-9884-461e6a54168f.lovable.app/api/public/sync-games',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dWJldHBqcXNpamJjdnZieGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk3MTQsImV4cCI6MjA5NTI4NTcxNH0.JA2KLkyhRnhcD-69H8IfW-TxRYlQZ87gEIQkkPnsxek"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);