/* Iceworks Capital Recovery Design Review (internal prototype only)
 * This is fictional design-test arithmetic, not an Iceworks forecast.
 * Do not enable this visual on the public prospect page without updated
 * FDD Item 19 disclosure, written substantiation, and franchise-counsel signoff.
 * All inputs remain in browser memory. No persistence or uploads.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ready = () => {
    const root = $('recPreview');
    if (!root) return;
    const ids = ['recCapital','recContribution','recPM','recFreq','recPaid','recReplay','recMonth',
      'recOutlay','recMonthly','recCrossing','recSelected','recMonthLabel','recWarning',
      'recCanvas','recFallback','recTip','recTipMonth','recTipValue','recGraph'];
    if (ids.some(id => !$(id))) return;

    const money = n => new Intl.NumberFormat('en-US', {
      style:'currency', currency:'USD', maximumFractionDigits:2
    }).format(n);
    const toCents = n => Math.round(n*100);
    const months = 108;
    let chart = null, data = [], pieces = [], state = null, progress = 1,
      frame = 0, selected = 48, started = false;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const warning = $('recWarning');

    function inputs() {
      const specs = [
        ['recCapital',0,250000], ['recContribution',0,100000],
        ['recPM',0,10000], ['recPaid',0,108]
      ];
      const numbers = {};
      let valid = true;
      for (const [id,min,max] of specs) {
        const el = $(id), raw = el.value.trim();
        const value = Number(raw);
        const okay = raw !== '' && Number.isFinite(value) && value >= min && value <= max &&
          /^\d+(?:\.\d{1,2})?$/.test(raw) &&
          (id !== 'recPaid' || Number.isInteger(value));
        el.setAttribute('aria-invalid', String(!okay));
        if (!okay) valid = false;
        numbers[id] = value;
      }
      const freq = Number($('recFreq').value);
      if (![1,2,3,4].includes(freq)) valid = false;
      warning.hidden = valid;
      return valid ? {
        capital:toCents(numbers.recCapital),
        contribution:toCents(numbers.recContribution),
        maintenance:toCents(numbers.recPM),
        paidMonths:numbers.recPaid,
        visits:freq
      } : null;
    }

    // The fictional machine stops producing contribution AND scheduled PM expense
    // after the hypothetical active period. This is a visual design assumption,
    // not a conclusion about customer retention, removal costs, or asset life.
    function atMonth(m,s) {
      const active = Math.min(m,s.paidMonths);
      const visits = Math.floor(active*s.visits/12 + 1e-8);
      return -s.capital + active*s.contribution - visits*s.maintenance;
    }

    function series(s) {
      const points = [];
      for (let m = 0; m <= months; m++) points.push({x:m,y:atMonth(m,s)/100});
      return points;
    }

    function withCrossovers(points) {
      const out = [points[0]];
      for (let i = 1; i < points.length; i++) {
        const prev = points[i-1], next = points[i];
        if ((prev.y<0 && next.y>0) || (prev.y>0 && next.y<0)) {
          out.push({x:prev.x + (-prev.y)/(next.y-prev.y), y:0});
        }
        out.push(next);
      }
      return out;
    }

    function firstCrossing(points) {
      for (let i=1; i<points.length; i++) {
        if (points[i-1].y < 0 && points[i].y >= 0) {
          const a=points[i-1], b=points[i];
          return a.x + (-a.y)/(b.y-a.y);
        }
      }
      return null;
    }

    function renderSummary() {
      if (!state || !data.length) return;
      $('recOutlay').textContent = money(state.capital/100);
      $('recMonthly').textContent = money(state.contribution/100);
      const crossing = firstCrossing(data);
      $('recCrossing').textContent = crossing === null
        ? 'Not within 108 months'
        : 'Month '+crossing.toFixed(1);
      $('recSelected').textContent = money(data[selected].y);
      $('recMonthLabel').textContent = String(selected);
    }

    function pointerSelection(pos) {
      if (!chart || progress < 0.98 || !Number.isFinite(pos)) return;
      const selectedMonth = Math.max(0,Math.min(months,
        Math.round(chart.scales.x.getValueForPixel(pos))));
      selected = selectedMonth;
      $('recMonth').value = String(selected);
      renderSummary();
      chart.draw();
      showTip();
    }

    function showTip() {
      if (!chart) return;
      const tip = $('recTip');
      $('recTipMonth').textContent = 'MONTH '+selected;
      $('recTipValue').textContent = money(data[selected].y);
      tip.hidden = false;
      const wrap = $('recGraph');
      const x = chart.scales.x.getPixelForValue(selected);
      tip.style.left = Math.max(110,Math.min(wrap.clientWidth-110,x))+'px';
      tip.style.top = '8px';
    }

    const progressive = {
      id:'iceworksRecoveryReview',
      beforeDatasetsDraw(c) {
        if (!c.chartArea) return;
        const a=c.chartArea,ctx=c.ctx;
        ctx.save();ctx.beginPath();
        ctx.rect(a.left-3,a.top-5,
          Math.max(1,(a.right-a.left+6)*progress),a.bottom-a.top+10);
        ctx.clip();
      },
      afterDatasetsDraw(c) {if(c.chartArea) c.ctx.restore();},
      afterDraw(c) {
        if (!c.chartArea || !state) return;
        const ctx=c.ctx,a=c.chartArea;
        const x=c.scales.x.getPixelForValue(0),
          yZero=c.scales.y.getPixelForValue(0),
          yInitial=c.scales.y.getPixelForValue(-state.capital/100);
        ctx.save();
        ctx.strokeStyle='#d64c50';ctx.lineWidth=3.7;
        ctx.beginPath();ctx.moveTo(x,yZero);
        ctx.lineTo(x,yZero+(yInitial-yZero)*Math.min(1,progress*11));
        ctx.stroke();
        if(progress>=0.99) {
          const cx=c.scales.x.getPixelForValue(selected);
          const cy=c.scales.y.getPixelForValue(data[selected].y);
          ctx.strokeStyle='rgba(8,47,67,.25)';
          ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();
          ctx.moveTo(cx,a.top);ctx.lineTo(cx,a.bottom);ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();ctx.arc(cx,cy,5.5,0,Math.PI*2);
          ctx.fillStyle=data[selected].y>=0?'#09b7a5':'#d64c50';
          ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
        }
        ctx.restore();
      }
    };

    function draw() {
      if (!state) return;
      if (typeof window.Chart !== 'function') {
        $('recFallback').hidden=false;
        $('recCanvas').hidden=true;
        $('recReplay').disabled=true;
        return;
      }
      $('recCanvas').hidden=false;
      $('recFallback').hidden=true;
      $('recReplay').disabled=false;
      if(chart) chart.destroy();
      const max = Math.max(100, ...data.map(p=>Math.abs(p.y)));
      const bound = Math.ceil(max*1.14/1000)*1000;
      const red = pieces.map(p=>({x:p.x,y:p.y<=0?p.y:null}));
      const teal = pieces.map(p=>({x:p.x,y:p.y>=0?p.y:null}));
      try {
        chart=new window.Chart($('recCanvas'), {
          type:'line',
          data:{datasets:[
            {data:red,parsing:false,spanGaps:false,pointRadius:0,
              borderColor:'#d64c50',borderWidth:3.7,tension:0.16,
              backgroundColor:'rgba(214,76,80,.09)',fill:'origin'},
            {data:teal,parsing:false,spanGaps:false,pointRadius:0,
              borderColor:'#09b7a5',borderWidth:3.7,tension:0.16,
              backgroundColor:'rgba(9,183,165,.11)',fill:'origin'}
          ]},
          plugins:[progressive],
          options:{
            maintainAspectRatio:false,responsive:true,animation:false,
            plugins:{legend:{display:false},tooltip:{enabled:false}},
            scales:{
              x:{type:'linear',min:0,max:months,border:{display:false},
                grid:{display:false},ticks:{color:'#557483',stepSize:12,
                  callback(v){return v===0?'START':v%12===0?'YEAR '+v/12:''}}},
              y:{min:-bound,max:bound,border:{display:false},
                grid:{
                  color(c){return c.tick.value===0?'rgba(8,47,67,.35)':'rgba(8,47,67,.08)'},
                  lineWidth(c){return c.tick.value===0?1.6:1}
                },ticks:{color:'#557483',maxTicksLimit:7,callback(v){return money(v)}}}
            },
            onHover(ev) {if(typeof ev.x==='number')pointerSelection(ev.x);},
            onClick(ev) {if(typeof ev.x==='number')pointerSelection(ev.x);}
          }
        });
      } catch(e) {
        console.warn('Recovery prototype chart unavailable', e);
        $('recFallback').hidden=false;
        $('recCanvas').hidden=true;
        $('recReplay').disabled=true;
        chart=null;
      }
    }

    function replay() {
      if (frame) cancelAnimationFrame(frame);
      frame=0;
      $('recTip').hidden=true;
      if (!chart) return;
      if (reduceMotion) {progress=1;chart.draw();return;}
      progress=0;
      const begin=performance.now();
      const duration=2900;
      const tick=now=>{
        const t=Math.min(1,(now-begin)/duration);
        progress=1-Math.pow(1-t,3);
        chart.draw();
        if(t<1) frame=requestAnimationFrame(tick);
        else {progress=1;frame=0;chart.draw();}
      };
      frame=requestAnimationFrame(tick);
    }

    function update() {
      const next=inputs();
      if(!next) return;
      state=next;
      data=series(state);
      pieces=withCrossovers(data);
      $('recTip').hidden=true;
      renderSummary();
      draw();
      replay();
    }

    $('recReplay').addEventListener('click',replay);
    for (const id of ['recCapital','recContribution','recPM','recFreq','recPaid'])
      $(id).addEventListener('input',update);
    $('recMonth').addEventListener('input',()=>{
      selected=Number($('recMonth').value);
      renderSummary();
      chart?.draw();
    });
    $('recCanvas').addEventListener('mouseleave',()=>{$('recTip').hidden=true;});
    update();
    started=true;
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
