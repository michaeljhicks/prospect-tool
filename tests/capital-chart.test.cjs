/* Zero-dependency regression checks for the public, cost-only chart controller.
 * Run: node --test tests/capital-chart.test.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "capital-chart.js"), "utf8");
const page = fs.readFileSync(path.join(root, "capital-readiness.html"), "utf8");
const mirror = fs.readFileSync(path.join(root, "index.html"), "utf8");
const refs = fs.readFileSync(path.join(root, "numbers-reference-config.js"), "utf8");
const privacy = fs.readFileSync(path.join(root, "capital-privacy.html"), "utf8");

function fixture(withChart = true) {
  const names = [
    "unitCostInput", "unitPMInput", "unitPMFreq", "unitMonth", "unitMonthLabel",
    "unitCostEquipmentTotal", "unitCostPMTotal", "unitCostTotal", "unitCostCanvas",
    "unitChartFallback", "unitChartReplay", "unitChartValidation", "unitChartTooltip",
    "unitChartCanvasWrap", "unitHorizonLabel", "unitReferenceDate", "unitLeaseRef",
    "unitEquipmentRef", "unitPMRef", "unitCostEvents", "unitDefaultEquipment",
    "unitDefaultPM", "unitDefaultFreq", "unitTipMonth", "unitTipTotal",
    "unitTipEquipment", "unitTipMaintenance"
  ];
  const elements = {};
  for (const id of names) {
    elements[id] = {
      id, value: "", textContent: "", hidden: false, disabled: false,
      clientWidth: 770, clientHeight: 335, offsetWidth: 215, offsetHeight: 125,
      style: {}, attributes: {}, events: {},
      setAttribute(key, val) {this.attributes[key] = val;},
      addEventListener(key, callback) {this.events[key] = callback;}
    };
  }
  const noop = () => {};
  const ctx = {
    save: noop, restore: noop, beginPath: noop, rect: noop, clip: noop,
    moveTo: noop, lineTo: noop, stroke: noop, arc: noop, fill: noop,
    setLineDash: noop
  };
  let chart = null;
  class MockChart {
    constructor(canvas, config) {
      this.config = config; this.data = config.data; this.options = config.options;
      this.chartArea = {left: 46, top: 12, right: 705, bottom: 280};
      this.ctx = ctx;
      this.scales = {
        x: {
          getPixelForValue: v => 46 + (v / 108) * 659,
          getValueForPixel: p => (p - 46) / 659 * 108
        },
        y: {getPixelForValue: v => 12 + v / config.options.scales.y.min * 268}
      };
      chart = this;
    }
    draw() {
      for (const plugin of this.config.plugins) plugin.beforeDatasetsDraw?.(this);
      for (const plugin of this.config.plugins) plugin.afterDatasetsDraw?.(this);
      for (const plugin of this.config.plugins) plugin.afterDraw?.(this);
    }
    update(mode) {this.lastUpdateMode = mode; this.draw();}
    stop() {}
  }
  const fakeWindow = {
    ICEWORKS_UNIT_REFERENCES: {
      monthlyLeaseRate: 245, equipmentAndInstallation: 6154.79,
      preventativeMaintenanceVisit: 250, preventativeMaintenanceVisitsPerYear: 2,
      illustrativeMonths: 108, asOf: "October 2026"
    },
    matchMedia: () => ({matches: true}),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: noop,
    Chart: withChart ? MockChart : undefined
  };
  const fakeDocument = {getElementById: id => elements[id] || null};
  const context = vm.createContext({window: fakeWindow, document: fakeDocument, Intl, Number, Math, Object, String, console});
  vm.runInContext(source, context, {filename: "capital-chart.js"});
  return {elements, getChart: () => chart, api: fakeWindow.IceworksCostChart};
}

test("both published page files are identical", () => assert.equal(page, mirror));
test("active page/config has no Flourish remnants", () => {
  assert.doesNotMatch(page, /flourish/i);
  assert.doesNotMatch(refs, /flourish/i);
});
test("version-pinned chart distribution and transparent CDN privacy", () => {
  assert.match(page, /chart\.js@4\.5\.1\/dist\/chart\.umd\.min\.js/);
  assert.match(page, /integrity="sha384-[^"]+"/);
  assert.match(privacy, /cdn\.jsdelivr\.net/);
});
test("cost math exactly matches documented monthly expenses", () => {
  const {api} = fixture();
  const cases = [[0, 615479],[5, 615479],[6,640479],[12,665479],[36,765479],[108,1065479]];
  for (const [month, expected] of cases) {
    const calculated = api.costAt(month, 615479, 25000, 2);
    assert.equal(calculated.totalCents, expected);
  }
  assert.equal(api.costAt(2,615479,25000,4).visits,0);
  assert.equal(api.costAt(3,615479,25000,4).visits,1);
  assert.equal(api.costAt(0,0,0,4).totalCents,0);
});
test("starting cards, month slider and visit totals", () => {
  const f = fixture();
  f.api.init();
  assert.equal(f.elements.unitCostTotal.textContent,"$10,654.79");
  assert.equal(f.elements.unitEquipmentRef.textContent,"$6,154.79");
  assert.equal(f.elements.unitDefaultPM.textContent,"$250.00");
  assert.equal(f.getChart().data.datasets[1].data[108].y,-10654.79);
  f.elements.unitMonth.value = "6";
  f.elements.unitMonth.events.input();
  assert.equal(f.elements.unitCostPMTotal.textContent,"$250.00");
  assert.equal(f.elements.unitCostTotal.textContent,"$6,404.79");
});
test("edits recalculate; validation retains last valid chart without accepting bad inputs", () => {
  const f = fixture();
  f.api.init();
  f.elements.unitMonth.value = "6";
  f.elements.unitMonth.events.input();
  f.elements.unitCostInput.value = "7000.00";
  f.elements.unitCostInput.events.input();
  assert.equal(f.elements.unitCostTotal.textContent,"$7,250.00");
  f.elements.unitPMInput.value = "-1";
  f.elements.unitPMInput.events.input();
  assert.equal(f.elements.unitChartValidation.hidden,false);
  assert.equal(f.elements.unitCostTotal.textContent,"$7,250.00");
  f.elements.unitPMInput.value = "100";
  f.elements.unitPMInput.events.input();
  assert.equal(f.elements.unitChartValidation.hidden,true);
  assert.equal(f.elements.unitCostTotal.textContent,"$7,100.00");
  f.elements.unitCostInput.value = "0";
  f.elements.unitPMInput.value = "0";
  f.elements.unitCostInput.events.input();
  assert.equal(f.elements.unitCostTotal.textContent,"$0.00");
});
test("when chart library is blocked, the numeric illustration remains usable", () => {
  const f = fixture(false);
  f.api.init();
  assert.equal(f.elements.unitChartFallback.hidden,false);
  assert.equal(f.elements.unitChartReplay.disabled,true);
  assert.equal(f.elements.unitCostTotal.textContent,"$10,654.79");
  f.elements.unitMonth.value = "12";
  f.elements.unitMonth.events.input();
  assert.equal(f.elements.unitCostTotal.textContent,"$6,654.79");
});
test("display and chart are cost-only; never imply revenue, profits or payback", () => {
  assert.match(page,/It does not estimate customer payments, revenue, profit, investment recovery, or financial returns/);
  assert.doesNotMatch(source, /monthlyLeaseRate.*(profit|recovery|payback)/i);
  assert.match(page, /aria-describedby="unitChartDescription unitChartExclusions"/);
});
