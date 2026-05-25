
create or replace function public.claim_admin_if_none()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare _exists boolean;
begin
  if auth.uid() is null then return false; end if;
  select exists(select 1 from public.user_roles where role = 'admin') into _exists;
  if _exists then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict (user_id, role) do nothing;
  return true;
end;
$$;
revoke execute on function public.claim_admin_if_none() from public, anon;
grant execute on function public.claim_admin_if_none() to authenticated;
