/* ============================================================
   fx.js — Effetti cinematici (si aggancia al motore di main.js)
   ============================================================ */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- 1. Transizione fra pagine ---------- */
  function pageTransition() {
    var pt = document.createElement('div');
    pt.className = 'pt';
    pt.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    document.body.appendChild(pt);

    if (!reduce) {
      // entrata: i pannelli sono giù, si ritirano
      pt.classList.add('in');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          pt.classList.remove('in'); pt.classList.add('out');
          setTimeout(function () { pt.classList.remove('out'); }, 1100);
        });
      });
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || reduce) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || a.target === '_blank' ||
          /^(mailto:|tel:|https?:\/\/|\/\/)/.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      pt.classList.remove('out'); pt.classList.add('in');
      setTimeout(function () { window.location.href = href; }, 640);
    });
  }

  /* ---------- 2. Scramble del testo ---------- */
  var GLYPHS = '▚▞█▛▟◤◥01<>/\\{}[]#*+—ABCDEFGHILMNOPQRSTUVZ';
  function scrambleEl(el) {
    if (el.__scr) return; el.__scr = 1;
    var nodes = [];
    (function walk(n) {
      for (var i = 0; i < n.childNodes.length; i++) {
        var c = n.childNodes[i];
        if (c.nodeType === 3 && c.nodeValue.trim()) nodes.push(c);
        else if (c.nodeType === 1) walk(c);
      }
    })(el);
    if (!nodes.length) return;
    var orig = nodes.map(function (n) { return n.nodeValue; });
    var total = orig.reduce(function (a, s) { return a + s.length; }, 0);
    var t0 = null, DUR = 620 + total * 16;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = clamp((ts - t0) / DUR, 0, 1);
      var eased = 1 - Math.pow(1 - p, 2.4);
      var done = Math.floor(eased * total), seen = 0;
      for (var i = 0; i < nodes.length; i++) {
        var s = orig[i], out = '';
        for (var j = 0; j < s.length; j++) {
          var g = seen + j;
          if (g < done || s[j] === ' ') out += s[j];
          else if (g < done + 9) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          else out += ' ';
        }
        nodes[i].nodeValue = out; seen += s.length;
      }
      if (p < 1) requestAnimationFrame(step);
      else for (var k = 0; k < nodes.length; k++) nodes[k].nodeValue = orig[k];
    }
    requestAnimationFrame(step);
  }
  function initScramble() {
    var els = $$('[data-scramble]');
    if (!els.length) return;
    if (reduce) return;
    els.forEach(function (e) { e.classList.add('scr'); });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        scrambleEl(x.target); io.unobserve(x.target);
      });
    }, { threshold: .25, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) scrambleEl(e); else io.observe(e);
    });
  }

  /* ---------- 3. Spotlight ---------- */
  function initSpot() {
    if (coarse || reduce) return;
    var s = document.createElement('div'); s.className = 'spot';
    document.body.appendChild(s);
    var tx = 50, ty = 40, cx = 50, cy = 40;
    addEventListener('pointermove', function (e) {
      tx = e.clientX / innerWidth * 100; ty = e.clientY / innerHeight * 100;
    }, { passive: true });
    (function loop() {
      requestAnimationFrame(loop);
      cx = lerp(cx, tx, .07); cy = lerp(cy, ty, .07);
      s.style.setProperty('--sx', cx.toFixed(2) + '%');
      s.style.setProperty('--sy', cy.toFixed(2) + '%');
    })();
  }

  /* ---------- 4. Glare sulle card ---------- */
  function initGlare() {
    if (coarse) return;
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.track, .card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      c.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ---------- 5. Lettere dell'hero ---------- */
  function initHeroLetters() {
    var lines = $$('.hero-title .ln > span');
    if (!lines.length || reduce) return;
    lines.forEach(function (span, li) {
      var txt = span.textContent, cls = span.className;
      var html = '';
      for (var i = 0; i < txt.length; i++) {
        var ch = txt[i] === ' ' ? '&nbsp;' : txt[i];
        html += '<em style="display:inline-block;font-style:normal;transform:translateY(110%) rotate(6deg);opacity:0;' +
                'transition:transform 1.05s cubic-bezier(.16,1,.3,1) ' + (li * .18 + i * .045).toFixed(3) + 's,' +
                'opacity .7s ' + (li * .18 + i * .045).toFixed(3) + 's">' + ch + '</em>';
      }
      span.innerHTML = html;
      span.className = cls;
    });
    function play() {
      $$('.hero-title .ln > span em').forEach(function (em) {
        em.style.transform = 'none'; em.style.opacity = '1';
      });
    }
    if (document.body.classList.contains('ready')) play();
    else {
      var t = setInterval(function () {
        if (document.body.classList.contains('ready')) { clearInterval(t); setTimeout(play, 60); }
      }, 80);
      setTimeout(function () { clearInterval(t); play(); }, 7000);
    }
  }

  /* ---------- 6. Galleria orizzontale ancorata ---------- */
  function initPin() {
    var pin = $('.pin'); if (!pin) return;
    var track = $('.pin-track', pin), bar = $('.pin-bar i', pin);
    if (!track) return;
    var small = matchMedia('(max-width:760px)');
    var maxX = 0;
    function measure() {
      if (small.matches) { pin.style.height = ''; track.style.transform = ''; return; }
      maxX = Math.max(0, track.scrollWidth - innerWidth + 32);
      pin.style.height = (innerHeight + maxX * 1.15) + 'px';
    }
    measure();
    addEventListener('resize', measure);
    var cur = 0;
    (function loop() {
      requestAnimationFrame(loop);
      if (small.matches) return;
      var r = pin.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, pin.offsetHeight - innerHeight), 0, 1);
      cur = lerp(cur, p * maxX, .12);
      track.style.transform = 'translate3d(' + (-cur).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    })();
  }

  /* ---------- 7. Skew di velocità ---------- */
  function initSkew() {
    var els = $$('[data-skew]');
    if (!els.length || reduce || coarse) return;
    var last = scrollY, v = 0;
    (function loop() {
      requestAnimationFrame(loop);
      var d = scrollY - last; last = scrollY;
      v = lerp(v, clamp(d * .055, -1.4, 1.4), .16);
      if (Math.abs(v) < .006) v = 0;
      var s = 'skewY(' + v.toFixed(3) + 'deg)';
      for (var i = 0; i < els.length; i++) els[i].style.transform = s;
    })();
  }

  /* ---------- 8. Vinile dell'hero: gira con lo scroll ---------- */
  function initVinyl() {
    var d = $('.hv-disc'); if (!d || reduce) return;
    var extra = 0, tgt = 0, last = scrollY;
    (function loop() {
      requestAnimationFrame(loop);
      tgt += (scrollY - last) * .28; last = scrollY;
      extra = lerp(extra, tgt, .1);
      d.style.animationDuration = '7s';
      d.style.setProperty('--extra', extra.toFixed(1) + 'deg');
      d.style.rotate = extra.toFixed(1) + 'deg';
    })();
  }

  /* ---------- 9. Anno / piccoli tocchi ---------- */
  function initUline() {
    var els = $$('.uline');
    if (!els.length) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: .4 });
    els.forEach(function (e) { io.observe(e); });
  }

  function boot() {
    pageTransition();
    initSpot();
    initGlare();
    initHeroLetters();
    initPin();
    initSkew();
    initVinyl();
    initUline();
    setTimeout(initScramble, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
