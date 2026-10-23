/* Iceworks Single-Machine Cost Illustration — Chart.js 4.5.1
 * Plain browser JavaScript, no tracking or network requests.
 * Cost-only: no revenue, earnings, payback, or financial performance claims.
 * MIT-licensed Chart.js UMD dependency loaded by the host page.
 */
(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(value);
  const compact = value => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  }).format(Math.abs(value));
  const defaults = window.ICEWORKS_UNIT_REFERENCES || {};
  const safeNumber = (value, fallback, max) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= max ? n : fallback;
  };
  const months = Math.round(safeNumber(defaults.illustrativeMonths, 108, 120)) || 108;
  const costAt = (month, equipmentCents, visitCents, visitsPerYear) => {
    const visits = Math.floor(month * visitsPerYear / 12 + 1e-8);
    const maintenanceCents = visits * visitCents;
    return {
      equipmentCents, visits, maintenanceCents,
      totalCents: equipmentCents + maintenanceCents
    };
  };
  const toDollars = cents => cents / 100;
  const initialNumber = (value, fallback, max) => safeNumber(value, fallback, max);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  // Data-driven progressive reveal: the actual scheduled PM steps are never smoothed.
  // Chart.js draws the real stepped dataset; its canvas is clipped left-to-right
  // using the same easeOutCubic progression as Chart.js' progressive easing samples.
  const inkPlugin = {
    id: "iceworksProgressiveInk",
    beforeDatasetsDraw(chart) {
      const a = chart.chartArea;
      if (!a) return;
      const t = Math.max(0, Math.min(1, chart.$iceProgress ?? 1));
      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(a.left - 3, a.top - 2, Math.max(1, (a.right - a.left + 6) * t), a.bottom - a.top + 4);
      ctx.clip();
    },
    afterDatasetsDraw(chart) {
      chart.ctx.restore();
    },
    afterDraw(chart) {
      const {ctx, chartArea: a, scales} = chart;
      if (!a || !scales.x || !scales.y) return;
      const t = chart.$iceProgress ?? 1;
      const x0 = scales.x.getPixelForValue(0);
      const zero = scales.y.getPixelForValue(0);
      const firstCost = chart.$iceInitialDollars ?? 0;
      const lower = scales.y.getPixelForValue(-firstCost);

      // Initial equipment purchase, shown as a true time-zero outlay.
      ctx.save();
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#D64C50";
      ctx.beginPath();
      ctx.moveTo(x0, zero);
      ctx.lineTo(x0, zero + (lower - zero) * Math.min(1, t * 9));
      ctx.stroke();
      if (t >= 0.12 && firstCost > 0) {
        ctx.fillStyle = "#D64C50";
        ctx.beginPath();
        ctx.arc(x0, lower, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // A single selected-month cursor, independent of the animated curve.
      const month = Math.max(0, Math.min(chart.$iceSelectedMonth ?? months, months));
      const cursor = scales.x.getPixelForValue(month);
      const progressEnd = a.left + (a.right - a.left) * t;
      if (t >= 1 || cursor <= progressEnd) {
        ctx.strokeStyle = "rgba(7, 50, 71, .32)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(cursor, a.top + 6);
        ctx.lineTo(cursor, a.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        const y = scales.y.getPixelForValue(chart.$iceSelectedValue ?? 0);
        ctx.shadowColor = "rgba(214,76,80,.19)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#D64C50";
        ctx.strokeStyle = "#f7f8f6";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cursor, y, 5.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  function init() {
    const requiredIds = [
      "unitCostInput", "unitPMInput", "unitPMFreq", "unitMonth",
      "unitMonthLabel", "unitCostEquipmentTotal", "unitCostPMTotal",
      "unitCostTotal", "unitCostCanvas", "unitChartFallback",
      "unitChartReplay", "unitChartValidation", "unitChartTooltip"
    ];
    if (!requiredIds.every(id => $(id))) return;
    const canvas = $("unitCostCanvas");
    const fallback = $("unitChartFallback");
    const replay = $("unitChartReplay");
    const validation = $("unitChartValidation");
    const tip = $("unitChartTooltip");
    const holder = $("unitChartCanvasWrap");
    const slider = $("unitMonth");
    const controls = [$("unitCostInput"), $("unitPMInput"), $("unitPMFreq")];

    const startEquipment = initialNumber(defaults.equipmentAndInstallation, 6154.79, 250000);
    const startPM = initialNumber(defaults.preventativeMaintenanceVisit, 250, 10000);
    const startFreq = Math.max(1, Math.min(4, Math.round(initialNumber(defaults.preventativeMaintenanceVisitsPerYear, 2, 4))));
    $("unitLeaseRef").textContent = money(initialNumber(defaults.monthlyLeaseRate, 245, 10000));
    $("unitEquipmentRef").textContent = money(startEquipment);
    $("unitPMRef").textContent = money(startPM);
    $("unitCostInput").value = startEquipment.toFixed(2);
    $("unitPMInput").value = startPM.toFixed(2);
    $("unitPMFreq").value = String(startFreq);
    slider.max = String(months);
    slider.value = String(months);
    $("unitHorizonLabel").textContent = "Month 0–" + months + " · one machine";
    $("unitReferenceDate").textContent = String(defaults.asOf || "October 2026");

    let selectedMonth = months;
    let latest = {equipmentCents: Math.round(startEquipment * 100), visitCents: Math.round(startPM * 100), freq: startFreq};
    let chart = null;
    let animatedOnce = false;
    let frame = 0;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;

    function parseCost(input, max) {
      const raw = input.value.trim();
      const valid = /^\d+(?:\.\d{1,2})?$/.test(raw) && Number(raw) <= max && Number.isFinite(Number(raw));
      input.setAttribute("aria-invalid", String(!valid));
      return valid ? Math.round(Number(raw) * 100) : null;
    }
    function readInputs() {
      const equipmentCents = parseCost($("unitCostInput"), 250000);
      const visitCents = parseCost($("unitPMInput"), 10000);
      const freq = Number($("unitPMFreq").value);
      const valid = equipmentCents !== null && visitCents !== null && [1,2,3,4].includes(freq);
      validation.hidden = valid;
      if (!valid) {
        validation.textContent = "Enter valid nonnegative dollar amounts (up to two decimals) and select 1–4 visits per year. The chart is showing the last valid assumptions.";
        return null;
      }
      validation.textContent = "";
      return {equipmentCents, visitCents, freq};
    }
    function makeSeries(v) {
      const points = [];
      for (let m = 0; m <= months; m++) {
        const c = costAt(m, v.equipmentCents, v.visitCents, v.freq);
        points.push({x: m, y: -toDollars(c.totalCents)});
      }
      return points;
    }
    function setSummary(values) {
      const current = costAt(selectedMonth, values.equipmentCents, values.visitCents, values.freq);
      $("unitMonthLabel").textContent = selectedMonth + " / " + months;
      $("unitCostEquipmentTotal").textContent = money(toDollars(current.equipmentCents));
      $("unitCostPMTotal").textContent = money(toDollars(current.maintenanceCents));
      $("unitCostTotal").textContent = money(toDollars(current.totalCents));
      $("unitCostEvents").textContent = current.visits + " scheduled maintenance " + (current.visits === 1 ? "visit" : "visits") + " through month " + selectedMonth + ".";
      if (chart) {
        chart.$iceSelectedMonth = selectedMonth;
        chart.$iceSelectedValue = -toDollars(current.totalCents);
        chart.draw();
      }
      return current;
    }
    function showTooltip() {
      if (!chart || !holder || !chart.chartArea || chart.$iceProgress < 0.99) return;
      const c = costAt(selectedMonth, latest.equipmentCents, latest.visitCents, latest.freq);
      $("unitTipMonth").textContent = "MONTH " + selectedMonth;
      $("unitTipTotal").textContent = money(toDollars(c.totalCents));
      $("unitTipEquipment").textContent = money(toDollars(c.equipmentCents));
      $("unitTipMaintenance").textContent = money(toDollars(c.maintenanceCents));
      tip.hidden = false;
      const x = chart.scales.x.getPixelForValue(selectedMonth);
      const left = Math.max(8, Math.min(holder.clientWidth - tip.offsetWidth - 8, x - tip.offsetWidth / 2));
      tip.style.left = left + "px";
      tip.style.top = Math.max(10, Math.min(holder.clientHeight - tip.offsetHeight - 8, chart.scales.y.getPixelForValue(-toDollars(c.totalCents)) - tip.offsetHeight - 20)) + "px";
    }
    function hideTooltip() { tip.hidden = true; }
    function setSelectedMonth(value, revealTip) {
      selectedMonth = Math.max(0, Math.min(months, Math.round(Number(value) || 0)));
      slider.value = String(selectedMonth);
      setSummary(latest);
      if (revealTip) showTooltip();
    }
    function errorFallback() {
      fallback.hidden = false;
      canvas.hidden = true;
      replay.disabled = true;
      replay.title = "Animation is unavailable. The cost figures above remain available.";
      if (holder) holder.setAttribute("aria-label", "Interactive graph unavailable; review the cost totals below.");
    }
    function stopFrame() { if (frame) window.cancelAnimationFrame(frame); frame = 0; }
    function play() {
      if (!chart) return;
      stopFrame();
      animatedOnce = true;
      hideTooltip();
      if (reduceMotion) {
        chart.$iceProgress = 1;
        chart.draw();
        return;
      }
      chart.$iceProgress = 0;
      const duration = 2800;
      let start = null;
      const tick = now => {
        if (start === null) start = now;
        chart.$iceProgress = easeOutCubic(Math.min(1, (now - start) / duration));
        chart.draw();
        if (now - start < duration) {
          frame = window.requestAnimationFrame(tick);
        } else {
          chart.$iceProgress = 1;
          chart.draw();
          frame = 0;
        }
      };
      frame = window.requestAnimationFrame(tick);
    }

    latest = readInputs() || latest;
    setSummary(latest);
    if (typeof window.Chart !== "function") {
      errorFallback();
      controls.forEach(el => el.addEventListener("input", () => {
        const next = readInputs();
        if (next) {latest = next; setSummary(latest)}
      }));
      slider.addEventListener("input", () => setSelectedMonth(slider.value, false));
      return;
    }
    try {
      const maxCost = toDollars(costAt(months, latest.equipmentCents, latest.visitCents, latest.freq).totalCents);
      const yFloor = -Math.max(100, Math.ceil((maxCost * 1.14) / 500) * 500);
      const series = makeSeries(latest);
      chart = new window.Chart(canvas, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Soft outlay highlight",
              data: series,
              parsing: false, stepped: "after", tension: 0,
              pointRadius: 0, pointHoverRadius: 0,
              borderColor: "rgba(214,76,80,.15)", borderWidth: 10,
              fill: false
            },
            {
              label: "Cumulative direct costs",
              data: series,
              parsing: false, stepped: "after", tension: 0,
              pointRadius: 0, pointHoverRadius: 0,
              borderColor: "#D64C50", borderWidth: 3.25,
              fill: {target: "origin", above: "rgba(214,76,80,.075)", below: "rgba(214,76,80,.075)"}
            }
          ]
        },
        plugins: [inkPlugin],
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: false,
          events: ["mousemove", "mouseout", "click", "touchstart"],
          onHover: (event) => {
            if (!chart || chart.$iceProgress < 0.99 || typeof event.x !== "number") return;
            setSelectedMonth(chart.scales.x.getValueForPixel(event.x), true);
          },
          onClick: (event) => {
            if (!chart || typeof event.x !== "number") return;
            setSelectedMonth(chart.scales.x.getValueForPixel(event.x), true);
          },
          layout: {padding: {top: 17, right: 15, bottom: 4, left: 4}},
          interaction: {mode: "nearest", intersect: false, axis: "x"},
          elements: {line: {borderJoinStyle: "round", borderCapStyle: "round"}},
          plugins: {
            legend: {display: false},
            tooltip: {enabled: false},
            filler: {propagate: false}
          },
          scales: {
            x: {
              type: "linear", min: 0, max: months,
              border: {display: false},
              grid: {display: false},
              ticks: {
                color: "#496979", maxTicksLimit: 10, stepSize: 12, font: {size: 11, weight: "600"},
                callback(value) {return value === 0 ? "START" : (Number.isInteger(value / 12) ? "YEAR " + value / 12 : "");}
              }
            },
            y: {
              min: yFloor, max: 0,
              border: {display: false},
              grid: {color: "rgba(11,64,84,.13)", tickLength: 0, drawTicks: false},
              ticks: {
                color: "#496979", padding: 12, maxTicksLimit: 6,
                font: {size: 11},
                callback(value) {return Number(value) === 0 ? "$0" : "−" + compact(value);}
              }
            }
          }
        }
      });
      chart.$iceInitialDollars = toDollars(latest.equipmentCents);
      chart.$iceSelectedMonth = selectedMonth;
      chart.$iceSelectedValue = -toDollars(costAt(selectedMonth, latest.equipmentCents, latest.visitCents, latest.freq).totalCents);
      chart.$iceProgress = 0;
      chart.draw();
    } catch (error) {
      console.warn("Iceworks chart failed to initialize; the numeric cost illustration is still available.", error);
      errorFallback();
      chart = null;
    }

    controls.forEach(control => control.addEventListener("input", () => {
      const next = readInputs();
      if (!next) return;
      latest = next;
      hideTooltip();
      if (chart) {
        stopFrame();
        chart.$iceInitialDollars = toDollars(next.equipmentCents);
        const series = makeSeries(next);
        chart.data.datasets.forEach(dataset => {dataset.data = series});
        const total = toDollars(costAt(months, next.equipmentCents, next.visitCents, next.freq).totalCents);
        chart.options.scales.y.min = -Math.max(100, Math.ceil(total * 1.14 / 500) * 500);
        chart.$iceProgress = 1;
        chart.update("none");
      }
      setSummary(latest);
    }));
    slider.addEventListener("input", () => setSelectedMonth(slider.value, true));
    replay.addEventListener("click", play);
    canvas.addEventListener("mouseleave", hideTooltip);
    canvas.addEventListener("touchend", () => { /* retain tooltip until another selection */ }, {passive:true});

    if (!chart) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      play();
    } else {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting && !animatedOnce)) {
          observer.disconnect();
          play();
        }
      }, {threshold: 0.16});
      observer.observe(holder);
    }
  }

  window.IceworksCostChart = Object.freeze({init, costAt});
}());