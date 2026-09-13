-- Privacy-conscious first-party analytics and long-term daily rollups.

create schema if not exists extensions;
create extension if not exists pg_cron with schema extensions;

create table if not exists public.analytics_visitors (
  visitor_hash text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_hash text not null references public.analytics_visitors(visitor_hash) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  page_view_count integer not null default 0,
  download_count integer not null default 0
);

create index if not exists idx_analytics_sessions_started
on public.analytics_sessions(started_at desc);

create index if not exists idx_analytics_sessions_user
on public.analytics_sessions(user_id, started_at desc)
where user_id is not null;

create table if not exists public.analytics_events (
  id uuid primary key,
  session_id uuid not null references public.analytics_sessions(id) on delete cascade,
  visitor_hash text not null references public.analytics_visitors(visitor_hash) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  path text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint analytics_events_name_check check (
    event_name in (
      'page_view',
      'document_download',
      'presentation_export',
      'search',
      'favorite_toggle',
      'feedback_submit'
    )
  ),
  constraint analytics_events_path_check check (path like '/%'),
  constraint analytics_events_metadata_size_check check (octet_length(metadata::text) <= 2048)
);

create index if not exists idx_analytics_events_occurred
on public.analytics_events(occurred_at desc);

create index if not exists idx_analytics_events_name_occurred
on public.analytics_events(event_name, occurred_at desc);

create index if not exists idx_analytics_events_user_occurred
on public.analytics_events(user_id, occurred_at desc)
where user_id is not null;

create table if not exists public.analytics_daily_rollups (
  day date primary key,
  visitors integer not null default 0,
  new_visitors integer not null default 0,
  sessions integer not null default 0,
  page_views integer not null default 0,
  downloads integer not null default 0,
  presentation_exports integer not null default 0,
  active_users integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.analytics_visitors enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_daily_rollups enable row level security;

revoke all on table
  public.analytics_visitors,
  public.analytics_sessions,
  public.analytics_events,
  public.analytics_daily_rollups
from anon, authenticated;

grant all on table
  public.analytics_visitors,
  public.analytics_sessions,
  public.analytics_events,
  public.analytics_daily_rollups
to service_role;

create or replace function private.rollup_analytics()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  rollup_day date;
begin
  for rollup_day in
    select generate_series(
      ((now() at time zone 'Asia/Bangkok')::date - 3),
      ((now() at time zone 'Asia/Bangkok')::date - 1),
      interval '1 day'
    )::date
  loop
    insert into public.analytics_daily_rollups (
      day,
      visitors,
      new_visitors,
      sessions,
      page_views,
      downloads,
      presentation_exports,
      active_users,
      updated_at
    )
    select
      rollup_day,
      count(distinct events.visitor_hash)::integer,
      count(distinct events.visitor_hash) filter (
        where (visitors.first_seen_at at time zone 'Asia/Bangkok')::date = rollup_day
      )::integer,
      count(distinct events.session_id)::integer,
      count(*) filter (where events.event_name = 'page_view')::integer,
      count(*) filter (where events.event_name = 'document_download')::integer,
      count(*) filter (where events.event_name = 'presentation_export')::integer,
      count(distinct events.user_id) filter (where events.user_id is not null)::integer,
      now()
    from public.analytics_events as events
    join public.analytics_visitors as visitors
      on visitors.visitor_hash = events.visitor_hash
    where events.occurred_at >= (rollup_day::timestamp at time zone 'Asia/Bangkok')
      and events.occurred_at < ((rollup_day + 1)::timestamp at time zone 'Asia/Bangkok')
    on conflict (day) do update set
      visitors = excluded.visitors,
      new_visitors = excluded.new_visitors,
      sessions = excluded.sessions,
      page_views = excluded.page_views,
      downloads = excluded.downloads,
      presentation_exports = excluded.presentation_exports,
      active_users = excluded.active_users,
      updated_at = excluded.updated_at;
  end loop;

  delete from public.analytics_events
  where occurred_at < now() - interval '90 days';

  delete from public.analytics_sessions
  where last_seen_at < now() - interval '90 days';
end;
$$;

revoke all on function private.rollup_analytics() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'security-portal-analytics-rollup'
  ) then
    perform cron.schedule(
      'security-portal-analytics-rollup',
      '15 17 * * *',
      'select private.rollup_analytics();'
    );
  end if;
end;
$$;
