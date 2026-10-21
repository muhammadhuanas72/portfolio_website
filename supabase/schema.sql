-- Portfolio content editable only by the owner.
-- Run once in the Supabase SQL editor. Re-running is safe.
-- Everyone can read; only the owner's signed-in account can write.

-- ---------------------------------------------------------------- owner check
create or replace function public.is_portfolio_owner()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'muhammadhuanas72@gmail.com', false)
$$;

-- ---------------------------------------------------------------- tables
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  sort        integer not null default 0,
  category    text not null default 'web' check (category in ('web', 'data')),
  year        text,
  title       text not null check (char_length(title) between 1 and 120),
  subtitle    text,
  details     text,
  features    text[] not null default '{}',
  tech        text[] not null default '{}',
  demo_url    text check (demo_url is null or demo_url ~* '^https?://'),
  github_url  text check (github_url is null or github_url ~* '^https?://'),
  image_path  text
);

-- Edited copies of built-in projects point at the original's id; uploads add a downloadable file.
alter table public.projects add column if not exists replaces  text;
alter table public.projects add column if not exists file_path text;
alter table public.projects add column if not exists file_name text;
create unique index if not exists projects_replaces_key on public.projects (replaces) where replaces is not null;

-- A row whose slug matches a built-in resume replaces that file; any other slug is an extra resume.
create table if not exists public.resumes (
  slug        text primary key,
  label       text not null,
  path        text not null,
  updated_at  timestamptz not null default now()
);
alter table public.resumes add column if not exists created_at timestamptz not null default now();
alter table public.resumes drop constraint if exists resumes_slug_check;
alter table public.resumes drop constraint if exists resumes_slug_format;
alter table public.resumes add constraint resumes_slug_format check (slug ~ '^[a-z0-9-]{1,80}$');
alter table public.resumes drop constraint if exists resumes_label_length;
alter table public.resumes add constraint resumes_label_length check (char_length(label) between 1 and 60);

-- Built-in projects and resumes (from the code) that the owner has removed from the site.
create table if not exists public.hidden (
  kind        text not null check (kind in ('project', 'resume')),
  item_id     text not null,
  created_at  timestamptz not null default now(),
  primary key (kind, item_id)
);

alter table public.projects enable row level security;
alter table public.resumes  enable row level security;
alter table public.hidden   enable row level security;

drop policy if exists "projects are public"      on public.projects;
drop policy if exists "owner manages projects"   on public.projects;
drop policy if exists "resumes are public"       on public.resumes;
drop policy if exists "owner manages resumes"    on public.resumes;
drop policy if exists "hidden is public"         on public.hidden;
drop policy if exists "owner manages hidden"     on public.hidden;

create policy "hidden is public" on public.hidden
  for select using (true);
create policy "owner manages hidden" on public.hidden
  for all to authenticated
  using (public.is_portfolio_owner())
  with check (public.is_portfolio_owner());

create policy "projects are public" on public.projects
  for select using (true);
create policy "owner manages projects" on public.projects
  for all to authenticated
  using (public.is_portfolio_owner())
  with check (public.is_portfolio_owner());

create policy "resumes are public" on public.resumes
  for select using (true);
create policy "owner manages resumes" on public.resumes
  for all to authenticated
  using (public.is_portfolio_owner())
  with check (public.is_portfolio_owner());

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('resumes',        'resumes',        true, 5242880, array['application/pdf']),
  ('project-images', 'project-images', true, 4194304, array['image/png', 'image/jpeg', 'image/webp']),
  ('project-files',  'project-files',  true, 52428800, array[
    'application/octet-stream', 'application/pdf', 'text/csv', 'application/zip', 'application/x-zip-compressed',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owner uploads portfolio files" on storage.objects;
drop policy if exists "owner updates portfolio files" on storage.objects;
drop policy if exists "owner deletes portfolio files" on storage.objects;
drop policy if exists "owner lists portfolio files"   on storage.objects;

-- Storage looks a file up before removing or replacing it, so deletes need a select policy too.
create policy "owner lists portfolio files" on storage.objects
  for select to authenticated
  using (bucket_id in ('resumes', 'project-images', 'project-files') and public.is_portfolio_owner());

create policy "owner uploads portfolio files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('resumes', 'project-images', 'project-files') and public.is_portfolio_owner());
create policy "owner updates portfolio files" on storage.objects
  for update to authenticated
  using (bucket_id in ('resumes', 'project-images', 'project-files') and public.is_portfolio_owner());
create policy "owner deletes portfolio files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('resumes', 'project-images', 'project-files') and public.is_portfolio_owner());
-- Public buckets serve files by URL, so no public select policy on storage.objects is needed.
