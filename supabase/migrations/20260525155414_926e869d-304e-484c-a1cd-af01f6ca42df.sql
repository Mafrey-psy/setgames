
-- 1) Restrictive policy on user_roles
CREATE POLICY "user_roles non admin no write"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) Move SECURITY DEFINER bodies to private schema
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.has_role(_user_id, _role)
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO postgres, service_role;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;

-- Drop bootstrap function from public API surface (admin already exists)
DROP FUNCTION IF EXISTS public.claim_admin_if_none();

-- 3) Move pg_net out of public. pg_net does not support SET SCHEMA, so drop and recreate.
-- Unschedule existing cron job that depends on it, then re-create after extension is in place.
DO $$
DECLARE _jid bigint;
BEGIN
  SELECT jobid INTO _jid FROM cron.job WHERE jobname = 'sync-free-games-weekly';
  IF _jid IS NOT NULL THEN
    PERFORM cron.unschedule(_jid);
  END IF;
END $$;

DROP EXTENSION IF EXISTS pg_net;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Recreate the weekly sync cron job using the new extensions schema
SELECT cron.schedule(
  'sync-free-games-weekly',
  '0 16 * * 5',
  $cron$
  SELECT extensions.http_post(
    url := 'https://project--b8ded7e4-50d5-4bb7-9884-461e6a54168f.lovable.app/api/public/sync-games',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $cron$
);
