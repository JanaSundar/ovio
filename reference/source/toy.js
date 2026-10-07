// Ovio — Toy world physics (mockup). Production: Motion for React (useSpring / drag / dragConstraints / dragElastic).
// Delegated behaviours via data-toy:
//   press  — raised key: hover lifts, press compresses into its surface, release springs back. data-depth, data-shadow.
//   drag   — object follows the pointer with weight, then resists and returns to its seat.
//   knob   — rotary control: vertical/horizontal drag, rotational inertia, snaps to data-steps ticks. Emits "toychange".
(function () {
  if (window.NayamToy) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = { press: [900, 22], drag: [240, 14], knob: [95, 22] };
  const M = new WeakMap();
  const S = el => {
    let s = M.get(el);
    if (!s) { const a = +(el.dataset.angle || 0); s = { y: [0, 0, 0], x: [0, 0, 0], dy: [0, 0, 0], r: [a, 0, a], raf: 0, hover: false, down: false }; M.set(el, s); }
    return s;
  };
  function paint(el, s) {
    const k = el.dataset.toy;
    if (k === 'press') {
      const d = +(el.dataset.depth || 6), lift = Math.max(0, d - s.y[0]);
      el.style.transform = `translateY(${s.y[0].toFixed(2)}px)`;
      el.style.boxShadow = `0 ${lift.toFixed(2)}px 0 ${el.dataset.shadow || 'rgba(0,0,0,.25)'},0 ${(lift * 1.4 + 3).toFixed(1)}px ${(lift * 1.6 + 6).toFixed(1)}px -5px rgba(40,28,10,.32)`;
    } else if (k === 'drag') {
      const tilt = Math.max(-14, Math.min(14, s.x[1] * 0.014));
      el.style.transform = `translate(${s.x[0].toFixed(1)}px,${s.dy[0].toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scale(${s.down ? 1.06 : 1})`;
      el.style.zIndex = s.down || Math.abs(s.x[0]) + Math.abs(s.dy[0]) > 1 ? 20 : '';
    } else if (k === 'knob') {
      const kv = knobVal(el), ang = Math.max(kv.min - 8, Math.min(kv.max + 8, s.r[0]));
      (el.querySelector('[data-cap]') || el).style.transform = `rotate(${ang.toFixed(2)}deg)`;
      if (s.down || s.glide) emitIdx(el, Math.round((Math.max(kv.min, Math.min(kv.max, s.r[0])) - kv.min) / kv.span));
    }
  }
  function run(el) {
    const s = S(el); if (s.raf) return; let last = performance.now();
    const [k, c] = K[el.dataset.toy] || K.press;
    const tick = t => {
      const dt = Math.min(0.032, (t - last) / 1000); last = t; let moving = false;
      for (const key of ['y', 'x', 'dy', 'r']) {
        const a = s[key]; a[1] += (-k * (a[0] - a[2]) - c * a[1]) * dt; a[0] += a[1] * dt;
        if (Math.abs(a[1]) > 0.02 || Math.abs(a[0] - a[2]) > 0.02) moving = true; else { a[0] = a[2]; a[1] = 0; }
      }
      paint(el, s); s.raf = moving ? requestAnimationFrame(tick) : 0;
    };
    s.raf = requestAnimationFrame(tick);
  }
  function to(el, key, target, kick) {
    const s = S(el); s[key][2] = target; if (kick) s[key][1] += kick;
    if (RM) { s[key][0] = target; s[key][1] = 0; paint(el, s); return; }
    run(el);
  }
  const knobVal = el => { const st = +(el.dataset.steps || 11), min = +(el.dataset.min || -135), max = +(el.dataset.max || 135); return { st, min, max, span: (max - min) / (st - 1) }; };
  function emitIdx(el, idx) { if (el._idx !== idx) { el._idx = idx; el.setAttribute('aria-valuenow', idx); el.dispatchEvent(new CustomEvent('toychange', { bubbles: true, detail: { value: idx } })); } }
  function knobSet(el, idx, kick) {
    const { st, min, span } = knobVal(el); idx = Math.max(0, Math.min(st - 1, idx)); S(el).glide = false;
    to(el, 'r', min + idx * span, kick); emitIdx(el, idx);
  }
  const find = e => e.target.closest && e.target.closest('[data-toy]');
  document.addEventListener('pointerover', e => { const el = find(e); if (!el || el.dataset.toy !== 'press' || el.contains(e.relatedTarget)) return; const s = S(el); s.hover = true; if (!s.down) to(el, 'y', -2); });
  document.addEventListener('pointerout', e => { const el = find(e); if (!el || el.dataset.toy !== 'press' || el.contains(e.relatedTarget)) return; const s = S(el); s.hover = false; if (!s.down) to(el, 'y', 0); });
  document.addEventListener('pointerdown', e => {
    const el = find(e); if (!el) return; const s = S(el); s.down = true; s.px = e.clientX; s.py = e.clientY; s.lt = performance.now(); s.vx = 0; s.vy = 0;
    if (el.dataset.toy === 'press') to(el, 'y', +(el.dataset.depth || 6) - 1);
    if (el.dataset.toy === 'knob') { const b = el.getBoundingClientRect(); s.cx = b.left + b.width / 2; s.cy = b.top + b.height / 2; s.pa = Math.atan2(e.clientY - s.cy, e.clientX - s.cx) * 180 / Math.PI; s.acc = 0; s.av = 0; }
    if (el.dataset.toy === 'drag' || el.dataset.toy === 'knob') { s.r0 = s.r[2]; el.setPointerCapture && el.setPointerCapture(e.pointerId); e.preventDefault(); }
    const move = ev => {
      const now = performance.now(), dt = Math.max(1, now - s.lt);
      s.vx = (ev.clientX - (s.lx ?? s.px)) / dt * 1000; s.vy = (ev.clientY - (s.ly ?? s.py)) / dt * 1000; s.lx = ev.clientX; s.ly = ev.clientY; s.lt = now;
      const dx = ev.clientX - s.px, dy = ev.clientY - s.py;
      if (el.dataset.toy === 'drag') { const r = d => d * 0.9 / (1 + Math.abs(d) / 600); to(el, 'x', r(dx)); to(el, 'dy', r(dy)); }
      if (el.dataset.toy === 'knob') { const { min, max } = knobVal(el); const ang = Math.atan2(ev.clientY - s.cy, ev.clientX - s.cx) * 180 / Math.PI; let da = ang - s.pa; if (da > 180) da -= 360; if (da < -180) da += 360; s.pa = ang; s.acc += da; s.av = s.av * .6 + (da / dt * 1000) * .4; const raw = s.r0 + s.acc, over = raw < min ? raw - min : raw > max ? raw - max : 0; if (over) s.acc -= over; const a = over ? (over > 0 ? max : min) + 8 * Math.tanh(over / 40) : raw; s.glide = false; to(el, 'r', a); }
};
    const up = () => {
      s.down = false; removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      if (el.dataset.toy === 'press') to(el, 'y', s.hover ? -2 : 0, -80);
      if (el.dataset.toy === 'drag') { to(el, 'x', 0, s.vx * 0.2); to(el, 'dy', 0, s.vy * 0.2); }
      if (el.dataset.toy === 'knob') { const { st, min, max, span } = knobVal(el); const fresh = performance.now() - s.lt < 90; let rest = s.r[0] + (fresh ? s.av : 0) * 0.28; rest = Math.max(min, Math.min(max, rest)); if (st <= 26) rest = min + Math.round((rest - min) / span) * span; s.glide = true; to(el, 'r', rest); }
      s.lx = s.ly = undefined;
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  });
  document.addEventListener('keydown', e => {
    const el = find(e); if (!el) return;
    if (el.dataset.toy === 'press' && (e.key === ' ' || e.key === 'Enter') && !e.repeat) { S(el).down = true; to(el, 'y', +(el.dataset.depth || 6) - 1); }
    if (el.dataset.toy === 'knob') { const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); knobSet(el, (el._idx ?? +(el.getAttribute('aria-valuenow') || 0)) + d, d * 300); } }
  });
  document.addEventListener('keyup', e => { const el = find(e); if (el && el.dataset.toy === 'press' && (e.key === ' ' || e.key === 'Enter')) { S(el).down = false; to(el, 'y', 0, -80); } });
  function spring(o) {
    // o: { from, to, v, k, c, onStep(x, v), onDone } — returns cancel fn
    let x = o.from, v = o.v || 0, last = performance.now(), raf = 0, k = o.k || 380, c = o.c || 22;
    if (RM) { o.onStep(o.to, 0); o.onDone && o.onDone(); return () => {}; }
    const tick = t => { const dt = Math.min(0.032, (t - last) / 1000); last = t; v += (-k * (x - o.to) - c * v) * dt; x += v * dt;
      if (Math.abs(v) < 0.002 && Math.abs(x - o.to) < 0.002) { o.onStep(o.to, 0); o.onDone && o.onDone(); return; } o.onStep(x, v); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }
  window.NayamToy = { RM, spring, knobSet };
})();
