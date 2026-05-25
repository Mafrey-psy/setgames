
CREATE POLICY "app_secrets deny all"
ON public.app_secrets
FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);
