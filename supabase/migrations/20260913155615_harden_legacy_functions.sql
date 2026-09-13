-- Harden legacy helper functions flagged by Supabase Security Advisor.

alter function public.set_updated_at()
set search_path = '';

alter function public.increment_case_view(uuid)
set search_path = '';

revoke all on function public.increment_case_view(uuid)
from public, anon, authenticated;

grant execute on function public.increment_case_view(uuid)
to service_role;
