// <nayam-num value="1234.5" decimals="1" prefix="$" suffix="/mo" trend="0|auto"> — NumberFlow-style animated number (mockup).
// Timings follow NumberFlow's customization defaults: transform/spin 900ms spring easing, opacity 450ms ease-out,
// 0.25em / 0.5em edge fade masks, tabular-nums, trend-aware digit spin, FLIP for width changes, reduced-motion respected.
// Production: use @number-flow/react with the same transformTiming / opacityTiming.
(function () {
  if (customElements.get('nayam-num')) return;
  const RMq = matchMedia('(prefers-reduced-motion: reduce)');
  const spring = (dur = .9, w = 7.5) => { const k = 40, p = []; for (let i = 0; i <= k; i++) { const t = dur * i / k; p.push((1 - Math.exp(-w * t) * (1 + w * t)).toFixed(4)); } p[k] = 1; return 'linear(' + p.join(',') + ')'; };
  const T = { transform: { duration: 900, easing: spring(), fill: 'both' }, opacity: { duration: 450, easing: 'ease-out', fill: 'both' } };
  const LH = 'calc(var(--nf-lh,1) * 1em)';
  const isD = c => c >= '0' && c <= '9';
  class NayamNum extends HTMLElement {
    static get observedAttributes() { return ['value']; }
    connectedCallback() {
      if (this._init) return; this._init = 1; this._chars = new Map();
      const s = this.style;
      s.display = 'inline-flex'; s.position = 'relative'; s.overflow = 'hidden'; s.verticalAlign = 'baseline'; s.whiteSpace = 'pre';
      s.fontVariantNumeric = 'tabular-nums'; s.lineHeight = LH; s.padding = '0 .5em'; s.margin = '0 -.5em';
      const m = 'linear-gradient(to right,transparent,#000 .5em,#000 calc(100% - .5em),transparent)';
      s.webkitMaskImage = m; s.maskImage = m; 
      this.update(false);
      if (this.hasAttribute('from')) { const to = this.getAttribute('value'); this.removeAttribute('from'); this._ov = this.fmt().replace(/\d/g, '0'); this.update(false); setTimeout(() => { this._ov = null; this.update(true); }, 150); }
    }
    attributeChangedCallback() { if (this._init) this.update(true); }
    fmt() { if (this._ov) return this._ov; const d = +(this.getAttribute('decimals') || 0), v = +this.getAttribute('value') || 0; return (this.getAttribute('prefix') || '') + v.toLocaleString(this.getAttribute('locale') || 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + (this.getAttribute('suffix') || ''); }
    tokens(s) {
      let f = -1, l = -1; for (let i = 0; i < s.length; i++) if (isD(s[i])) { if (f < 0) f = i; l = i; }
      const dec = +(this.getAttribute('decimals') || 0), dp = dec ? s.indexOf('.', f) : l + 1;
      return [...s].map((ch, i) => ({ ch, key: i < f ? 'p' + i : i > l ? 'x' + (s.length - i) : (isD(ch) ? 'd' : 'c') + (dp - i) }));
    }
    mk(t) {
      const el = document.createElement('span'); el.style.cssText = 'display:inline-block;position:relative;height:' + LH;
      if (isD(t.ch)) { const col = document.createElement('span'); col.style.cssText = 'display:flex;flex-direction:column;will-change:transform'; el.appendChild(col); el._col = col; }
      else el.textContent = t.ch;
      el.setAttribute('aria-hidden', 'true'); return el;
    }
    still(el, n) { el._col.getAnimations().forEach(a => a.cancel()); el._col.style.transform = ''; el._col.innerHTML = '<span style="display:block;height:' + LH + '">' + n + '</span>'; el._n = n; }
    spin(el, o, n, dir, anim) {
      if (!anim || o == null || o === n || RMq.matches) return this.still(el, n);
      const col = el._col, lh = parseFloat(getComputedStyle(el).height) || 1;
      let cur = o;
      if (col.getAnimations().length) { const m = new DOMMatrix(getComputedStyle(col).transform); cur = -m.m42 / lh; cur = ((cur % 10) + 10) % 10; }
      const up = dir > 0 || (dir === 0 && n > o), a = cur + 10, b = up ? (n >= cur ? n : n + 10) + 10 : (n <= cur ? n : n - 10) + 10;
      col.getAnimations().forEach(x => x.cancel());
      col.innerHTML = Array.from({ length: 30 }, (_, i) => '<span style="display:block;height:' + LH + '">' + (i % 10) + '</span>').join('');
      const at = k => 'translateY(calc(' + (-k) + ' * ' + LH + '))';
      const an = col.animate([{ transform: at(a) }, { transform: at(b) }], T.transform); el._n = n;
      an.finished.then(() => { if (el._n === n && col.getAnimations().length <= 1) this.still(el, n); }).catch(() => {});
    }
    update(anim) {
      const s = this.fmt(); if (s === this._s && this._chars.size) return;
      const first = this._s == null, animate = anim && !first && !RMq.matches && this.getAttribute('animated') !== 'false';
      const nv = +this.getAttribute('value') || 0, tr = this.getAttribute('trend'), dirAll = tr === '0' ? 0 : tr != null && tr !== 'auto' ? +tr : Math.sign(nv - (this._v ?? nv));
      this._s = s; this._v = nv; this.setAttribute('role', 'img'); this.setAttribute('aria-label', s);
      const hr = this.getBoundingClientRect(), old = new Map();
      if (animate) this._chars.forEach((c, k) => old.set(k, c.el.getBoundingClientRect().left));
      const prev = this._chars, next = new Map(), toks = this.tokens(s), frag = [];
      toks.forEach(t => {
        let c = prev.get(t.key); const isDig = isD(t.ch);
        if (c && (isDig === !!c.el._col)) { prev.delete(t.key); if (!isDig && c.ch !== t.ch) c.el.textContent = t.ch; }
        else { c = { el: this.mk(t), ch: null, fresh: true }; }
        c.prevCh = c.ch; c.ch = t.ch; next.set(t.key, c); frag.push(c);
      });
      prev.forEach(c => { c.el.getAnimations().forEach(a => a.cancel()); });
      const leaving = [...prev.entries()];
      this.replaceChildren(...frag.map(c => c.el));
      this._chars = next;
      next.forEach((c, k) => {
        const isDig = isD(c.ch);
        if (isDig) this.spin(c.el, c.fresh ? null : +c.prevCh, +c.ch, dirAll, animate && !c.fresh);
        if (!animate) return;
        if (c.fresh) c.el.animate([{ opacity: 0 }, { opacity: 1 }], T.opacity);
      });
      next.forEach(c => { c.fresh = false; });
      if (animate) leaving.forEach(([k, c]) => {
        const x = (old.get(k) ?? 0) - hr.left; c.el.style.cssText += ';position:absolute;top:0;left:' + x + 'px'; this.appendChild(c.el);
        c.el.animate([{ opacity: 1 }, { opacity: 0 }], T.opacity).finished.then(() => c.el.remove()).catch(() => c.el.remove());
      });
    }
  }
  customElements.define('nayam-num', NayamNum);
})();
