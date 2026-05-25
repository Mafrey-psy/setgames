
drop policy "newsletter public insert" on public.newsletter_subscribers;
create policy "newsletter anon insert" on public.newsletter_subscribers for insert to anon with check (email is not null and length(email) between 3 and 255);
create policy "newsletter auth insert" on public.newsletter_subscribers for insert to authenticated with check (email is not null and length(email) between 3 and 255);

revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
