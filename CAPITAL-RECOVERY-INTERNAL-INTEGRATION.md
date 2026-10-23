# Iceworks Capital Recovery — Main-page Internal Review

**Status: NOT PUBLICLY RELEASED · Internal prototype PR · October 22, 2026**

This feature branch places the previously reviewed red-to-teal Chart.js design into the **same layout** as the Capital Readiness Explorer, immediately before the existing cost-only section.

## What changed
- `capital-readiness.html` and mirrored `index.html`: an embedded capital-recovery **internal design review** panel, editable assumptions, animated line, month slider, zero-crossing metric, and prominent prototype labeling.
- `capital-recovery-review.js`: isolated Chart.js controller; its inputs are ephemeral in-browser and are not submitted to Supabase or mixed with the other funding calculator.
- `tests/capital-chart.browser.cjs`: adds real Chromium checks for the new red/teal data, 36-month no-crossing case, editable inputs, and mobile layout.
- Existing cost-only Chart.js and Capital Explorer calculations/optional submission flows remain unchanged.

## Fictional scenario, not business earnings
The review panel explicitly labels its `$175` monthly contribution and `108` paid months as **fictional design-test assumptions**. The only included direct cost is initial equipment/installation plus modeled scheduled preventive maintenance. There is no automatic use of the reported $245 monthly billed-price reference. Financing, owner compensation, royalties, shared expenses, collection lag, unscheduled repairs and other significant costs are not modeled.

Formula for integer month `m`, in **cents**:

    activeMonths = min(m, fictionalPaidMonths)
    visits = floor(activeMonths * annualPMFrequency / 12 + 1e-8)
    balance = -equipmentOutlay + activeMonths * fictionalMonthlyContribution - visits * PMCost

The time-zero drop is drawn separately. Crossing from red to teal occurs at exactly y=0 by interpolating across adjacent monthly observations; where no crossover occurs, the panel says so.

It is not a claim that an Iceworks franchisee's capital would be recovered on that timetable. In particular, the single-machine cost is not the franchise's total investment.

## Publication gate
The supplied January 5, 2026 FDD's **Item 19 (page 42)** affirmatively states that Iceworks does not make financial performance representations. The FTC Franchise Rule covers hypothetical financial performance charts, including user-adjustable formulas. Merely placing a disclaimer on the Privacy page cannot make this prospect-facing representation consistent with a no-FPR Item 19.

**Do not merge this review PR to the public GitHub Pages branch or share the branch's preview as franchise sales material without updated Item 19 disclosure/appropriate substantiation and franchise-counsel signoff.** When counsel approves a specific set of representations, reconcile the dataset and disclosures, remove fictional defaults or replace with substantiated figures, then review the final responsive chart and user-controlled ranges.

For now, the public `main` branch remains the cost-only visualization, and the requested visual redesign lives on this feature branch as a complete integration review.

## Verification to do before prospective release
- Reconcile current equipment purchase/install and PM costs with invoices and machine type.
- Substantiate the appropriate monthly collection and contribution measure across an appropriately selected outlet population.
- Model canceled/renewed contracts, bad debt, out-of-service periods and other cash costs; 36-month terms must not be portrayed as nine years of assured receipts.
- Decide whether the chart measures **one machine's direct cost recovery** or **full franchise equity/capital recovery** and title it accordingly.
- Verify the operative FDD Item 19 and complete counsel review, substantiation, and publication clearances.
