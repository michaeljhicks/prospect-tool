-- Mirrors the Iceworks admin and retention migrations applied October 21, 2026.
-- The first owner email is seeded securely in Supabase, not embedded here.
create table if not exists public.iceworks_portal_admins(
 email text primary key check (email=lower(email) and length(email) between 5 and 254),
 role text not null check(role in ('owner','editor','viewer')),
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 created_by text
);
create table if not exists public.iceworks_portal_audit(
 id bigint generated always as identity primary key,
 actor_email text not null,
 action text not null check(length(action)<100),
 invitation_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.iceworks_portal_admins enable row level security;
alter table public.iceworks_portal_audit enable row level security;
revoke all on public.iceworks_portal_admins from public, anon, authenticated;
revoke all on public.iceworks_portal_audit from public, anon, authenticated;
grant select,insert,update,delete on public.iceworks_portal_admins to service_role;
grant select,insert on public.iceworks_portal_audit to service_role;
create index if not exists iw_submissions_created_at on public.iceworks_capital_submissions(created_at);
create index if not exists iw_invites_expiration_cleanup on public.iceworks_capital_invitations(expires_at);
create extension if not exists pg_cron with schema pg_catalog;
-- Set via secure operations in a new project: unschedule existing job before scheduling the replacement.
-- Daily retention task retains financial submissions/consent for 90 days, logs for 365 days.
select cron.schedule('iceworks-capital-private-retention-daily','22 4 * * *',
$job$
delete from public.iceworks_capital_submissions where created_at < now()-interval '90 days';
delete from public.iceworks_capital_invitations where expires_at < now()-interval '30 days' and not exists(select 1 from public.iceworks_capital_submissions s where s.invitation_id=iceworks_capital_invitations.id);
delete from public.iceworks_portal_audit where created_at < now()-interval '365 days';
$job$);
