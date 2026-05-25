
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles self read" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "user_roles admin all" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Games
create table public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  platform text not null check (platform in ('epic','steam','gog','playstation','xbox')),
  genre text[] not null default '{}',
  original_price text not null,
  free_until timestamptz not null,
  developer text not null,
  rating numeric(2,1) not null default 4.0,
  url text not null,
  accent text not null default 'from-fuchsia-600 to-rose-500',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.games enable row level security;
create policy "games public read" on public.games for select using (published = true);
create policy "games admin all" on public.games for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Guides
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'BookOpen',
  read_time text not null default '5 min',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.guides enable row level security;
create policy "guides public read" on public.guides for select using (published = true);
create policy "guides admin all" on public.guides for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Culture posts
create table public.culture_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  author text not null default 'Portal Gamer',
  published_at timestamptz not null default now(),
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.culture_posts enable row level security;
create policy "culture public read" on public.culture_posts for select using (published = true);
create policy "culture admin all" on public.culture_posts for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Newsletter
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "newsletter public insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter admin read" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));
