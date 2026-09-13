begin;
select plan(9);

select ok(not has_table_privilege('anon', 'public.analytics_events', 'select'), 'anon cannot read raw analytics');
select ok(not has_table_privilege('authenticated', 'public.analytics_events', 'select'), 'authenticated cannot read raw analytics');
select ok(not has_table_privilege('anon', 'public.notifications', 'select'), 'anon cannot read notifications');
select ok(has_table_privilege('authenticated', 'public.notifications', 'select'), 'authenticated can read notifications through RLS');
select ok(has_table_privilege('authenticated', 'public.notification_reads', 'insert'), 'authenticated can create own read state through RLS');
select ok(not has_function_privilege('anon', 'private.is_admin_or_tech()', 'execute'), 'anon cannot execute private role guard');
select ok(has_function_privilege('authenticated', 'private.is_admin_or_tech()', 'execute'), 'authenticated role guard is available to policies');
select ok(has_table_privilege('service_role', 'public.user_admin_audit_logs', 'insert'), 'service role can write audit logs');
select ok(has_table_privilege('service_role', 'public.analytics_events', 'insert'), 'service role can ingest analytics');

select * from finish();
rollback;
