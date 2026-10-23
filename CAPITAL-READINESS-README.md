# Iceworks Capital Readiness Explorer v1.3

## Purpose
Cost-only, educational planning tool for early-stage prospective franchise owners. It is intentionally **not** a financial performance representation or a promise of financing. Do not add sales, lease-revenue, gross-margin, profit, cash-flow, customer-growth, ROI or payback projections.

## Location
- `capital-readiness.html`: the visitor-facing single-page experience
- `capital-readiness-config.js`: admin-editable cost reference values
- The historical SBA/lender model remains untouched.

## Inputs
**Step 1:** accessible business cash, genuinely committed financing, personal reserves, obligations beyond the investment range.

**Step 2:** additional equipment placements and months of maintenance planning. Placements outside the published investment range must be explicitly acknowledged to be included. This is a cost scenario, not predicted placements.

**Optional Financial Snapshot:** annual gross income, intended investment budget, pending financing and its status, nonretirement assets, retirement/restricted assets, real estate, debts, debt payments, and optional previously stated net worth. Blank fields remain unknown; the completeness checkbox only counts when all asset and liability fields are explicitly entered.

## Calculation conventions
- Deployable funds = max(0, accessible cash - personal reserves) + committed funding.
- Extra cost per placement = equipment purchase + subcontracted installation, with a prorated maintenance-planning allowance over the entered months.
- Selected total cost range = published investment range + other obligations + acknowledged additional equipment/maintenance.
- Capital gap = max(0, selected cost - deployable funds), separately for low/high ends.
- Pending financing, annual income, net worth, and retirement assets **never** increase the deployable capital calculation automatically.
- Debt payments / gross monthly income is **context only**, not a lender DTI determination.

## Privacy
The public calculator and single-machine cost chart calculate values in the visitor's browser; detailed Financial Snapshot entries and chart-specific cost controls are not part of the optional summary submission. For valid personalized invitation links, the active Supabase portal resolves the invitation on page load and can accept a limited Capital Readiness Summary only after explicit consent. The site includes no Iceworks visitor-analytics script; hosting and invitation-service providers may process standard technical connection logs. The site loads multiple local JavaScript config files. See capital-privacy.html for current disclosure and retention details.

## Maintenance
Update the approved cost assumptions in `capital-readiness-config.js` through GitHub, commit to main, and let GitHub Pages deploy. Update the source citation/date and reconcile the values to the current effective FDD and relevant manufacturer/service cost support before sharing with prospects. The separate admin UI is in capital-admin.html, and current backend access/retention controls should be verified against the deployed Supabase project.

## Test scenarios
- $5,000 accessible cash, $0 committed funding, $0 reserve, no added costs ⇒ $51,800–$73,600 capital gap using the configured $56,800–$78,600 startup range.
- Two extra placements, 12 months, and $1,000 obligations ⇒ +$14,700 additional total cost when outside-range is confirmed; otherwise only the $1,000 obligation is counted.
- $5,000 cash, $10,000 committed funding, $7,000 desired personal reserves ⇒ $10,000 deployable; borrowed funds are not used to satisfy reserve targets.
- A $330,000 mortgage with no real estate value and mismatched reported vs calculated net worth must raise reconciliation questions.

This tool is informational, not an eligibility decision or the actual signed suitability form.

## V1.2 UI and accessibility
- Five clearly labeled full-width sections replace the former side-by-side Step 1 / Step 2 layout. Financial Snapshot remains collapsible/optional.
- Every financial entry label, financing-status selection, and confirmation checkbox has a short **?** explanation with everyday-language definitions and practical examples (22 explanations total).
- Mouse users can hover over the ?; mouse/touch users can click to keep it open; keyboard users can focus and activate the ? button, then close it with Escape. Every button is associated with its explanation using accessible properties.
- Narrow screens show the inputs in one column; the help panels fit the screen and use internal scrolling if necessary.
- No changes were made to business financial calculations, cost assumptions, storage behavior, or the default homepage.

## V1.3 personalized discovery
The tool now has a responsive sticky financial summary, personalized invitation modal, and a PUDI research teaser. Preview with `?demo=1&first=Jim&market=Tucson`. As of October 22, 2026, secure invitation resolution and consent-based limited summary submission are ON in capital-portal-config.js and the corresponding Supabase service is active. PUDI reports are not automatically unlocked. See `CAPITAL-PORTAL-SETUP.md` and the Supabase schema / Edge Function sources. The optional Financial Snapshot stays in the browser; the limited summary requires explicit consent.

## V1.4 Chart.js progressive single-machine costs (October 22, 2026)
- Retired the optional Flourish embed, its loader, and its configuration field. The page no longer embeds a third-party Flourish visualization.
- Replaced the one-machine SVG graph with Chart.js 4.5.1 (pinned UMD script, MIT-licensed) and a custom cost-only progressive reveal driven by easeOutCubic. Files: `capital-chart.js`, `capital-readiness.html` and its mirrored `index.html`.
- The chart remains a direct-COST illustration. It shows the Month 0 equipment/installation outlay and exact scheduled PM expense steps. There are no lease-collection assumptions, income, profits, payback calculations or prospective owner return claims.
- Chart.js is loaded from `cdn.jsdelivr.net`. The script request provides the CDN with technical connection information, but the chart does not send financial inputs to the CDN. Privacy language in `capital-privacy.html` now discloses this. The library script is version-pinned with Subresource Integrity and `crossorigin=anonymous`.
- Controls: equipment/installation cost, cost per PM visit, visits per year, month slider; chart tooltip/summary, replay animation, mobile chart canvas, reduced-motion support, validation and readable fallback if Chart.js is unavailable. No changes to the separate Capital Explorer math, share/consent submissions or PUDI portal.
- Cost reference inputs remain in `numbers-reference-config.js`. The differing assumptions in `capital-readiness-config.js` remain separate pending reconciliation; the current $245 lease-price card is NOT treated as collected revenue.
- JavaScript feature implementation and smoke tests are described in `CAPITAL-CHART-IMPLEMENTATION-TESTS.md`. Future red-to-teal investment recovery visualizations need separate FDD Item 19 review and a substantiated methodology; Privacy notices cannot substitute.

