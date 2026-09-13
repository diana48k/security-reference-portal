-- Full user management, profile lifecycle, and audit trail.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

alter table public.profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists must_change_password boolean not null default false;

create or replace function private.is_admin_or_tech()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_active = true
      and role in ('admin', 'tech')
  );
$$;

revoke all on function private.is_admin_or_tech() from public, anon;
grant execute on function private.is_admin_or_tech() to authenticated, service_role;

create or replace function public.is_admin_or_tech()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin_or_tech();
$$;

revoke all on function public.is_admin_or_tech() from public, anon;
grant execute on function public.is_admin_or_tech() to authenticated, service_role;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := new.raw_app_meta_data ->> 'role';

  insert into public.profiles (id, full_name, role, is_active, must_change_password)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when requested_role in ('viewer', 'sales', 'tech', 'admin') then requested_role
      else 'viewer'
    end,
    true,
    coalesce((new.raw_app_meta_data ->> 'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

insert into public.profiles (id, full_name, role)
select
  users.id,
  nullif(users.raw_user_meta_data ->> 'full_name', ''),
  case
    when users.raw_app_meta_data ->> 'role' in ('viewer', 'sales', 'tech', 'admin')
      then users.raw_app_meta_data ->> 'role'
    else 'viewer'
  end
from auth.users as users
on conflict (id) do nothing;

create table if not exists public.user_admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  target_user_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now(),
  constraint user_admin_audit_logs_action_check check (
    action in (
      'create',
      'update',
      'role_change',
      'password_reset',
      'suspend',
      'restore',
      'delete'
    )
  )
);

create index if not exists idx_user_admin_audit_logs_created
on public.user_admin_audit_logs(created_at desc);

create index if not exists idx_user_admin_audit_logs_target
on public.user_admin_audit_logs(target_user_id, created_at desc);

alter table public.user_admin_audit_logs enable row level security;

drop policy if exists "Admin and tech can read user audit logs"
on public.user_admin_audit_logs;

create policy "Admin and tech can read user audit logs"
on public.user_admin_audit_logs
for select
to authenticated
using (public.is_admin_or_tech());

revoke all on table public.user_admin_audit_logs from anon;
grant select on table public.user_admin_audit_logs to authenticated;
grant all on table public.user_admin_audit_logs to service_role;
