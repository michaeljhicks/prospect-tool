# Iceworks Capital Recovery — Prospect-Facing Release Candidate

**Status: design + copy candidate, NOT approved for public prospect distribution.**

## Scope and design choices

This branch builds upon the previously approved animated red-to-teal Chart.js layout and integrates it into the Capital Readiness Explorer. It is designed to be ready for a final financial substantiation/FDD review, not to bypass one.

- Prominent narrative: “How equipment capital could move over time.”
- The initial one-machine equipment/installation cost is clearly identified and stays separate from the full franchise startup investment.
- The **monthly hypothetical cash contribution starts blank**. No unsupported $175 or other contribution number is imposed on a visitor on load.
- An explicitly labeled **“View a fictional example”** button sets $175/month and 108 assumed contribution months solely to demonstrate the graph and animation.
- The starting assumed contribution period is 36 months. This is an illustrative default chosen around a standard lease term, **not proof** that every contract pays in full for 36 months.
- One-machine expense references are $6,154.79 equipment/installation and $250 per maintenance visit twice a year; sourced to the existing October 2026 code references, pending invoice substantiation.
- Cost-only Chart.js remains visible lower on the page. Capital Explorer and invitation/consent/Supabase logic remain unchanged.
- Tooltips, zero-crossing display, animated progressive line, month slider, explicit demonstration labeling, mobile breakpoints and print CSS remain in place.
- Existing Privacy & Retention candidate page is updated to accurately describe both charts and that scenario entries are local browser inputs, not part of the optional capital summary.
- Page and Chart.js source stay framework-free HTML, CSS, browser JavaScript. No new analytics or financial data transmission is added.

## Mathematical scope

This is a **single-machine, simplified assumed cash-balance formula**. It must not be called an overall franchise ROI, earnings forecast, or equipment-life estimate.

For month m, monthly assumed contribution C, months contributing P, equipment outlay E, planned maintenance visits V each year, PM visit cost M:

    active = min(m, P)
    visits = floor(active * V / 12 + 1e-8)
    balance(m) = -E + active*C - visits*M

This model **assumes** cash contribution stops after P and scheduled PM charges stop at the same time. It does not model collection delays, attrition, replacement, royalties, overhead, interest, finance principal, fixed business costs, unscheduled repairs or full initial franchise investment unless the user actually incorporates them into C and scope, which is not verifiable in this tool. Even if the illustrated series crosses $0, that does not prove an owner's cash recovered or franchise profitability.

### No earnings defaults

The reported monthly billed lease-price reference ($245) is not equated with cash received or contributed. The fictional $175 example requires an explicit button click and is always accompanied by a visible warning. On invalid or missing contribution input, the scenario and crossover metrics clear rather than preserving stale results.

## Open disclosure gate

The user-provided Iceworks FDD dated **January 5, 2026**, Item 19 (page 42), states that Iceworks currently makes no financial performance representations. The federal FTC Franchise Rule regulates prospective earnings and financial-performance illustrations, including user-driven mathematical charts. A Privacy disclaimer or “not guaranteed” label does not alone make this representation consistent with the current FDD.

**Do not merge this release candidate into GitHub Pages `main` as a prospect-facing chart yet.** Before release:
1. Obtain current effective Item 19 and attorney approval of permitted presentation, including written substantiation.
2. Verify cost references, contribution definition, visit timing, actual cash collections, retention/renewal behavior, operating and fixed expenses, and selection bias.
3. Decide whether an interactive single-machine illustration is within counsel-approved FDD disclosure, and restrict unsupported assumptions/outcomes if required.
4. Verify both the visible chart and Privacy copy, mobile/print exports, and salesperson use.
5. Document approval, date, data period, actual inputs and calculation version.

## Verification

The branch's GitHub Actions workflow runs the unchanged cost-only regression suite and headless Chromium tests, supplemented to test:
- Blank default contribution (no preselected returns)
- Explicit fictional-example opt-in and red-to-teal rendering
- The no-crossover case at 36 assumed months
- Invalid input clearing a stale illustrated result
- Mobile, reduced motion and blocked CDN fallbacks
- Original cost-only chart and Capital Readiness calculations

A successful run confirms coding behavior, not financial/legal release readiness.
