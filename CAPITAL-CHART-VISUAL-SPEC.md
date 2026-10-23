# Iceworks Capital Readiness — Signature Chart Visual & Behavior Specification
Version: 1.0 (Step 1 of 5) · October 22, 2026
Status: DESIGN SPECIFICATION ONLY — NO PUBLIC CHART CHANGE APPROVED BY THIS FILE

## Objective
Replace the optional Flourish experiment and, in the implementation phase, upgrade the current hand-authored SVG "Illustrative cumulative direct costs" presentation with a native Chart.js v4 line chart. Deliver a polished, accessible, mobile-first, progressive-drawing visual that feels like an Iceworks financial dashboard rather than a generic reporting graph.

Preserve the existing capital explorer, cost calculations, visitor privacy, invitation flow, and financial snapshot. The previous cost-only commitment in CAPITAL-READINESS-README.md remains authoritative until any legal/FDD review and explicit change to the publication rules. A design document does not authorize publication of sales, income, cash-flow, recovery, profit, or break-even projections.

## Work order (keep this order)
1. Visual + interaction specification (THIS DOCUMENT).
2. Inputs and calculation assumptions specification; document data provenance and guardrails.
3. Approved chart-adjacent disclosure copy.
4. Privacy/retention page clarification plus separate financial-representation disclosures (the Privacy page cannot substitute for Item 19).
5. Implement/test Chart.js in capital-readiness.html, remove retired Flourish elements/config when appropriate, validate on mobile and desktop, then deploy permitted content.

## Location and existing architecture
- Repository: michaeljhicks/prospect-tool (plain HTML, CSS, JavaScript; no React/build tooling).
- Live HTML: capital-readiness.html (identical to index.html at time of spec).
- Chart section: #numbers; existing SVG: #unitCostChart; explanatory controls: #unitCostInput, #unitPMInput, #unitPMFreq and #unitMonth.
- Existing renderer: initSingleMachineNumbers(); existing config: numbers-reference-config.js.
- The existing cost planning graphic runs Month 0–108 and displays equipment/install plus preventative maintenance only. Preserve those fundamentals.
- Existing Flourish embed is optional, hidden without configuration, and loads on opt-in; retirement means removing its UI, loader and config in Step 5 rather than enabling a new third-party chart account.
- Target: self-host a pinned Chart.js browser distribution, or adopt a vetted pinned delivery with no analytics; do not rely on React/shadcn/Recharts. Document library license/version and any new network calls before deploying.

## Design concept: “The Investment Journey”
Visual reference: premium fintech editorial, integrated with existing Iceworks cream-paper / dark-navy / teal design language. Use an expansive chart canvas, clear data hierarchy, restrained glow, and crisp typography. No dense legend boxes, meaningless wiggles, heavy gray baseline, stock-market styling, autoplay loops, or gratuitous third-party widgets.

Palette:
- Deep navy ink: #073247 and #042839, aligned to existing variables.
- Negative/outlay accent: #D64C50.
- Positive/progress accent: Iceworks teal #079E9B (subject to contrast adjustment on pale backgrounds).
- Quiet reference/grid: #CBDCE1 at low opacity.
- Warm paper / clean white surfaces: reuse page background and cards.
- Gradient fills: understated red under negative region; teal above zero only in a legally cleared representation.
- Font: inherit editorial site typography; numeric labels use tabular figures for stability.

Hierarchy:
1. Small eyebrow: “SINGLE-MACHINE COST PLANNING” in live cost-only mode.
2. Heading: “The cost of one machine.”
3. One-line explanation stating what the chart counts and excludes.
4. Large responsive chart, roughly 320 px tall desktop and 260–300 px tall mobile.
5. Minimal month/years axis; currency axis; subtle zero-dollar reference rule (1 px dashed, not thick).
6. Inspect-month summary/readout, short explanatory note and link to assumptions.
7. Prominent chart-adjacent legal/context note drafted in Step 3.

## Animation behavior: Progressive Line With Easing
Base Chart.js sample: https://www.chartjs.org/docs/latest/samples/animations/progressive-line-easing.html
Complementary styling: https://www.chartjs.org/docs/latest/charts/line.html (segment colors, monotone interpolation where appropriate).

- On scroll into view the first time, play a single progressive draw along monthly points, left to right, approximately 2.4–3.0 seconds overall.
- Prefer easeOutCubic for composed movement, with easeOutQuint available for design review; avoid easing that visually warps month spacing.
- Opening beat: visually distinguish the Month 0 equipment/install outlay. If showing negative expenditures, depict a clear drop from baseline to initial outlay at x=0 using two explicit data points, not a false profit trajectory.
- Reveal scheduled maintenance markers/step changes as timeline progresses. Data must drive the shape, never decorative curvature that changes the underlying meaning.
- At animation completion, resolve to crisp static geometry with no bouncing, pulsing, or continuous motion.
- Display an accessible “Replay animation” button, optional only when the chart is visible. Replays must not recalculate or mutate input values.
- On input edits, update smoothly within ~300 ms, preserving selection and providing no hard flash.
- Respect prefers-reduced-motion: render immediately and suppress shimmer, travel and glow transitions.
- If Chart.js fails to load, show the existing cost-only summary and a readable fallback rather than blank space.

## Interactions
- Pointer hover / touch tap / keyboard-accessible month slider select a month. Keep the current #unitMonth slider and #unitMonthLabel compatibility during implementation.
- A single floating detail panel shows selected month, equipment/install cost, maintenance cost-to-date and cumulative direct cost; in live cost-only mode label the amounts as COSTS, not returns.
- Selection marker: clear dot on series, subtle vertical guide and stable location within chart.
- Values and month must match underlying math exactly. Tooltip cannot silently interpolate unrelated revenue or profit.
- Touch targets >=44 px where applicable; chart supports narrow screens without horizontal page scrolling.
- Keyboard: explanatory text, a focusable slider, visible focus, ARIA description of what the graph means, live-region summary that does not over-announce on pointer motion.
- Maintain visibility and legibility on light/dark displays and in print; export/print should never omit the disclosure.

## Chart data model: two deliberately separate publication modes

### A. COSTS_ONLY — only mode approved for prospect-facing production at this stage
- Upfront cost = equipment purchase + installation. Chart begins at 0 then makes a NEGATIVE Month 0 drop to minus the upfront outlay.
- Subsequent values represent NEGATIVE cumulative direct costs; scheduled preventive maintenance accumulates over time based on the number of visits per year and the per-visit cost. Keep the existing timing semantics unless changed transparently in Step 2.
- Costs-only curve cannot climb into positive territory because there is no income/collection/contribution series in this model. It will stay flat between scheduled costs and step downward when maintenance outlays occur.
- Teal may accent controls and emphasis but MUST NOT signify recovery, earnings or break-even in this production mode.
- Axes: Month 0–108 (or years 0–9), dollars, visible zero line and negative territory.
- Labels: “Illustrative cumulative direct costs,” “Initial equipment + installation,” and “Scheduled maintenance.”
- Exclusions: unscheduled repairs, warranty exclusions, financing, royalty, insurance, staffing, software, taxes, equipment replacement, cancellation, collections and other expenses unless specifically modeled later.
- The separate current average monthly lease rate can remain a reference only; do not automatically use it to infer collections or offset costs.

### B. RECOVERY_RESEARCH — DESIGN-ONLY / NOT FOR PROSPECT DISPLAY
**Do not publish or expose this mode with a demo query parameter, hidden toggle, draft public URL, or user-editable profit default until franchise counsel approves both the Item 19 basis and the specific implementation.**
- Proposed aesthetic sequence: immediate red outlay at Month 0; subsequent month-by-month modeled net contributions move upward; exact mathematical zero crossing changes line red to teal; highlight the crossover with a dot and neutral label, if the series crosses zero at all.
- If series remains negative, show no crossover marker; if series starts positive due to a data mistake, reject or warn rather than fabricating a dramatic drop.
- Illustrative category and hypothetical date/period must be plainly named. Never imply a baseline is “typical,” “expected,” “guaranteed,” or an ROI forecast.
- Monthly contribution, customer placements, terminations, collections, variable and fixed operating expenses, royalties and financing must be explicitly modeled and validated before any plot can be meaningful. The current cost-only inputs are insufficient.
- Piecewise segmentation should split at the actual y=0 intersection, not recolor an entire monthly segment as positive before crossing. Use Chart.js segment options or separate coherent datasets if needed.
- Color/fill red below zero and teal above zero; controlled glow at actual crossing; animated explanatory tooltip.
- A disclaimer, especially one only on capital-privacy.html, is not a replacement for substantiated FDD Item 19 disclosure and consistency with what is provided to prospects.

## Legal review / release gate
The FTC Franchise Rule is federal and its Item 19 financial performance representation conditions do not depend on operating in a state with a registration/filing requirement. Representations about potential financial results need a reasonable basis, written substantiation and appropriate Item 19 inclusion; merely saying “hypothetical,” “educational,” “not guaranteed,” or “assumptions chosen by user” does not automatically avoid the rule.

Before deploying Mode B to any prospect-facing, publicly accessible or personalized link:
- Have franchise counsel review the current FDD Item 19 language, actual chart data/assumptions, sales presentation and website copy.
- Document reasonable basis, contemporaneous written substantiation, sample/selection limitations, relevant expenses and representative scenarios.
- Align Item 19 and permitted supplemental performance information with the displayed example; get explicit signoff on the final browser UI and any export.
- Document change approval and versioned assumptions before a release. Do not create a misleading positive trajectory by default.
- Put key statements immediately beside the visual, not only in the Privacy/Retention policy.
- Record what data visitors submit, if anything; keep any new chart inputs browser-local absent a separately reviewed consent/data-flow change.

Authoritative background:
- 16 CFR 436.5(s): https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-436/section-436.5
- FTC Franchise Rule FAQ: https://www.ftc.gov/business-guidance/resources/amended-franchise-rule-faqs
- FTC Compliance Guide: https://www.ftc.gov/system/files/documents/plain-language/bus70-franchise-rule-compliance-guide.pdf

## Accessibility, performance and QA acceptance criteria
1. Existing Step 1/Step 2/optional Financial Snapshot calculations, invitation behavior and privacy controls are unchanged.
2. Chart loads without any third-party iframe, tracking pixel, visitor analytics or outbound user-financial-data submission.
3. Smooth progressive drawing with reduced-motion fallback and replay, including Safari/iOS and Chrome desktop.
4. Precise Month 0 discontinuity, measured cumulative costs, and no fabricated interpolated cash receipts.
5. Correct month-specific tooltips, y-axis labeling, negative-range grid and zero baseline.
6. No “payback,” “ROI,” positive breakeven or cash-profit result in public mode without documented approval.
7. Full mobile keyboard/touch accessibility, print and high-DPI clarity, and graceful script fallback.
8. No silently changed FDD cost assumptions or historical numbers; all admin reference changes are sourced and dated.
9. Remove Flourish option/code only when replacement behavior is fully tested; keep any in-progress redesign away from public unless explicitly deployed.
10. Confirm privacy statements remain technically accurate after introducing Chart.js.

## Decision record
Chosen design system: native Chart.js 4.x progressive line with easing, augmented with threshold-specific line/fill styling when lawful and applicable. Do not use Nivo, shadcn/Recharts, Vizzu, or uPlot for this single chart. Preferred safe initial deployment: the same premium animated treatment applied to the current COSTS_ONLY visualization; the red-to-teal recovery prototype remains gated pending the separate financial-performance release decision.
