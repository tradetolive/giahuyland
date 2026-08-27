-- GiaHuy Land: schema và phân quyền cho dashboard quản trị.
-- Chạy toàn bộ file này trong Supabase SQL Editor bằng tài khoản project owner.
-- Không đưa service_role key vào website hoặc source code.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  summary text not null default '' check (char_length(summary) <= 700),
  property_type text not null default 'Đất nền',
  location text not null default '',
  price_billion numeric(12,2) not null check (price_billion >= 0),
  area_sqm numeric(12,2) not null check (area_sqm > 0),
  frontage_m numeric(12,2),
  direction text not null default '',
  legal_summary text not null default '',
  accent text not null default 'forest' check (accent in ('forest', 'clay', 'gold')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_image_path text,
  gallery_paths jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery_paths) = 'array'),
  legal_document_path text,
  legal_document_name text,
  author_id uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_public_feed_idx
  on public.listings (status, published_at desc, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and (old.status is distinct from 'published' or new.published_at is null) then
    new.published_at = coalesce(new.published_at, now());
  end if;
  if new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.listings enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.listings from anon, authenticated;
grant select on table public.listings to anon, authenticated;
grant insert, update, delete on table public.listings to authenticated;

drop policy if exists "Admins can read their role" on public.admin_users;
create policy "Admins can read their role"
on public.admin_users for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Public can read published listings" on public.listings;
create policy "Public can read published listings"
on public.listings for select to anon, authenticated
using (status = 'published' or (select public.is_admin()));

drop policy if exists "Admins can create listings" on public.listings;
create policy "Admins can create listings"
on public.listings for insert to authenticated
with check ((select public.is_admin()) and author_id = (select auth.uid()));

drop policy if exists "Admins can update listings" on public.listings;
create policy "Admins can update listings"
on public.listings for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete listings" on public.listings;
create policy "Admins can delete listings"
on public.listings for delete to authenticated
using ((select public.is_admin()));

-- Ảnh marketing được phép public trên website. Sổ đỏ/tài liệu pháp lý luôn private.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media',
  'property-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-documents',
  'property-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "Admins upload property media" on storage.objects;
create policy "Admins upload property media"
on storage.objects for insert to authenticated
with check (bucket_id = 'property-media' and (select public.is_admin()));

drop policy if exists "Admins update property media" on storage.objects;
create policy "Admins update property media"
on storage.objects for update to authenticated
using (bucket_id = 'property-media' and (select public.is_admin()))
with check (bucket_id = 'property-media' and (select public.is_admin()));

drop policy if exists "Admins delete property media" on storage.objects;
create policy "Admins delete property media"
on storage.objects for delete to authenticated
using (bucket_id = 'property-media' and (select public.is_admin()));

drop policy if exists "Admins manage property documents" on storage.objects;
create policy "Admins manage property documents"
on storage.objects for all to authenticated
using (bucket_id = 'property-documents' and (select public.is_admin()))
with check (bucket_id = 'property-documents' and (select public.is_admin()));

-- Sau khi tạo user quản trị trong Authentication → Users, chạy đúng một lần:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'tatylic@gmail.com'
-- on conflict (user_id) do nothing;
