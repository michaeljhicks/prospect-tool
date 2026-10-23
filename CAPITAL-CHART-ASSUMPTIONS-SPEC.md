# Iceworks Signature Chart — Inputs, Calculations & Assumptions

Version: 1.0 · October 22, 2026 · Step 2 of 5
Status: SPECIFICATION ONLY — NO LIVE PAGE CHANGES

Related: [Step 1 visual specification](CAPITAL-CHART-VISUAL-SPEC.md)

## Executive decisions

Two distinct models must remain separate:

1. **COSTS_ONLY** is the existing public single-machine cost illustration, eligible for the planned Chart.js presentation upgrade. It shows direct equipment and scheduled maintenance costs, not returns.
2. **RECOVERY_RESEARCH** is an internal design/schema for a potential future, substantiated cash-recovery scenario. It is NOT authorized for prospect-facing publication, query-parameter access, or a public demo toggle until counsel approves the FDD Item 19 basis and actual representation.

The current $245 average monthly lease charge is a price reference, NOT a calculated monthly cash receipt or net contribution. Do not invent an automatic franchise earnings/ROI/payback scenario using it.

## 1. Source inventory and provenance (repository as of October 22, 2026)

### Single-machine operating references — numbers-reference-config.js

| Field | Current value | Scope |
|---|---:|---|
| asOf | October 2026 | Reference date, not verification of representativeness |
| monthlyLeaseRate | $245 | Average monthly billed-price reference; not earned/collected revenue projection |
| equipmentAndInstallation | $6,154.79 | One representative machine purchase and install outlay |
| preventativeMaintenanceVisit | $250 | Illustrative per scheduled PM visit |
| preventativeMaintenanceVisitsPerYear | 2 | Number of planned visits annually |
| illustrativeMonths | 108 | Nine-year illustration, not promised machine life or lease term |
| flourishEmbedUrl | empty | Optional retired embed, remove in Step 5 |

Existing page elements:
- unitCostInput: editable equipment/install amount, min $0, max $250,000.
- unitPMInput: editable per-visit PM amount, min $0, max $10,000.
- unitPMFreq: 1–4 visits/year.
- unitMonth: selected integer month, 0–108.
- unitMonthLabel, unitCostEquipmentTotal, unitCostPMTotal, unitCostTotal: synchronized readout IDs.
- initSingleMachineNumbers() in capital-readiness.html is the existing calculation/rendering implementation.

### Startup / capital-readiness references — capital-readiness-config.js

| Field | Current value | Scope |
|---|---:|---|
| sourceLabel | October 2026 Iceworks Trifold, citing Jan 5, 2026 FDD | Existing code label, FDD not independently inspected for this spec |
| updated | 2026-10-21 | Configuration update date |
| investmentLow / investmentHigh | $56,800 / $78,600 | Overall franchise startup investment planning range |
| franchiseFeeIncluded | $29,900 | Already INCLUDED in that range; never add again |
| equipmentCost / installationCost | $6,000 / $450 | Incremental-equipment budget assumption |
| maintenancePerVisit / maintenanceVisitsPerYear | $200 / 2 | Incremental-equipment cost allowance |
| softwareMonthly | $164 | Wider business reference; not allocated to one unit here |
| conventionAnnual | $1,200 | Wider business reference; not allocated to one unit here |
| royaltyPercent | 9% | Franchise gross-sales royalty reference, only after agreement verification for modeling |

**Discrepancies to reconcile through source documents; do not silently overwrite:**
- Per-placement equipment/install assumptions: $6,450 in Capital Readiness versus $6,154.79 in the single-machine section — a $295.21 difference.
- Maintenance default: $200 versus $250 per PM visit — a $50 difference.
- Capital Explorer uses a PRORATED cost allowance, while the single-machine chart counts actual scheduled visit intervals.
- The 108-month chart is not a typical customer contract length or claimed useful life.
- The old Iceworks_Franchisee_Financial_Model_v4.2.html is a separate model and must not feed any visitor-facing chart automatically.

Source precedence for future reconciliation: (1) current effective FDD and supporting documentation, (2) reconciled supplier invoices / paid service history / franchise agreements, (3) explicitly identified user-selected scenarios, (4) research placeholders — never present placeholders as Iceworks performance claims.

## 2. COSTS_ONLY single-machine calculation contract

Inputs: machine purchase/install amount E, PM visit cost P, annual scheduled visit count V, selected month m, chart horizon H (initially H = 108).

Use a pure calculation function in Step 5 shared by Chart.js series, numeric summary, tooltips and print values.

Validation:
- E is finite and between $0 and $250,000 inclusive, cents precision.
- P is finite and between $0 and $10,000 inclusive, cents precision.
- V is one of 1, 2, 3, 4.
- m is an integer from 0 through H. Fixed H = 108 initially.
- Empty, negative, non-finite and out-of-range values should display validation feedback instead of silently reverting to an apparently accepted result. Do not generate misleading totals for invalid input.
- Calculate in integer cents (or other precise decimal representation), format display values consistently to two decimals.

**Exact existing scheduled PM convention:**

    completedPMVisits(m) = floor((m * V) / 12 + 1e-8)
    cumulativePM(m) = completedPMVisits(m) * P
    equipmentCostToDate(m) = E
    cumulativeDirectCost(m) = E + cumulativePM(m)

For V=2, PM charges first occur at Months 6, 12, 18, etc. No maintenance expense at Month 0. The line should be STEPPED at actual service months; do not use curved smoothing that depicts the spending as smoothly monthly when it is event-based.

New **negative-outlay y-axis** (visual encoding only):

    plottedCumulativeOutlay(m) = -cumulativeDirectCost(m)

At Month 0, draw an explicit start-at-zero then vertical drop at Month 0 to negative E. Because startup costs are being shown as negative, summary values may still display positive magnitudes, with a clear sign explanation (e.g., "$6,154.79 spent" rather than "negative profit"). The cost-only curve remains below or at zero and steps further negative as maintenance occurs. It **cannot** rise into positive territory, imply a return, or have a break-even marker without modeling receipts.

Test examples using current single-machine defaults E=$6,154.79, P=$250, V=2:

| Month | Completed PM visits | PM total | Total direct costs | Plotted signed value |
|---|---:|---:|---:|---:|
| 0 | 0 | $0 | $6,154.79 | -$6,154.79 |
| 5 | 0 | $0 | $6,154.79 | -$6,154.79 |
| 6 | 1 | $250 | $6,404.79 | -$6,404.79 |
| 12 | 2 | $500 | $6,654.79 | -$6,654.79 |
| 36 | 6 | $1,500 | $7,654.79 | -$7,654.79 |
| 108 | 18 | $4,500 | $10,654.79 | -$10,654.79 |

Suggested chart labels: "Illustrative cumulative direct costs — one machine"; "Initial equipment + installation"; "Scheduled preventative maintenance"; "Month m / 108"; and "Amounts below zero reflect cash outlays, not operating losses."

Exclusions (visible to reader): unscheduled service/parts, customer cancellations, software, staff, advertising, taxes, royalties, financing, insurance, equipment replacement, other business expenses and ALL receipts. Do not net the separate $245 billed-rate reference against costs.

## 3. Preserve the Capital Explorer formulas and eligibility distinctions

Current broad franchise startup / capital gap calculation (separate from graph):

    deployableFunds = max(0, accessibleCash - desiredPersonalReserves) + committedFunding
    additionalEquipment = acknowledgedOutsideInvestmentRange
      ? additionalUnits * (6000 + 450) : 0
    additionalMaintenance = acknowledgedOutsideInvestmentRange
      ? additionalUnits * 200 * 2 * (maintenancePlanningMonths / 12) : 0
    extraCost = additionalEquipment + additionalMaintenance
    selectedCostLow = 56800 + otherObligations + extraCost
    selectedCostHigh = 78600 + otherObligations + extraCost
    capitalGapLow = max(0, selectedCostLow - deployableFunds)
    capitalGapHigh = max(0, selectedCostHigh - deployableFunds)

Never count additional placements if they are already in the selected FDD startup range. The $29,900 fee is within the configured $56,800–$78,600 range, not on top of it. Pending financing is not automatically committed funding. Available cash is not sales revenue or income. The Capital Explorer's PM allowance is fractional/prorated by months, unlike the discrete single-machine timeline; do not treat them as identical without a policy change.

## 4. RECOVERY_RESEARCH — scope and data requirements, NOT public defaults

Before any recovery or profit figure can be calculated responsibly, **first choose what is being measured**:

- A. Single machine cost recovery / unit economics; OR
- B. Franchise-wide owner equity invested and distributable cash recovered; OR
- C. Franchise-wide cash-flow timeline with actual uses and sources of cash.

These are not equivalent. Never overlay a machine's $6,154.79 capital cost on a franchise startup investment of $56,800–$78,600 and count it twice. Positive cash balances caused by borrowing are NOT investment returns or operating profitability.

Required scenario fields and sourcing:

| Category | Research inputs / evidence | Minimum guardrail |
|---|---|---|
| Units and scope | One unit vs franchise, machine type, funding basis, fiscal period | Display metric definition next to chart |
| Initial spending | Franchise fee, purchases, installs, freight, accessories, working capital and payment dates | Distinguish FDD range from real cash spent; prevent double counts |
| Lease pricing | Contract rates, discounts and effective date, supported sample mix | $245 existing billed-rate reference is NOT a guarantee of collections |
| Placements and tenure | Month-by-month units placed, lease start/end, downtime, churn/cancellation and replacement | No unsupported default pace or permanent retention |
| Receipts | Bills, actual collection rate, bad debt and delay, optional service receipts with provenance | Billed charges are not cash receipts |
| Direct operating costs | PM timing, parts, emergency repair, subcontractors, warranty exclusions, equipment replacement | Do not omit real recurring costs to manufacture a crossover |
| Shared expenses | Labor, insurance, software, marketing, fuel, office/admin, convention, merchant fees, overhead | Attribute/allocate fixed costs clearly |
| Franchise payments | Actual royalty contract basis/timing and other fees | 9% gross-sales reference must be checked against executed agreement |
| Financing | Owner equity, lender draws, interest, principal, origination fees, reserves | Loan proceeds tracked separately from profit; debt service counted |
| Other accounting | Taxes, owner compensation, capital contributions, distributions | Specify after-tax/before-tax and what counts as "recovery" |
| Credibility | Evidence period, market, number of actual outlets, sample selection, caveats | Don't label unsupported example "typical" or "expected" |

For each internal research input record, capture: field name, value, units, data source, source link or document, observation period, market, relevant machine/customer population, assumptions used, reviewer, review date, approval status, and material limitations. An unverified field must stay "UNVERIFIED — NOT FOR PROSPECT USE."

**Do not generate default expected equipment placements, cancellations, net contribution, royalty-adjusted income, break-even month or ROI from only the two public config files.**

### Candidate formulas, to evaluate AFTER legal/data review
Two mutually exclusive conventions can be explored; choose one, state all included categories, and avoid double counting.

**Method A: Actual cash-flow schedule** (better for transparent sources/uses):
- At each month, track separately (1) operating receipts, (2) operating cash expenses, (3) startup and incremental equipment capex, (4) financing draws, (5) debt service, (6) owner equity and distributions, (7) tax and other relevant outflows.
- Compute cumulative NET cash using the individual payment dates. Do not also apply the entire $56,800–$78,600 estimated investment range as an extra Month-0 negative line.
- Clearly distinguish business operating results, ending liquidity and cash recovered by equity owners; loan draws may improve liquidity without creating financial returns.

**Method B: Invested owner equity and post-investment cash distribution**:
- Start at *substantiated owner equity invested*, not automatically the FDD estimated gross startup cost (which can include financed amounts, working capital and overlapping expenses).
- Add each month's actual or properly substantiated modeled distributable cash after expenses, debt service and future reinvestment requirements. Subtract additional equity cash calls.
- Do not subtract already included startup uses twice.
- Label potential zero crossing as a defined **cumulative invested-cash recovery** point, NOT guaranteed break-even, accounting profit, equity IRR, or machine-life expectation.

If the reviewed research dataset is legally eligible to be displayed, only then apply the visual from Step 1: immediate red below-zero outlay, month-by-month movement based on legitimate calculations, teal above-zero only on a true mathematically interpolated crossover. No crossover => show "No modeled recovery within selected period". If the curve crosses due solely to new debt proceeds, do not label it an investment return.

Stress-test assumptions with actual supported ranges (e.g. slower placements, delinquencies, repairs, customer losses, financing rates). Never invent optimistic/base/pessimistic percentages or imply all units pay on time.

## 5. Deployment and disclosure gates

- Do not modify live chart inputs or config values in Step 2. This is documentation only.
- Maintain exact existing client-side financial snapshot/invitation functionality; a new chart must not submit its choices to Supabase, analytics, CDNs, or Flourish.
- An external Chart.js CDN, even without analytics, can create third-party requests and may necessitate more accurate privacy wording; Step 5 should prefer pinned/self-hosted assets where feasible.
- Chart-adjacent contextual statements will be drafted in Step 3, then accurate Privacy/Retention language reviewed in Step 4.
- The FTC Franchise Rule applies federally irrespective of state registration requirements. Under 16 CFR 436.5(s), financial performance representations to prospective franchisees require reasonable basis, written substantiation and required Item 19 treatment. Merely naming something "illustrative" or putting disclaimers on Privacy does not eliminate that requirement. Franchise counsel must review the current effective Iceworks FDD and the exact proposed output before public RECOVERY_RESEARCH release.
- Any supplemental financial performance representation must comply with applicable requirements and not casually bypass Item 19.

Primary regulatory references:
- https://www.law.cornell.edu/cfr/text/16/436.5
- https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise
- https://www.ftc.gov/business-guidance/resources/amended-franchise-rule-faqs

## 6. Acceptance tests for Step 5

1. Default direct costs: Month 0 = $6,154.79; Month 6 = $6,404.79; Month 12 = $6,654.79; Month 36 = $7,654.79; Month 108 = $10,654.79. Signed chart y-values are the negatives of these amounts.
2. At 4 PM visits/year, direct cost changes at Months 3, 6, 9, ...; no PM expense at Month 0.
3. With equipment=$0 and PM=$0, the graph and summary stay numerically stable.
4. Input changes update graph, month slider, tooltip and accessibility summary without stale values.
5. Reject malformed input and make currency rounding consistent to cents.
6. Cost curve displays no positive return, profits, ROI, modeled placements or recovery labels.
7. Existing startup range, reserve, deployable funding and extra-placement accounting remain unchanged.
8. Mobile/desktop, touch/keyboard, prefers-reduced-motion, print, and library-failure behavior tested.
9. Third-party Flourish support removed only when replacement fully passes QA.
10. Validated sources, publication notes and counsel approval precede any financial recovery output.

## Decisions for next steps

**Step 3:** Draft on-chart explanation and concise disclaimers for live cost-only view. Draft a distinct attorney-review placeholder for eventual supported financial-performance representation, without asserting legal sufficiency.

**Step 4:** Review and revise Privacy/Retention specifically for chart-input storage and requests; keep earnings/disclosure issues on the main page, not only Privacy.

**Step 5:** Implement self-hosted or otherwise reviewed Chart.js progressive easing, follow this math contract, retire Flourish and test. Only COSTS_ONLY ships before financial-performance clearance.
