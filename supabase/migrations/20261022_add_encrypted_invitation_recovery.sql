-- Securely recover links for invitations created after this deployment.
-- Legacy invitation hashes remain one-way; staff must rotate those URLs once.
alter table public.iceworks_capital_invitations add column if not exists token_ciphertext text;
comment on column public.iceworks_capital_invitations.token_ciphertext is 'AES-GCM sealed invitation token; only the authorized staff Edge Function decrypts it.';
