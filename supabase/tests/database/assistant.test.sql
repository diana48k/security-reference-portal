-- Run after assistant_public migration. All fixtures roll back.
begin;
do $$
declare c uuid; m uuid:=gen_random_uuid(); n integer;
begin
 if has_table_privilege('anon','public.assistant_messages','select') then raise exception 'Anonymous chat read grant'; end if;
 if has_table_privilege('authenticated','public.assistant_feedback','select') then raise exception 'Direct inbox read grant'; end if;
 if has_function_privilege('anon','public.assistant_search(text)','execute') then raise exception 'Anonymous search RPC grant'; end if;
 if has_function_privilege('authenticated','public.assistant_publish(uuid)','execute') then raise exception 'Client publish RPC grant'; end if;
 if exists(select 1 from pg_class where oid in ('public.assistant_settings'::regclass,'public.assistant_messages'::regclass,'public.assistant_feedback'::regclass,'public.assistant_conversations'::regclass) and not relrowsecurity) then raise exception 'RLS missing'; end if;
 n:=public.assistant_take_quota('test:assistant-quota',2,60);
 if n<>1 then raise exception 'Quota starts at 1'; end if;
 n:=public.assistant_take_quota('test:assistant-quota',2,60);
 if n<>2 then raise exception 'Quota must increment atomically'; end if;
 insert into public.assistant_conversations(owner_hash,expires_at) values('test-owner',now()+interval '1 day') returning id into c;
 insert into public.assistant_messages(id,conversation_id,owner_hash,question) values(m,c,'test-owner','test');
 begin
 insert into public.assistant_messages(id,conversation_id,owner_hash,question) values(gen_random_uuid(),c,'test-owner','parallel');
 raise exception 'Parallel pending turn allowed';
 exception when unique_violation then null; end;
 update public.assistant_messages set status='done',answer='done' where id=m;
 begin
 insert into public.assistant_messages(id,conversation_id,owner_hash,question) values(m,c,'test-owner','duplicate');
 raise exception 'Duplicate message allowed';
 exception when unique_violation then null; end;
 if jsonb_array_length(public.assistant_search('ประตู'))>6 then raise exception 'Search must be bounded'; end if;
end $$;
rollback;
