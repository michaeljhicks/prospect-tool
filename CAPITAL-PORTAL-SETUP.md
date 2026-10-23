# Iceworks Capital Readiness Portal v1.3 — Deployment & security

## Current release status
The GitHub Pages frontend supports a personalized welcome modal, mobile-aware sticky capital cards, and a visibly separate PUDI preview. **As of October 22, 2026, the public portal config enables secure invitation lookup and optional consent-based limited summary submission.** The Supabase `iceworks-capital-portal` Edge Function is active. PUDI report unlocking is not provided to prospects. No service-role credentials belong in this repository. Visitors can use the calculator privately without an invitation.

The private Supabase database and Edge Function have been deployed to the `iceworks-capital-portal` project. The public `capital-portal-config.js` currently has `enabled:true`. Keep the setup checklist below as a reference for future environments or redeployments; do not infer that each numbered item remains pending. Check operational access, consent, retention, and monitoring periodically.

## Quick UI demonstration
Visit `https://michaeljhicks.github.io/prospect-tool/capital-readiness.html?demo=1&first=Jim&market=Tucson%2C%20AZ` to preview the welcome and Tucson market teaser without a database. It is **demo-only**, not a validated market report and cannot submit data.

## Backend deployment checklist (owner/admin only; reference for redeployments)
1. Choose a Supabase project authorized to store voluntary franchise-discovery financial summaries. Confirm the data retention, incident-response and access-management policies with IFG.
2. Review and run `supabase/migrations/20261021_iceworks_capital_portal.sql` as a privileged project administrator. The schema enables row-level security and revokes anon/authenticated table access.
3. Deploy the Edge Function from `supabase/functions/iceworks-capital-portal/index.ts` under name `iceworks-capital-portal`; turn OFF JWT verification for this invitation endpoint, because authorization uses a high-entropy invitation token. Restrict CORS to `https://michaeljhicks.github.io`. Confirm that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are only server-side secrets.
4. Run a full staging test: anonymous direct table access must be denied; an invalid/expired/revoked token must be denied; PUDI score/methodology must never appear in the prospect response, including after consent; a deliberately malformed summary must be rejected; detailed assets, liabilities and income must never be saved; a valid summary must be stored once; submitting or resolving an invitation must never disclose detailed PUDI reports.
5. Make a sourced, reviewed PUDI report in `iceworks_market_reports` and mark `status='approved'` **only after independent factual review**. Draft reports are never publicly unlockable.
6. Issue a 48-hex token via `select * from public.issue_iceworks_capital_invitation(...)` in an administrator-controlled session. Use the raw token only in the invitation link fragment: `https://michaeljhicks.github.io/prospect-tool/capital-readiness.html#invite=<raw_token>`. Only its SHA256 hash is stored by the database; don't commit raw tokens to GitHub or copy them into code.
7. Update only the PUBLIC settings in `capital-portal-config.js`: `enabled:true`, `endpoint:"https://<project-ref>.supabase.co/functions/v1/iceworks-capital-portal"`. Deploy GitHub Pages. **Never expose the service role key in a client file**.
8. Perform a complete test from the actual GitHub Pages origin and on mobile, including after refreshing the invitation link.
9. Before using the portal with outside prospects, have counsel review the consent language, retention period, security controls, PUDI disclosures and whether your market report might indirectly imply financial performance.

## Data minimization
The server only accepts:
- `deployable_funds`
- `selected_cost_low`, `selected_cost_high`
- `capital_gap_low`, `capital_gap_high`
- `financing_status` (none, exploring, applied, preapproved, committed)
- `flags` (only three generic readiness flags)
- Consent version, invitation ID and timestamp

The complete Financial Snapshot (gross salary, retirement, real estate values, mortgages, debts, net worth and any individual detailed account amounts) stays **entirely in the local browser**.

## Invitation privacy and limitations
Invitations are short-lived bearer tokens, not verified identity. Anyone who obtains a working invitation URL may submit the summary but not access PUDI reports. Don't use them to deliver personally sensitive data. For greater assurance, implement an email verification step before production prospect submissions. Tokens can be revoked using `revoked_at=now()`.

An authenticated staff admin interface and database retention configuration have been added since this original setup guide. As verified on October 22, 2026, an active daily `pg_cron` job named `iceworks-capital-private-retention-daily` references 90-day summary, 30-day expired-invitation, and 365-day audit-record rules. Scheduling does not by itself prove every cleanup execution succeeded; review job history and backups periodically. Review current rate limiting, identity assurance, deletion-request handling, and admin access before expanding external usage.

## PUDI
The frontend shows only a general market-research overview and whether an invitation has an approved report. It never contains private report records, the calculated PUDI score or the underlying methodology. After explicit consent, the Edge Function stores only the limited summary for staff review; it never sends the PUDI report. Market scores describe potential establishment density, not actual customers, installations, revenues, or earnings.

## Hosting & versions
The current `index.html` and `capital-readiness.html` provide the Capital Readiness page; the older lender model remains a separate historical file. The public page currently loads three local config files, including the enabled portal connection. Sticky cards shrink as the reader scrolls. The demo link is for layout/personalization review only and is not an authorized financial-performance illustration.
