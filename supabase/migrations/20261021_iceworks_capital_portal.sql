-- Iceworks Capital Portal v1.3
-- Run with Supabase SQL editor using a privileged database owner.
-- All private data stays inaccessible to anon/authenticated PostgREST clients.
create extension if not exists pgcrypto;
create schema if not exists iceworks_private;
revoke all on schema iceworks_private from public, anon, authenticated;
create table if not exists public.iceworks_market_reports (
 id uuid primary key default gen_random_uuid(),
 market_label text not null,
 status text not null default 'draft' check (status in ('draft','approved')),
 overview text not null default '',
 boundaries text not null default '',
 establishment_count integer check (establishment_count >= 0),
 population integer check (population > 0),
 pudi_score numeric(12,4),
 methodology text not null default '',
 source_notes text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.iceworks_capital_invitations (
 id uuid primary key default gen_random_uuid(),
 token_hash text not null unique check (length(token_hash)=64),
 first_name text not null,
 market_label text not null,
 welcome_message text not null default '',
 report_id uuid references public.iceworks_market_reports(id),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.iceworks_capital_submissions (
 id uuid primary key default gen_random_uuid(),
 invitation_id uuid not null unique references public.iceworks_capital_invitations(id) on delete restrict,
 consent_version text not null check (consent_version = 'capital-summary-v1.3'),
 consent_at timestamptz not null default now(),
 summary jsonb not null,
 created_at timestamptz not null default now()
);
create index if not exists iw_invites_expires_at on public.iceworks_capital_invitations(expires_at);
create index if not exists iw_report_status on public.iceworks_market_reports(status);

alter table public.iceworks_market_reports enable row level security;
alter table public.iceworks_capital_invitations enable row level security;
alter table public.iceworks_capital_submissions enable row level security;

revoke all on public.iceworks_market_reports from public, anon, authenticated;
revoke all on public.iceworks_capital_invitations from public, anon, authenticated;
revoke all on public.iceworks_capital_submissions from public, anon, authenticated;
grant select, insert, update on public.iceworks_market_reports to service_role;
grant select, insert, update on public.iceworks_capital_invitations to service_role;
grant select, insert on public.iceworks_capital_submissions to service_role;

-- Issue a new, unguessable 192-bit invitation token and store only its SHA256 hash.
-- Execute only as trusted administrator; never expose this function to public roles.
create or replace function iceworks_private.issue_iceworks_capital_invitation(
 p_first_name text,
 p_market_label text,
 p_welcome_message text default '',
 p_report_id uuid default null,
 p_valid_days integer default 30
)
returns table (invitation_id uuid, raw_token text, expires_at timestamptz)
language plpgsql security invoker
set search_path = public, extensions
as $$
declare
 token text := encode(gen_random_bytes(24),'hex');
 created public.iceworks_capital_invitations%rowtype;
begin
 if p_first_name is null or length(trim(p_first_name)) < 1 or length(p_first_name) > 100
    or p_market_label is null or length(trim(p_market_label)) < 1 or length(p_market_label) > 140
    or length(coalesce(p_welcome_message,'')) > 650
    or p_valid_days not between 1 and 90
 then raise exception 'Invalid invitation parameters'; end if;
 insert into public.iceworks_capital_invitations(token_hash,first_name,market_label,welcome_message,report_id,expires_at)
 values (encode(digest(token,'sha256'),'hex'),trim(p_first_name),trim(p_market_label),coalesce(p_welcome_message,''),p_report_id,now()+make_interval(days=>p_valid_days))
 returning * into created;
 invitation_id:=created.id;raw_token:=token;expires_at:=created.expires_at;
 return next;
end
$$;
revoke all on function iceworks_private.issue_iceworks_capital_invitation(text,text,text,uuid,integer) from public, anon, authenticated;
grant usage on schema iceworks_private to service_role;
grant execute on function iceworks_private.issue_iceworks_capital_invitation(text,text,text,uuid,integer) to service_role;

-- Administration sample (only publish complete, sourced research after review):
-- insert into public.iceworks_market_reports(market_label,status,overview,boundaries,establishment_count,population,pudi_score,methodology,source_notes)
-- values ('Tucson, AZ','draft','Research in progress','Tucson city limits',null,null,null,'','');
--
-- Issue an invitation via a trusted SQL session. The token is returned ONCE:
-- select * from iceworks_private.issue_iceworks_capital_invitation('Jim','Tucson, AZ','Welcome to your Iceworks capital explorer', '<approved-report-uuid>'::uuid, 30);
-- Construct: https://michaeljhicks.github.io/prospect-tool/capital-readiness.html#invite=<raw_token>
-- The #fragment avoids sending the token to GitHub Pages in its URL request.
-- If a link is forwarded it functions as a bearer credential. Do not include sensitive PUDI or finance data in links.
