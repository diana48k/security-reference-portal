-- Assistant data is accessed only by server endpoints. No anonymous table grants.
create table public.assistant_settings (
 id uuid primary key default gen_random_uuid(), config jsonb not null,
 published boolean not null default false, actor_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create unique index assistant_one_published on public.assistant_settings(published) where published;
create table public.assistant_conversations (
 id uuid primary key default gen_random_uuid(), owner_hash text not null, user_id uuid references auth.users(id) on delete cascade,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.assistant_messages (
 id uuid primary key, conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
 owner_hash text not null, question text not null, answer text, sources jsonb not null default '[]',
 status text not null default 'pending' check(status in ('pending','done','fallback','failed')),
 input_tokens integer not null default 0, output_tokens integer not null default 0, model text,
 latency_ms integer, created_at timestamptz not null default now(), completed_at timestamptz
);
create index assistant_messages_owner_time on public.assistant_messages(owner_hash,created_at desc);
create unique index assistant_one_pending on public.assistant_messages(conversation_id) where status='pending';
create table public.assistant_feedback (
 id uuid primary key default gen_random_uuid(), owner_hash text not null,
 category text not null check(category in ('feature_request','content_gap','bug','technical_review','sales_lead','rating')),
 details text not null, contact jsonb, transcript jsonb,
 status text not null default 'new' check(status in ('new','in_progress','resolved','rejected')),
 assignee_id uuid references auth.users(id) on delete set null, resolution_note text,
 created_at timestamptz not null default now(), closed_at timestamptz
);
create index assistant_feedback_closed on public.assistant_feedback(closed_at);
create table public.assistant_rate_buckets (
 key text primary key, count integer not null default 0, expires_at timestamptz not null
);
alter table public.assistant_settings enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.assistant_feedback enable row level security;
alter table public.assistant_rate_buckets enable row level security;
revoke all on public.assistant_settings, public.assistant_conversations, public.assistant_messages, public.assistant_feedback, public.assistant_rate_buckets from anon, authenticated;
grant all on public.assistant_settings, public.assistant_conversations, public.assistant_messages, public.assistant_feedback, public.assistant_rate_buckets to service_role;

-- Atomic distributed limit: survives serverless restarts and simultaneous requests.
create function public.assistant_take_quota(p_key text, p_limit integer, p_seconds integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
 insert into public.assistant_rate_buckets(key,count,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set count=case when public.assistant_rate_buckets.expires_at<now() then 1 else public.assistant_rate_buckets.count+1 end,
 expires_at=case when public.assistant_rate_buckets.expires_at<now() then now()+make_interval(secs=>p_seconds) else public.assistant_rate_buckets.expires_at end
 returning count into n;
 return n;
end $$;
revoke execute on function public.assistant_take_quota(text,integer,integer) from public,anon,authenticated;
grant execute on function public.assistant_take_quota(text,integer,integer) to service_role;

create function public.assistant_publish(p_id uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(734312);
 update public.assistant_settings set published=false where published;
 update public.assistant_settings set published=true where id=p_id;
 if not found then raise exception 'Missing settings version'; end if;
end $$;
revoke execute on function public.assistant_publish(uuid) from public,anon,authenticated;
grant execute on function public.assistant_publish(uuid) to service_role;

-- Use published, explicitly public fields only. FAQ of drafts must not leak.
create extension if not exists pg_trgm with schema extensions;
create function public.assistant_search(p_query text) returns jsonb language sql stable security invoker set search_path='' as $$
 with sources as (
 select 'faq:'||f.id as id, f.question as title, case when f.case_id is null then '/faq#faq-'||f.id else '/cases/'||(select c.slug from public.case_studies c where c.id=f.case_id and c.status='published') end as href,
 left(f.answer,1800) as excerpt,'faq' as kind from public.faqs f
 where f.is_active and (f.case_id is null or exists(select 1 from public.case_studies c where c.id=f.case_id and c.status='published'))
 union all
 select 'case:'||c.id,c.title,'/cases/'||c.slug,
 left(concat_ws(' ',c.subtitle,c.problem_statement,c.requirement_summary,c.solution_statement,c.customer_visible_notes),1800),'case'
 from public.case_studies c where c.status='published'
 union all
 select 'document:'||d.id,coalesce(d.file_name,d.description,'เอกสาร'),'/api/documents/'||d.id||'/download',
 left(concat_ws(' ',d.description,c.title),1000),'document'
 from public.case_documents d join public.case_studies c on c.id=d.case_id where c.status='published'
 ), ranked as (
 select *, (case when title ilike '%'||left(p_query,100)||'%' then 8 else 0 end +
 extensions.word_similarity(lower(left(p_query,300)),lower(title||' '||excerpt))*2 +
 ts_rank(to_tsvector('simple',title||' '||excerpt),plainto_tsquery('simple',left(p_query,300)))*4 +
 (select count(*) from regexp_split_to_table(lower(left(p_query,300)), '\s+') t where length(t)>1 and lower(title||' '||excerpt) like '%'||t||'%')) as score
 from sources
 ) select coalesce(jsonb_agg(to_jsonb(r)-'score'),'[]'::jsonb) from (select * from ranked where score>0.45 order by score desc,id limit 6) r;
$$;
revoke execute on function public.assistant_search(text) from public,anon,authenticated;
grant execute on function public.assistant_search(text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('assistant-avatars','assistant-avatars',false,819200,array['image/png','image/webp']) on conflict(id) do nothing;

create function private.notify_assistant_feedback() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(event_type,title,message,href,entity_type,entity_id,target_roles)
 values('faq_updated','มี Lead / Feedback ใหม่จากนายช่าง','เปิดกล่องงานเพื่อตรวจสอบ','/admin/assistant/inbox','assistant_feedback',new.id,array['admin','tech']);
 return new;
end $$;
revoke all on function private.notify_assistant_feedback() from public,anon,authenticated;
create trigger assistant_feedback_notify after insert on public.assistant_feedback for each row execute function private.notify_assistant_feedback();
