# Iceworks Capital Readiness Explorer v1.2

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
The site performs computations only in the browser. It does not submit, save, or collect personal financial input, and has no analytics script. Visitor entries disappear when the page is closed/refreshed. Printing and PDF saving are controlled by the visitor's browser. The only external file loaded by the app is the public cost configuration.

## Maintenance
Update the approved cost assumptions in `capital-readiness-config.js` through GitHub, commit to main, and let GitHub Pages deploy. Update the source citation/date and reconcile the values to the current effective FDD and relevant manufacturer/service cost support before sharing with prospects. As of v1.1 no password-protected admin UI exists.

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
