-- New opt-in invitation field shown only to recipients holding a valid invitation link.
-- Existing invitations remain valid; their selection reason is blank until an Iceworks
-- administrator fills it in from the admin portal.
alter table public.iceworks_capital_invitations
  add column if not exists selection_reason text not null default '';

do $$
begin
 if not exists (
  select 1 from pg_constraint
   where conname='iceworks_capital_invitation_reason_length'
   and conrelid='public.iceworks_capital_invitations'::regclass
 ) then
  alter table public.iceworks_capital_invitations
   add constraint iceworks_capital_invitation_reason_length
   check (char_length(selection_reason) <= 1200);
 end if;
end $$;
