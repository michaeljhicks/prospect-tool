# Iceworks Capital Readiness — Chart Copy and Disclosure Specification

**Version:** 1.0 — October 22, 2026  
**Project stage:** Step 3 of 5  
**Status:** Draft chart copy and publication requirements; committed as documentation only. NO live website content is changed and NO recovery claim is authorized by this file.

Companion documents:
- [Step 1: Chart behavior & design](CAPITAL-CHART-VISUAL-SPEC.md)
- [Step 2: Assumptions & calculation specification](CAPITAL-CHART-ASSUMPTIONS-SPEC.md)

## Decision record

This specification provides two distinct copy tracks:
- **TRACK A — Public cost-only visualization:** User-facing wording for the existing one-machine equipment + scheduled-maintenance illustration, enhanced with Chart.js.
- **TRACK B — Possible future recovery/earnings representation:** Internal disclosure checklist and a PLACEHOLDER template only, subject to documented Item 19 basis, substantiation, current FDD review and approval by franchise counsel. It must not appear on a prospect-facing webpage, printout, personalized invite, demo mode or marketing attachment until approved.

**Important:** A Privacy page, "educational purposes only" notice, or "not a guarantee" language does not by itself authorize an otherwise regulated financial performance representation. Per FTC 16 CFR 436.1(e), financial performance representations may be oral, written or VISUAL and include charts/calculations with possible results based on variables. Per 16 CFR 436.5(s) and 436.9(c), financial performance representations require reasonable basis, written substantiation and Item 19 treatment.

Do not claim this text alone makes publication compliant; review the exact scenario, claims, copy, placement and current effective FDD with franchise counsel.

## TRACK A — Exact recommended visible copy for cost-only Chart.js release

All quoted blocks in this section are approved *as editorial candidates*, not legal signoff. Preserve the existing page heading style and capitalization design.

### A1. Section eyebrow and primary heading
Eyebrow: **SINGLE-MACHINE OPERATING REFERENCES** (retain current wording).

Headline: **The cost of one machine.** (retain current wording and typography).

Section introduction, replacing the current paragraph:

> Explore how the initial equipment purchase, installation, and scheduled maintenance costs add up over time. Adjust the assumptions to see how those costs change for a single commercial ice machine.

Editorial guardrail: this is a cost demonstration, not an estimate of lease revenue, customer placements, earnings, or franchise performance. Keep the broader capital readiness calculator elsewhere on the page.

### A2. Existing three reference cards (tighten clarification)
1. **Average monthly lease charge**
   - Sub-label: **Customer price reference**
   - Value from existing numbers-reference-config.js: currently **$245**
   - Paragraph: "A reported monthly lease-price reference for one machine. It is not used to calculate the cost illustration and is not a forecast of billed or collected revenue."
2. **Equipment + installation**
   - Sub-label: **Upfront acquisition and setup**
   - Value: currently **$6,154.79**
   - Paragraph: "A reported single-machine cost reference for equipment purchase and installation. Actual costs depend on equipment and installation conditions."
3. **Preventative maintenance**
   - Sub-label: **Scheduled service reference**
   - Value: currently **$250 per visit**
   - Paragraph: "A reported per-visit maintenance-cost reference. The example starts with two planned visits per year; unscheduled repairs and other service costs are not included."

Do not label source figures as systemwide average profitability or guarantee representativeness. Confirm the underlying as-of date and substantiation before Step 5 launch.

### A3. Chart heading and one-sentence description
Chart workspace eyebrow: **NINE-YEAR COST PLANNING EXAMPLE**

Chart workspace heading: **What does one machine cost to keep in service?**

Chart workspace intro:

> Change the equipment and maintenance assumptions, then select a month to explore the costs. The illustration includes an initial equipment-and-installation outlay plus scheduled maintenance visits. It does not subtract lease payments or estimate business earnings.

Chart title: **Illustrative cumulative direct costs**

Chart sub-label: **One machine · Months 0–108 · Cost planning only**

Default-assumptions note (put near controls, in visually secondary text):

> Starting values are drawn from Iceworks' October 2026 single-machine cost references: $6,154.79 for equipment and installation, $250 per maintenance visit, and two visits annually. Change the inputs to explore other cost assumptions.

Dynamic rule: if any value changes, avoid calling altered inputs "Iceworks averages." Prefer "Your selected cost assumptions." The original config defaults may still be shown in an accessible help panel. The single-machine reference values differ from the separate overall franchise-startup cost assumptions; do not imply they are the same data set.

### A4. Exact input labels, legend and readouts
- Equipment + installation ($)
- Cost per maintenance visit ($)
- Scheduled maintenance visits per year
- Select a month to inspect cumulative direct costs
- Initial equipment + installation
- Scheduled maintenance to date
- Total illustrated direct costs

Tooltip display in cost-only mode (format dollars with 2 decimals):
- **Month [m] of 108**
- **Initial equipment + installation: [$...]**
- **Scheduled maintenance to date: [$...]**
- **Cumulative direct costs: [$...]**
- (Brief clarifier if axis uses negative numbers:) **Amounts below zero show money spent, not operating losses.**

If a month has no new PM charge, the plot should remain flat until the next scheduled visit. Do not use a smooth upward "recovery" curve that could imply earned income. Do not use "profit," "net income," "break-even," "earnings," "payback" or "return" as the plot legend in this mode.

### A5. On-chart context (short, immediately below the graph)
Heading: **Understanding the chart**

> Amounts below zero represent equipment and maintenance spending—not business losses. The illustration uses the figures you select and shows scheduled maintenance costs as they occur.

Put this close enough to explain the negative vertical axis at a glance. It is a comprehension aid, separate from the full exclusions statement.

### A6. Main adjacent disclosure (must appear without visiting another page)
Heading: **Important information**

> This illustration is for cost planning only. It does not estimate customer payments, revenue, profit, investment recovery, or financial returns. It excludes unscheduled repairs, financing, royalties, labor, insurance, taxes, software, equipment replacement, and other business expenses.
>
> Actual costs may vary. The nine-year period is an illustrative planning horizon, not a prediction of equipment life or customer contract duration.

Placement: after the graph and numeric readout, but in the SAME #numbers section, before proceeding to the capital explorer. Keep visible on mobile and print. Style as restrained body text, not inaccessible 8px fine print. Avoid replacing it with only a link to capital-privacy.html.

Editorial rationale: the exclusion statement must distinguish a subset of equipment-maintenance costs from a complete franchise operating-cost projection. The separate customer-rate reference should never be read as automatically collected revenue.

### A7. Privacy cross-link (non-legal, optional)
Short link text:

> How this tool handles your information

Destination: existing capital-privacy.html. Avoid stating here that all site activity is unconditionally private or that no information may ever be transmitted; the invitation system can optionally submit a limited consented summary as described in the existing Privacy page. Step 4 will align the privacy copy to the actual Chart.js loading/data flow.

### A8. Print/PDF copy behavior and accessibility
- Include chart title, selected inputs, last-reviewed/as-of information, selected month, graph, full adjacent disclosure A6 and any inputs-changed note on the printed page.
- Do not hide the disclosure under a collapsible panel or behind a tooltip. Support screenreader reading order and a readable summary after chart.
- Use the explicit term "direct costs" in accessible chart name, summary, tooltip, chart export and print label; never "profit curve".
- If graphics are unavailable, preserve text summary and adjacent disclosure.
- Do not overstate the source as verified; figures are currently code reference values subject to supporting-source reconciliation.

## TRACK B — Future recovery-representation copy framework: NOT FOR PUBLIC USE

**NOT deployable, not a temporary public mock, not an acceptable substitute for an Item 19 financial performance representation.** This provides a review checklist for counsel and source owners. Do NOT fill in sample dollar results or an invented crossing date. Do NOT implement a hidden publicly reachable variant.

### B1. Scope must be defined before any title is selected
A graph of ONE MACHINE'S possible recovery of purchase cost and a graph of ENTIRE FRANCHISE owner-equity recovery are very different. "Investment recovery" is ambiguous and could mislead visitors about the amount at stake.

Before counsel review, specify in writing:
- Exactly which asset/equity costs are included in the initial negative amount, with startup and equipment components reconciled to avoid double counts.
- Exactly what measure increases the line: cash collections, net cash after expenses and financing, cash distributed to owner, or another precisely defined measure.
- Whether project totals include royalty, staff, fixed overhead, unscheduled repair, taxes, debt service and reinvestment. If excluded, precisely why and how this affects interpretation.
- Evidence and cohort details, actual historical source dates, hypothetical variable treatment, timeframe and local/geographic limitations.
- Whether the operative Iceworks FDD contains an Item 19 representation permitting the chosen scenario and whether it matches the presented figures and methodology.

### B2. Conditional visual headline placeholders (DO NOT SHOW TO PROSPECTS)
Only after counsel has finalized an eligible scenario:
- Eyebrow: **ILLUSTRATIVE FINANCIAL SCENARIO**
- Headline: **[EXACT SCOPE AND METRIC—TO BE DETERMINED WITH COUNSEL]**
- Subhead: **[EXACT DATA PERIOD, GEOGRAPHY, POPULATION AND ASSUMPTION BASIS]**
- Crossover, if valid: **[DEFINED RECOVERY METRIC] reaches zero in [MONTH] under the selected assumptions**. Never default to "You break even after X months."

Avoid "typical ROI", "likely results", "expected growth", "guaranteed passive income", "easy payback", "investment paid off" and broad superlatives unless substantiated and reviewed. "Illustrative", "user-defined", "not guaranteed" and "results may vary" are not legal exemptions.

### B3. CONDITIONAL disclosure template, incomplete until reviewed
This is intentionally a checklist/placeholder, not final user copy:

> [Describe the EXACT financial measure and scope shown, not generic "returns."] The illustration draws on [the IDENTIFIED Item 19 representation and written substantiation, dated], covers [actual outlet population, period and territories], and applies [material assumptions and exclusions, each expressly identified]. [Describe whether the prospective franchisee may experience materially different financial results and any material limits to comparability.] [Link/refer to current operative Item 19 and offer substantiation as required.] [Include counsel-approved supplemental representation disclosures if applicable.]

No assurance that this copy is sufficient. The exact effective FDD must be reviewed and the resulting presentation checked before releasing this type of display. Written substantiation must exist **when** the representation is made; disclosures are not a cure for an unsupported example.

### B4. Release checklist (blocking)
- [ ] Review the operative Iceworks FDD Item 19 including whether it makes NO FPR or has an authorized FPR, together with any amendments.
- [ ] Verify basis and written substantiation for every material claimed outcome and default.
- [ ] Check whether user-controlled inputs and dynamic tooltips create additional representations outside the supported basis.
- [ ] Confirm the scope, dataset, time period, number/percentage of relevant outlets, exclusions, variations and assumptions accurately match Item 19.
- [ ] Reconcile startup range vs machine costs and owner equity vs finance proceeds; never count debt borrowing as profit.
- [ ] Apply FTC-required "actual results may differ" notices if applicable, in clear and conspicuous fashion; don't assume this alone resolves Item 19.
- [ ] Obtain written counsel approval of exact webpage, responsive/mobile version, print, screenshots and outbound sales use.
- [ ] Treat any subsequent changes to assumptions, earnings chart, or FDD as release-triggering changes, not simple cosmetic edits.
- [ ] Preserve evidence, release decision, assumptions/version and reviewer information.

## Placement map for Step 5
| Page position | Existing selector / location | Copy section |
|---|---|---|
| Header | #numbersTitle, .numbers-intro | A1 |
| Reference cards | #unitLeaseRef, #unitEquipmentRef, #unitPMRef | A2 |
| Chart workspace | .numbers-workspace-head | A3 |
| Chart canvas title | .numbers-chart-title | A3 |
| Controls/readouts | #unitCostInput, #unitPMInput, #unitPMFreq, #unitMonth and related numeric IDs | A4 |
| Immediately after graph/readout | New explanatory paragraph | A5 |
| Before leaving #numbers | .numbers-caveat replacement or extended disclosure | A6 |
| Near disclosure | capital-privacy.html link | A7 |
| Print and accessibility | @media print, aria-labels, summary text | A8 |
| No public location | internal, gated legal review document | Track B only |

## Sources and boundaries
FTC Franchise Rule, current text:
- 16 CFR 436.1(e) (definition of financial performance representation): https://www.law.cornell.edu/cfr/text/16/436.1
- 16 CFR 436.5(s) (Item 19): https://www.law.cornell.edu/cfr/text/16/436.5
- 16 CFR 436.9(c) (restrictions on disseminating FPRs): https://www.law.cornell.edu/cfr/text/16/436.9
- FTC Amended Franchise Rule FAQs: https://www.ftc.gov/business-guidance/resources/amended-franchise-rule-faqs
- FTC A Consumer's Guide to Buying a Franchise: https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise

The law does not become inapplicable solely because Iceworks does not presently sell in a franchise-registration or fee-filing state. The cost-only design is intended to avoid claiming financial returns but actual deployment and factual accuracy should still be reviewed for consistency with the effective FDD.

## Step 3 signoff and next actions
- We have DRAFTED final-form Track A copy but have NOT published it or obtained external legal signoff.
- We have NOT generated, approved, or published Track B financial performance claims or a working profit/payback chart.
- Step 4: review and update capital-privacy.html (with precise browser-local chart calculations, hosting requests, consented submission, record retention, confidentiality and a separate link to chart-specific limitations). Do not imply Privacy is the Item 19 home.
- Step 5: implement Chart.js progressive easing against COSTS_ONLY math and Track A visible disclosure; retire Flourish after verification; do not turn on Track B without documented approval.
