/* Real Chromium smoke test for Chart.js progressive cost visualization.
 * Requires playwright and a local static server, e.g. python3 -m http.server 8765.
 */
const assert = require("node:assert/strict");
const {chromium} = require("playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8765";

(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const errors = [];
    const desktop = await browser.newPage({viewport: {width: 1360, height: 940}});
    desktop.on("pageerror",e=>errors.push(String(e)));
    await desktop.goto(base + "/capital-readiness.html", {waitUntil:"networkidle", timeout:45000});
    await desktop.locator("#unitChartCanvasWrap").scrollIntoViewIfNeeded();
    await desktop.waitForFunction(() => {
      const canvas = document.getElementById("unitCostCanvas");
      return window.Chart && window.Chart.getChart(canvas);
    }, {timeout:30000});
    await desktop.waitForFunction(() => {
      const chart = window.Chart.getChart(document.getElementById("unitCostCanvas"));
      return chart?.$iceProgress >= 1;
    }, {timeout:15000});
    assert.equal(await desktop.locator("#unitCostTotal").textContent(),"$10,654.79");
    const defaults = await desktop.evaluate(() => {
      const chart = window.Chart.getChart(document.getElementById("unitCostCanvas"));
      return {version: window.Chart.version, end: chart.data.datasets[1].data[108].y, stepped: chart.data.datasets[1].stepped};
    });
    assert.equal(defaults.version,"4.5.1");
    assert.equal(defaults.end,-10654.79);
    assert.equal(defaults.stepped,"after");

    // The internal recovery design is embedded above the separate cost-only section.
    await desktop.locator("#recGraph").scrollIntoViewIfNeeded();
    await desktop.waitForFunction(() => window.Chart?.getChart(document.getElementById("recCanvas")),{timeout:30000});
    const recovery = await desktop.evaluate(() => {
      const c=window.Chart.getChart(document.getElementById("recCanvas"));
      return {
        atZero:c.data.datasets[0].data[0].y,
        hasPositive:c.data.datasets[1].data.some(p=>p.y>0),
        hasNegative:c.data.datasets[0].data.some(p=>p.y<0),
        labels:Array.from(document.querySelectorAll("#recPreview input")).map(x=>x.id)
      };
    });
    assert.equal(recovery.atZero,-6154.79);
    assert(recovery.hasPositive && recovery.hasNegative,"Fictional example must cross the zero line");
    assert.match(await desktop.locator("#recCrossing").textContent(),/^Month 45\./);
    await desktop.locator("#recPaid").fill("36");
    assert.equal(await desktop.locator("#recCrossing").textContent(),"Not within 108 months");
    await desktop.locator("#recPaid").fill("108");
    assert.equal(await desktop.locator("#recReplay").isDisabled(),false);
    await desktop.locator("#recReplay").click();
    await desktop.locator("#recCapital").fill("6500");
    assert.equal(await desktop.locator("#recOutlay").textContent(),"$6,500.00");
    await desktop.locator("#recCapital").fill("6154.79");

    // Replay should visibly reset progress and finish again without modifying inputs.
    await desktop.locator("#unitChartReplay").click();
    const early = await desktop.evaluate(() => window.Chart.getChart(document.getElementById("unitCostCanvas")).$iceProgress);
    assert(early < 1,"Replay should restart progressive animation");
    await desktop.waitForFunction(() => window.Chart.getChart(document.getElementById("unitCostCanvas")).$iceProgress >= 1,{timeout:15000});
    assert.equal(await desktop.locator("#unitCostTotal").textContent(),"$10,654.79");

    await desktop.locator("#unitCostInput").fill("7000.00");
    await desktop.locator("#unitPMInput").fill("100");
    await desktop.locator("#unitPMFreq").selectOption("4");
    await desktop.locator("#unitMonth").evaluate(el => {
      el.value = "3"; el.dispatchEvent(new Event("input",{bubbles:true}));
    });
    assert.equal(await desktop.locator("#unitCostTotal").textContent(),"$7,100.00");
    await desktop.locator("#unitPMInput").fill("-5");
    assert.equal(await desktop.locator("#unitChartValidation").isVisible(),true);
    assert.equal(await desktop.locator("#unitCostTotal").textContent(),"$7,100.00");
    await desktop.locator("#unitPMInput").fill("100");
    assert.equal(await desktop.locator("#unitChartValidation").isVisible(),false);
    await desktop.locator("#unitChartReplay").scrollIntoViewIfNeeded();
    await desktop.screenshot({path:"chart-desktop-smoke.png",fullPage:true});

    // Mobile widths and reduced-motion accessibility.
    const mobile = await browser.newPage({
      viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2,
      reducedMotion:"reduce",hasTouch:true
    });
    mobile.on("pageerror",e=>errors.push("mobile: "+String(e)));
    await mobile.goto(base+"/capital-readiness.html",{waitUntil:"networkidle",timeout:45000});
    await mobile.locator("#recGraph").scrollIntoViewIfNeeded();
    await mobile.waitForFunction(() => window.Chart?.getChart(document.getElementById("recCanvas")),{timeout:30000});
    assert.equal(await mobile.locator("#recFallback").isVisible(),false);
    await mobile.locator("#unitChartCanvasWrap").scrollIntoViewIfNeeded();
    await mobile.waitForFunction(() => window.Chart?.getChart(document.getElementById("unitCostCanvas"))?.$iceProgress === 1,{timeout:30000});
    const dimensions = await mobile.evaluate(() => ({
      body:document.documentElement.scrollWidth,
      viewport:window.innerWidth,
      chart:document.getElementById("unitChartCanvasWrap").getBoundingClientRect().width
    }));
    assert(dimensions.body <= dimensions.viewport + 2,"Unexpected horizontal scrolling: "+JSON.stringify(dimensions));
    assert(dimensions.chart > 220);
    await mobile.screenshot({path:"chart-mobile-smoke.png",fullPage:true});

    // Prevent CDN loading: the page must still show cost figures and slider.
    const offline = await browser.newPage();
    await offline.route("**/chart.umd.min.js",r=>r.abort());
    await offline.goto(base+"/capital-readiness.html",{waitUntil:"domcontentloaded",timeout:45000});
    await offline.locator("#unitChartFallback").waitFor({state:"visible",timeout:15000});
    await offline.locator("#recFallback").waitFor({state:"visible",timeout:15000});
    assert.equal(await offline.locator("#unitCostTotal").textContent(),"$10,654.79");
    assert.equal(await offline.locator("#unitChartReplay").isDisabled(),true);
    assert.deepEqual(errors,[], "Uncaught errors in browser: "+errors.join("; "));
    process.stdout.write("Browser smoke passed: Chrome desktop, animation, input edits, narrow/mobile/reduced-motion, blocked CDN fallback.\n");
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
