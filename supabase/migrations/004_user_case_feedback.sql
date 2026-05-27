-- =========================================================
-- User case feedback: usefulness votes per signed-in user
-- =========================================================

create table if not exists public.user_case_feedback (
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.case_studies(id) on delete cascade,
  is_useful boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, case_id)
);

create trigger set_user_case_feedback_updated_at
before update on public.user_case_feedback
for each row
execute function public.set_updated_at();

create index if not exists idx_user_case_feedback_case
on public.user_case_feedback(case_id);

alter table public.user_case_feedback enable row level security;

drop policy if exists "Users can manage own case feedback"
on public.user_case_feedback;

create policy "Users can manage own case feedback"
on public.user_case_feedback
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Admin and tech can read all case feedback"
on public.user_case_feedback;

create policy "Admin and tech can read all case feedback"
on public.user_case_feedback
for select
to authenticated
using (public.is_admin_or_tech());
