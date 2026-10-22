# Using the Iceworks Flourish sample dataset

The accompanying `iceworks-nine-year-single-unit-costs.csv` is a **cost-only planning illustration**, not actual nine-year historical data and not a forecast of franchise revenue, earnings, customer acquisition, or profit.

- Equipment + installation: **$6,154.79** at month 0.
- Scheduled preventive maintenance: **$250** every six months, starting month 6.
- 108 months (9 years) represented at monthly intervals.
- The total shown at month 108 is $10,654.79 ($6,154.79 + 18 × $250).
- Figures exclude repairs, financing, inflation, replacement, royalties, insurance, taxes and other costs; no customer retention is assumed.
- $245/month average lease rate is displayed separately on the website as a reported reference and **is not applied as recurring revenue to the timeline**.

## Flourish workflow

1. Sign in to Flourish and create an interactive line chart.
2. Import the CSV in the **Data** tab.
3. Use **Month** or **Year** on the X axis and `Total Direct Cost (Cumulative)`, `Equipment and Installation (Cumulative)`, `Scheduled PM (Cumulative)` as your series.
4. In the chart editor, enable tooltips and use Iceworks colors.
5. Publish through **Export & publish** and copy the published visualization URL.
6. Set `flourishEmbedUrl` in the repository's root `numbers-reference-config.js` to that URL. The public page then shows an optional **Load interactive Flourish chart** control; user consent is required before loading the external graphic.

**Important:** No prospect-specific financial or capital-readiness data should be uploaded to or embedded from Flourish. Review any published lease-revenue average or earnings-related chart with franchise counsel before sharing to prospects, since franchise financial-performance representations can be regulated under FDD Item 19.
