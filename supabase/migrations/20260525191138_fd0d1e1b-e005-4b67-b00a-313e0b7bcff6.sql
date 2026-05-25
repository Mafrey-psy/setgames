
-- 1) App secrets table (deny-all RLS; only service role can read)
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
-- no policies = deny-all for anon/authenticated; service role bypasses RLS

-- Seed cron secret if missing
INSERT INTO public.app_secrets (key, value)
SELECT 'cron_secret', encode(gen_random_bytes(32), 'hex')
WHERE NOT EXISTS (SELECT 1 FROM public.app_secrets WHERE key = 'cron_secret');

-- 2) Fix user_roles restrictive policy: should only block writes, not reads
DROP POLICY IF EXISTS "user_roles non admin no write" ON public.user_roles;

CREATE POLICY "user_roles non admin no insert"
ON public.user_roles AS RESTRICTIVE
FOR INSERT TO anon, authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_roles non admin no update"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_roles non admin no delete"
ON public.user_roles AS RESTRICTIVE
FOR DELETE TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Rotate cron job to include the secret header
DO $$
DECLARE _jid bigint;
DECLARE _secret text;
BEGIN
  SELECT jobid INTO _jid FROM cron.job WHERE jobname = 'sync-free-games-weekly';
  IF _jid IS NOT NULL THEN
    PERFORM cron.unschedule(_jid);
  END IF;

  SELECT value INTO _secret FROM public.app_secrets WHERE key = 'cron_secret';

  PERFORM cron.schedule(
    'sync-free-games-weekly',
    '0 16 * * 5',
    format($f$
      SELECT extensions.http_post(
        url := 'https://project--b8ded7e4-50d5-4bb7-9884-461e6a54168f.lovable.app/api/public/sync-games',
        headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', %L),
        body := '{"trigger":"cron"}'::jsonb
      );
    $f$, _secret)
  );
END $$;
