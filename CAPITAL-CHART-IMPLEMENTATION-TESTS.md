# Iceworks Chart.js Implementation — QA and Release Notes

Status: Step 5 candidate · October 22, 2026

## Actual implementation

- `capital-chart.js`: browser-native cost-only Chart.js controller. Progressive reveal uses easeOutCubic over 2.8 seconds, clipping the true stepped expense path; the underlying data never invents interpolation or lease collections.
- `capital-readiness.html` and `index.html`: identical visitor homepages, edited to contain Chart.js canvas, selected-month summary, hover/touch tooltip, replay, explanatory text and chart-adjacent disclosure.
- `numbers-reference-config.js`: unchanged cost/lease figures and assumptions; removed unused `flourishEmbedUrl` key.
- `capital-privacy.html`: added specific disclosure that the pinned Chart.js library downloads from a CDN; chart input values are not intentionally sent to the CDN.
- `CAPITAL-READINESS-README.md`: release description.
- `tests/capital-chart.test.cjs`: zero-dependency Node tests for math, static markup, input updates and JS-unavailable fallback.
- `.github/workflows/chart-tests.yml`: runs `node --check capital-chart.js` and `node --test tests/capital-chart.test.cjs` on pushes and pull requests.
- `flourish-data/` is left as a historical data archive. Neither runtime HTML nor `numbers-reference-config.js` references or loads Flourish.

## External dependency

Chart.js `4.5.1`, MIT license, pinned browser bundle:
`https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js`.
The page specifies Subresource Integrity and anonymous cross-origin fetching. This requests code from the CDN, not chart values. The numeric cost readout remains operational if Chart.js is unavailable.

## Functional contract

At equipment+install = $6,154.79, scheduled PM $250/visit and twice a year:
- Month 0 direct costs: $6,154.79.
- Month 6 direct costs: $6,404.79.
- Month 12 direct costs: $6,654.79.
- Month 36 direct costs: $7,654.79.
- Month 108 direct costs: $10,654.79.

Downward-axis values equal the negatives of these cost magnitudes. PM is a discrete event at month 6, 12, 18, ..., never a fabricated smooth monthly expense. The separate Capital Explorer and optional invitation summary calculations are not modified.

## Tests run and supported scope

The assistant's isolated JavaScript tests (using mock DOM/Chart) checked:
- JavaScript syntax and existing page inline script syntax.
- Mirrored homepages remain byte-identical.
- All required chart element IDs exist once; no duplicate IDs.
- Default monthly cost fixtures and PM visit frequency.
- Month-slider selection and dynamic recalc when inputs change.
- Invalid input rejection, correction recovery, and zero-cost stability.
- A failure mode in which the Chart.js library is absent and numeric summaries continue working.
- No active Flourish source or configuration references.
- Version-pinned dependency, chart-adjacent cost-only disclaimer and CDN/privacy notice.

**Important verification limit:** These checks are mocked/static; they do not constitute a real Safari/Chrome or on-device visual/animation test. The PR's GitHub Actions tests must run successfully before merging. The public Pages URL and final animation should additionally be visually checked in a real browser when available, especially mobile/touch, keyboard/slider, replay and print. The custom reveal uses the Chart.js canvas lifecycle, so errors in that lifecycle would only be exposed by an actual browser test.

## Manual browser acceptance checklist

- [ ] Navigate to `/capital-readiness.html#numbers` in Chrome desktop; image draws in ~2.8 seconds upon scrolling into view, starting at the Month-0 downward outlay.
- [ ] Replay redraws once without changing numeric values or inputs.
- [ ] Graph stays flat between scheduled maintenance months; visit jumps occur at completed intervals.
- [ ] Mouse/touch selection, month slider and cost detail tooltip show the same cents values.
- [ ] Test on narrow iPhone and iPad widths; no horizontal scrolling, clipped card, overlay or unreadable axis labels.
- [ ] Enable prefers-reduced-motion: chart renders immediately and remains usable.
- [ ] Test with Chart.js network request blocked: fallback displays, live numeric totals/slider work, no unhandled page error.
- [ ] Print/PDF chart; adjacent cost-only disclosure remains visible.
- [ ] Confirm that optional Financial Snapshot, personalized invite, limited summary consent and PUDI preview still work.
- [ ] Verify SRI passes, CDN script loads, and page is available through GitHub Pages.
- [ ] Obtain any required factual source and franchise-counsel review of the current wording before promotional use.

## Regulatory boundary

This release is the COSTS_ONLY visualization. It cannot calculate or display prospective customer placements, income, gross revenue, net profit, IRR, break-even or owner capital recovery. Do not place a red-to-teal payback/returns prototype on any prospect-accessible URL until separately substantiated and legally reviewed under the FTC Franchise Rule Item 19. A Privacy-page caveat does not substitute for the operative FDD.
