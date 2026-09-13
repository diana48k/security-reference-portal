-- In-app notifications with per-user read state.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  title text not null,
  message text,
  href text not null,
  entity_type text,
  entity_id uuid,
  actor_id uuid references auth.users(id) on delete set null,
  target_roles text[],
  created_at timestamptz not null default now(),
  constraint notifications_event_type_check check (
    event_type in ('case_published', 'case_updated', 'document_updated', 'faq_updated')
  ),
  constraint notifications_href_check check (href like '/%')
);

create index if not exists idx_notifications_created
on public.notifications(created_at desc);

create table if not exists public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create index if not exists idx_notification_reads_user
on public.notification_reads(user_id, read_at desc);

alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;

create policy "Authenticated users can read relevant notifications"
on public.notifications
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_active = true
      and notifications.created_at >= profiles.created_at
      and (
        notifications.target_roles is null
        or profiles.role = any(notifications.target_roles)
      )
  )
);

create policy "Users can read own notification state"
on public.notification_reads
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can mark own notifications as read"
on public.notification_reads
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can refresh own notification state"
on public.notification_reads
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.notifications, public.notification_reads from anon;
grant select on table public.notifications to authenticated;
grant select, insert, update on table public.notification_reads to authenticated;
grant all on table public.notifications, public.notification_reads to service_role;

create or replace function private.notify_case_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meaningful_change boolean;
  newly_published boolean;
begin
  if new.status <> 'published' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    meaningful_change := true;
    newly_published := true;
  else
    newly_published := old.status is distinct from 'published';
    meaningful_change := newly_published
      or (to_jsonb(new) - array['view_count', 'updated_at', 'updated_by'])
         is distinct from
         (to_jsonb(old) - array['view_count', 'updated_at', 'updated_by']);
  end if;

  if meaningful_change then
    insert into public.notifications (
      event_type, title, message, href, entity_type, entity_id, actor_id
    ) values (
      case when newly_published
        then 'case_published' else 'case_updated' end,
      case when newly_published
        then 'เผยแพร่เคสใหม่' else 'อัปเดตเคสโครงการ' end,
      new.title,
      '/cases/' || new.slug,
      'case',
      new.id,
      (select auth.uid())
    );
  end if;

  return new;
end;
$$;

create or replace function private.notify_document_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  case_row record;
begin
  select id, slug, title, status
  into case_row
  from public.case_studies
  where id = new.case_id;

  if case_row.status = 'published' then
    insert into public.notifications (
      event_type, title, message, href, entity_type, entity_id, actor_id
    ) values (
      'document_updated',
      case when tg_op = 'INSERT' then 'เพิ่มเอกสารใหม่' else 'อัปเดตเอกสาร' end,
      coalesce(new.file_name, new.description, case_row.title),
      '/cases/' || case_row.slug,
      'document',
      new.id,
      (select auth.uid())
    );
  end if;

  return new;
end;
$$;

create or replace function private.notify_faq_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meaningful_change boolean;
  newly_active boolean;
begin
  if tg_op = 'INSERT' then
    meaningful_change := true;
    newly_active := true;
  else
    newly_active := old.is_active is distinct from true;
    meaningful_change := newly_active
      or (to_jsonb(new) - 'updated_at') is distinct from (to_jsonb(old) - 'updated_at');
  end if;

  if new.is_active and meaningful_change then
    insert into public.notifications (
      event_type, title, message, href, entity_type, entity_id, actor_id
    ) values (
      'faq_updated',
      case when newly_active
        then 'เพิ่มคำถามที่พบบ่อย' else 'อัปเดตคำถามที่พบบ่อย' end,
      new.question,
      '/faq',
      'faq',
      new.id,
      (select auth.uid())
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_case_change() from public, anon, authenticated;
revoke all on function private.notify_document_change() from public, anon, authenticated;
revoke all on function private.notify_faq_change() from public, anon, authenticated;

drop trigger if exists notify_case_change on public.case_studies;
create trigger notify_case_change
after insert or update on public.case_studies
for each row execute function private.notify_case_change();

drop trigger if exists notify_document_change on public.case_documents;
create trigger notify_document_change
after insert or update on public.case_documents
for each row execute function private.notify_document_change();

drop trigger if exists notify_faq_change on public.faqs;
create trigger notify_faq_change
after insert or update on public.faqs
for each row execute function private.notify_faq_change();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
