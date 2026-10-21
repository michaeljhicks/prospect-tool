# Iceworks Capital Readiness Portal v1.3 — Deployment & security

## Current release status
The GitHub Pages frontend supports a personalized welcome modal, mobile-aware sticky capital cards, and a visibly separate PUDI preview. **Financial submission and PUDI unlocking are disabled by default.** There are no credentials in this repository. Visitors can explore the calculator privately without an invitation.

The private database schema and Edge Function are **source files only** until a Supabase project has been selected and provisioned. Never publish a supposed secure upload feature by turning `enabled` on before completing the backend setup, permissions, and testing.

## Quick UI demonstration
Visit `https://michaeljhicks.github.io/prospect-tool/capital-readiness.html?demo=1&first=Jim&market=Tucson%2C%20AZ` to preview the welcome and Tucson market teaser without a database. It is **demo-only**, not a validated market report and cannot submit data.

## Backend deployment checklist (owner/admin only)
1. Choose a Supabase project authorized to store voluntary franchise-discovery financial summaries. Confirm the data retention, incident-response and access-management policies with IFG.
2. Review and run `supabase/migrations/20261021_iceworks_capital_portal.sql` as a privileged project administrator. The schema enables row-level security and revokes anon/authenticated table access.
3. Deploy the Edge Function from `supabase/functions/iceworks-capital-portal/index.ts` under name `iceworks-capital-portal`; turn OFF JWT verification for this invitation endpoint, because authorization uses a high-entropy invitation token. Restrict CORS to `https://michaeljhicks.github.io`. Confirm that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are only server-side secrets.
4. Run a full staging test: anonymous direct table access must be denied; an invalid/expired/revoked token must be denied; PUDI score/methodology must not appear before consent; a deliberately malformed summary must be rejected; detailed assets, liabilities and income must never be saved; a valid summary must be stored once; report retrieval must only work for a matching invitation after submission.
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
Invitations are short-lived bearer tokens, not verified identity. Anyone who obtains a working invitation URL may submit the summary and see that invitation's report. Don't use them to deliver personally sensitive data. For greater assurance, implement an email verification step before production prospect submissions. Tokens can be revoked using `revoked_at=now()`.

Current UI does not implement rate limiting, admin authentication, a consent withdrawal process, or an automated deletion schedule. These are deployment tasks, not reasons to use anonymous, unrestricted database tables. Establish them before broad external rollout.

## PUDI
The frontend shows only a general market-research overview and whether an invitation has an approved report. It never contains private report records, the calculated PUDI score or the underlying methodology. After explicit consent and successful submission, the Edge Function returns the approved market report on the **matching token**. Market scores describe potential establishment density, not actual customers, installations, revenues, or earnings.

## Hosting & versions
The existing `index.html` lender model and cost defaults remain unchanged. The new features are added to the same `capital-readiness.html` path. Sticky cards shrink as the reader scrolls. The demo link lets Iceworks review the personalized invitation workflow before creating any live financial-submission service.
