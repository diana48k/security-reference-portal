-- =========================================================
-- User case activity: favorites, recent views, and view counts
-- =========================================================

create table if not exists public.user_case_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.case_studies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, case_id)
);

create index if not exists idx_user_case_favorites_user_created
on public.user_case_favorites(user_id, created_at desc);

create table if not exists public.user_case_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.case_studies(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, case_id)
);

create index if not exists idx_user_case_views_user_viewed
on public.user_case_views(user_id, viewed_at desc);

alter table public.user_case_favorites enable row level security;
alter table public.user_case_views enable row level security;

drop policy if exists "Users can manage own case favorites"
on public.user_case_favorites;

create policy "Users can manage own case favorites"
on public.user_case_favorites
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage own case views"
on public.user_case_views;

create policy "Users can manage own case views"
on public.user_case_views
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.increment_case_view(p_case_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.case_studies
  set view_count = view_count + 1
  where id = p_case_id
    and status = 'published';
$$;

grant execute on function public.increment_case_view(uuid) to anon, authenticated;
