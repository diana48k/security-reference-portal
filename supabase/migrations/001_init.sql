-- =========================================================
-- Installation Reference Portal - Initial Schema
-- Step 5 / Version 1
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1) Helper: updated_at trigger
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 2) Profiles for admin/technical team
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_role_check
    check (role in ('viewer', 'sales', 'tech', 'admin'))
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================================================
-- 3) Lookup tables
-- =========================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_th text not null,
  name_en text,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create table if not exists public.site_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_th text not null,
  name_en text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_site_types_updated_at
before update on public.site_types
for each row
execute function public.set_updated_at();

create table if not exists public.door_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_th text not null,
  name_en text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_door_types_updated_at
before update on public.door_types
for each row
execute function public.set_updated_at();

create table if not exists public.system_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_th text not null,
  name_en text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_system_types_updated_at
before update on public.system_types
for each row
execute function public.set_updated_at();

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_th text not null,
  name_en text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_tags_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

-- =========================================================
-- 4) Main case studies table
-- =========================================================

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,

  category_id uuid references public.categories(id) on delete set null,
  site_type_id uuid references public.site_types(id) on delete set null,
  door_type_id uuid references public.door_types(id) on delete set null,
  primary_system_type_id uuid references public.system_types(id) on delete set null,

  location text,
  customer_name text,

  budget_min numeric(12,2),
  budget_max numeric(12,2),
  user_count int,
  installation_days int,
  installed_at date,

  problem_statement text,
  requirement_summary text,
  solution_statement text,
  installation_notes text,
  sales_notes text,
  tech_notes text,
  customer_visible_notes text,

  status text not null default 'draft',
  is_featured boolean not null default false,
  view_count int not null default 0,
  published_at timestamptz,

  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint case_studies_status_check
    check (status in ('draft', 'published', 'archived'))
);

create trigger set_case_studies_updated_at
before update on public.case_studies
for each row
execute function public.set_updated_at();

-- =========================================================
-- 5) Case tags
-- =========================================================

create table if not exists public.case_tags (
  case_id uuid not null references public.case_studies(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (case_id, tag_id)
);

-- =========================================================
-- 6) Images
-- =========================================================

create table if not exists public.case_images (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.case_studies(id) on delete cascade,
  kind text not null,
  image_url text not null,
  storage_path text,
  caption text,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),

  constraint case_images_kind_check
    check (kind in ('before', 'after', 'gallery', 'diagram'))
);

-- =========================================================
-- 7) Documents
-- =========================================================

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.case_studies(id) on delete cascade,
  kind text not null,
  file_url text not null,
  storage_path text,
  file_name text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),

  constraint case_documents_kind_check
    check (kind in ('pdf', 'drawing', 'spec', 'brochure', 'quotation_example', 'other'))
);

-- =========================================================
-- 8) FAQs
-- =========================================================

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category_id uuid references public.categories(id) on delete set null,
  case_id uuid references public.case_studies(id) on delete cascade,
  is_global boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_faqs_updated_at
before update on public.faqs
for each row
execute function public.set_updated_at();

-- =========================================================
-- 9) Search indexes
-- =========================================================

create index if not exists idx_case_studies_status
on public.case_studies(status);

create index if not exists idx_case_studies_category
on public.case_studies(category_id);

create index if not exists idx_case_studies_site_type
on public.case_studies(site_type_id);

create index if not exists idx_case_studies_door_type
on public.case_studies(door_type_id);

create index if not exists idx_case_studies_system_type
on public.case_studies(primary_system_type_id);

create index if not exists idx_case_studies_featured
on public.case_studies(is_featured);

create index if not exists idx_case_images_case
on public.case_images(case_id);

create index if not exists idx_case_documents_case
on public.case_documents(case_id);

create index if not exists idx_faqs_category
on public.faqs(category_id);

-- =========================================================
-- 10) Full-text search support
-- =========================================================

alter table public.case_studies
add column if not exists search_vector tsvector generated always as (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(problem_statement, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(solution_statement, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(sales_notes, '')), 'C')
) stored;

create index if not exists idx_case_studies_search_vector
on public.case_studies
using gin(search_vector);

-- =========================================================
-- 11) Helper function: admin check
-- =========================================================

create or replace function public.is_admin_or_tech()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'tech')
  );
$$;

-- =========================================================
-- 12) Enable RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.site_types enable row level security;
alter table public.door_types enable row level security;
alter table public.system_types enable row level security;
alter table public.tags enable row level security;
alter table public.case_studies enable row level security;
alter table public.case_tags enable row level security;
alter table public.case_images enable row level security;
alter table public.case_documents enable row level security;
alter table public.faqs enable row level security;

-- =========================================================
-- 13) RLS policies
-- =========================================================

-- Profiles
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Admin and tech can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

-- Lookup public read
create policy "Anyone can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Admin and tech can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

create policy "Anyone can read active site types"
on public.site_types
for select
to anon, authenticated
using (is_active = true);

create policy "Admin and tech can manage site types"
on public.site_types
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

create policy "Anyone can read active door types"
on public.door_types
for select
to anon, authenticated
using (is_active = true);

create policy "Admin and tech can manage door types"
on public.door_types
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

create policy "Anyone can read active system types"
on public.system_types
for select
to anon, authenticated
using (is_active = true);

create policy "Admin and tech can manage system types"
on public.system_types
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

create policy "Anyone can read active tags"
on public.tags
for select
to anon, authenticated
using (is_active = true);

create policy "Admin and tech can manage tags"
on public.tags
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

-- Cases
create policy "Anyone can read published cases"
on public.case_studies
for select
to anon, authenticated
using (status = 'published');

create policy "Admin and tech can manage all cases"
on public.case_studies
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

-- Case tags
create policy "Anyone can read tags of published cases"
on public.case_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.case_studies cs
    where cs.id = case_tags.case_id
      and cs.status = 'published'
  )
);

create policy "Admin and tech can manage case tags"
on public.case_tags
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

-- Images
create policy "Anyone can read images of published cases"
on public.case_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.case_studies cs
    where cs.id = case_images.case_id
      and cs.status = 'published'
  )
);

create policy "Admin and tech can manage case images"
on public.case_images
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

-- Documents
create policy "Anyone can read documents of published cases"
on public.case_documents
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.case_studies cs
    where cs.id = case_documents.case_id
      and cs.status = 'published'
  )
);

create policy "Admin and tech can manage case documents"
on public.case_documents
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());

-- FAQs
create policy "Anyone can read active FAQs"
on public.faqs
for select
to anon, authenticated
using (is_active = true);

create policy "Admin and tech can manage FAQs"
on public.faqs
for all
to authenticated
using (public.is_admin_or_tech())
with check (public.is_admin_or_tech());