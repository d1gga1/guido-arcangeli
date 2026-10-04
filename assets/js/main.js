/* ============================================================
   main.js — Motion engine + rendering contenuti
   Zero dipendenze esterne.
   ============================================================ */
(function () {
  'use strict';

  var D = window.GA_DATA || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  // telefoni/tablet o connessione "risparmio dati": effetti più leggeri
  var small = window.matchMedia('(max-width: 760px)').matches;
  var conn = navigator.connection || {};
  var lowEnd = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') ||
               (navigator.deviceMemory && navigator.deviceMemory <= 2);
  var lite = coarse || small;
  window.GA_LITE = lite;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ============ 1. SMOOTH SCROLL (lerp su scroll nativo) ============ */
  var SS = { current: 0, target: 0, vel: 0, on: !reduce && !coarse };
  function initSmooth() {
    SS.current = SS.target = window.scrollY;
    if (!SS.on) return;
    var maxY = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    window.addEventListener('wheel', function (e) {
      if (document.body.classList.contains('is-locked')) return;
      e.preventDefault();
      SS.target = clamp(SS.target + e.deltaY * (e.deltaMode === 1 ? 22 : 1), 0, maxY());
    }, { passive: false });
    window.addEventListener('keydown', function (e) {
      var k = e.key, step = window.innerHeight * 0.82;
      if (k === 'PageDown') { SS.target = clamp(SS.target + step, 0, maxY()); }
      else if (k === 'PageUp') { SS.target = clamp(SS.target - step, 0, maxY()); }
      else if (k === 'Home') { SS.target = 0; }
      else if (k === 'End') { SS.target = maxY(); }
      else return;
      e.preventDefault();
    });
    window.addEventListener('resize', function () { SS.target = clamp(SS.target, 0, maxY()); });
  }
  function scrollTo(y) {
    var maxY = document.documentElement.scrollHeight - window.innerHeight;
    y = clamp(y, 0, maxY);
    if (SS.on) SS.target = y; else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ============ 2. RAF loop ============ */
  var raf = [];
  var lastSet = -1;
  function onFrame(fn) { raf.push(fn); }
  function tick() {
    requestAnimationFrame(tick);
    var sy = window.scrollY;
    // qualcuno ha scrollato fuori dal nostro controllo (barra, touch, ancore native, scrollTo)
    if (lastSet >= 0 && Math.abs(sy - lastSet) > 2) { SS.current = SS.target = sy; }
    if (SS.on && !document.body.classList.contains('is-locked')) {
      var prev = SS.current;
      SS.current = lerp(SS.current, SS.target, 0.105);
      if (Math.abs(SS.target - SS.current) < 0.12) SS.current = SS.target;
      SS.vel = SS.current - prev;
      if (Math.abs(sy - SS.current) > 0.05) { window.scrollTo(0, SS.current); }
      lastSet = window.scrollY;
    } else {
      SS.vel = sy - SS.current;
      SS.current = SS.target = sy;
      lastSet = sy;
    }
    for (var i = 0; i < raf.length; i++) raf[i](SS.current, SS.vel);
  }

  /* ============ 3. REVEAL ============ */
  function initReveal() {
    var els = $$('[data-rev], .rl');
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (e) { e.classList.add('in'); }); return;
    }
    function show(el) {
      var d = parseFloat(el.getAttribute('data-delay') || 0);
      setTimeout(function () { el.classList.add('in'); }, d * 1000);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        show(en.target); io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.02 });
    // tutto quello che è già a schermo al primo paint viene rivelato subito
    var vh = window.innerHeight;
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < vh - 6 && r.bottom > 0) { show(e); } else { io.observe(e); }
    });
  }

  /* ============ 4. PARALLAX ============ */
  function initParallax() {
    var els = $$('[data-speed]');
    if (!els.length || reduce) return;
    onFrame(function (y) {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var sp = parseFloat(el.getAttribute('data-speed')) || 0;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = 'translate3d(0,' + (-p * sp * 100).toFixed(2) + 'px,0)';
      });
    });
  }

  /* ============ 5. MARQUEE ============ */
  function initMarquee() {
    $$('.marquee').forEach(function (m) {
      var track = $('.marquee-track', m);
      if (!track) return;
      var base = track.innerHTML;
      var need = Math.ceil((window.innerWidth * 2.4) / Math.max(track.scrollWidth, 1)) + 1;
      for (var i = 0; i < need; i++) track.insertAdjacentHTML('beforeend', base);
      var w = track.scrollWidth / (need + 1);
      var x = 0, dir = m.hasAttribute('data-reverse') ? 1 : -1;
      var speed = parseFloat(m.getAttribute('data-speed-mq')) || 0.55;
      var vis = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(m);
      }
      onFrame(function (y, vel) {
        if (!vis) return;
        x += dir * (speed + Math.min(Math.abs(vel) * 0.055, 5));
        if (dir < 0 && x <= -w) x += w;
        if (dir > 0 && x >= 0) x -= w;
        track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      });
    });
  }

  /* ============ 6. CURSOR ============ */
  function initCursor() {
    if (coarse || reduce) return;
    var ring = document.createElement('div'); ring.className = 'cursor';
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.appendChild(ring); document.body.appendChild(dot);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }, { passive: true });
    onFrame(function () {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('a,button,.track,.event,.gcell,.vcard,input,textarea');
      ring.classList.toggle('grow', !!t);
    });
  }

  /* ============ 7. MAGNETIC ============ */
  function initMagnetic() {
    if (coarse || reduce) return;
    $$('[data-magnetic]').forEach(function (el) {
      var str = parseFloat(el.getAttribute('data-magnetic')) || 0.32;
      var tx = 0, ty = 0, cx = 0, cy = 0, active = false;
      el.addEventListener('pointerenter', function () { active = true; });
      el.addEventListener('pointerleave', function () { active = false; tx = ty = 0; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * str;
        ty = (e.clientY - (r.top + r.height / 2)) * str;
      });
      onFrame(function () {
        if (!active && Math.abs(cx) < .05 && Math.abs(cy) < .05) return;
        cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
        el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      });
    });
  }

  /* ============ 8. TILT 3D ============ */
  function initTilt(root) {
    if (coarse || reduce) return;
    $$('[data-tilt]', root || document).forEach(function (el) {
      if (el.__tilt) return; el.__tilt = 1;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(760px) rotateX(' + (-py * 9).toFixed(2) + 'deg) rotateY(' + (px * 11).toFixed(2) + 'deg) translateZ(6px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ============ 9. NAV / MENU / PROGRESS ============ */
  function initNav() {
    var nav = $('.nav'); if (!nav) return;
    var last = 0;
    var bar = $('.progress');
    onFrame(function (y) {
      nav.classList.toggle('stuck', y > 40);
      nav.classList.toggle('hide', y > 420 && y > last + 2 && !$('.menu.open'));
      last = y;
      if (bar) {
        var max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? (y / max).toFixed(4) : 0) + ')';
      }
    });

    var burger = $('.burger'), menu = $('.menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('is-locked', open);
        $$('a', menu).forEach(function (a, i) { a.style.transitionDelay = open ? (0.16 + i * 0.055) + 's' : '0s'; });
      });
      var closeMenu = function () {
        menu.classList.remove('open'); burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-locked');
      };
      $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); burger.focus(); }
      });
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + (SS.on ? SS.current : window.scrollY) - (small ? 16 : 64);
      scrollTo(top);
    });
  }

  /* ============ 10. COUNTERS ============ */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = parseFloat(el.getAttribute('data-count')), t0 = null;
        var pre = el.getAttribute('data-pre') || '', post = el.getAttribute('data-post') || '';
        function step(ts) {
          if (!t0) t0 = ts;
          var p = clamp((ts - t0) / 1500, 0, 1);
          p = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(to * p) + post;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: .4 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ============ 11. VISUALIZER (finto, elegante) ============ */
  function initViz() {
    $$('.viz').forEach(function (v) {
      if (v.children.length === 0) {
        for (var i = 0; i < (small ? 22 : 34); i++) v.appendChild(document.createElement('i'));
      }
      var bars = $$('i', v), t = Math.random() * 100, vis = true, skip = 0;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(v);
      }
      onFrame(function () {
        if (!vis) return;
        if (lite && (skip++ & 1)) return; // 30 fps su telefono: basta e avanza
        t += 0.055;
        for (var i = 0; i < bars.length; i++) {
          var h = 0.22 + 0.78 * Math.abs(Math.sin(t + i * 0.42) * Math.sin(t * 0.53 + i * 0.19));
          bars[i].style.transform = 'scaleY(' + h.toFixed(3) + ')';
        }
      });
    });
  }

  /* ============ 12. IMG fallback ============ */
  function imgTag(local, remote, alt, cls) {
    return '<img src="' + local + '" alt="' + alt.replace(/"/g, '&quot;') + '"' +
      (cls ? ' class="' + cls + '"' : '') + ' width="200" height="200" loading="lazy" decoding="async" ' +
      'data-remote="' + remote + '" onerror="GA.imgFail(this)">';
  }
  window.GA = window.GA || {};
  window.GA.imgFail = function (img) {
    if (img.dataset.tried !== '1' && img.dataset.remote) {
      img.dataset.tried = '1'; img.src = img.dataset.remote; return;
    }
    img.style.display = 'none';
    var f = img.parentNode.querySelector('.fallback, .ph');
    if (f) f.style.display = 'grid';
  };

  /* ============ 13. RENDER: TRACKS ============ */
  var ICO = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-play" d="M8 5v14l11-7z"/><path class="i-pause" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v9.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6zM5 18h14v2H5z"/></svg>'
  };
  var fmtN = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  function dlCount(i) {
    var t = D.tracks[i], extra = 0;
    try { extra = parseInt(localStorage.getItem('ga_dl_' + i) || '0', 10) || 0; } catch (e) {}
    return (t.downloads || 0) + extra;
  }
  function dlName(t) { return 'Guido Arcangeli - ' + t.title.replace(/[\\/:*?"<>|]/g, '') + '.mp3'; }
  function trackCard(t, i) {
    var has = !!t.audio;
    return '' +
      '<article class="track" data-tilt data-rev="up" data-i="' + i + '">' +
        '<div class="track-art">' +
          '<div class="fallback" style="display:none">' + t.title.split('(')[0].trim() + '</div>' +
          imgTag(t.cover, t.coverRemote, t.title) +
          (has ? '<button class="play" type="button" data-play="' + i + '" aria-label="Ascolta ' + t.title.replace(/"/g, '&quot;') + '">' + ICO.play + '</button>' : '') +
          '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '</div>' +
        '<div class="track-body">' +
          '<h3>' + t.title + '</h3>' +
          '<div class="meta"><i>' + t.genre + '</i><span>' + t.year + '</span></div>' +
          (has ?
          '<div class="track-actions">' +
            '<button class="ta-play" type="button" data-play="' + i + '">' + ICO.play + '<span class="lbl">Ascolta</span></button>' +
            '<a class="ta-dl" href="' + t.audio + '" download="' + dlName(t).replace(/"/g, '') + '" data-dl="' + i + '" aria-label="Scarica ' + t.title.replace(/"/g, '&quot;') + '">' + ICO.dl + '<span class="lbl">Scarica</span></a>' +
          '</div>' +
          '<p class="dl-count"><b data-dlc="' + i + '">' + fmtN(dlCount(i)) + '</b> download</p>' : '') +
        '</div>' +
      '</article>';
  }
  function renderTracks() {
    var host = $('#tracks-featured');
    if (host && D.tracks) {
      host.innerHTML = D.tracks.slice(0, 10).map(function (t, i) { return trackCard(t, i); }).join('');
      if (!$('.swipe-hint', host.parentNode)) host.insertAdjacentHTML('afterend', '<p class="swipe-hint" aria-hidden="true"><i></i>Scorri</p>');
    }
    var all = $('#tracks-all');
    if (all && D.tracks) {
      all.innerHTML = D.tracks.map(function (t, i) { return trackCard(t, i); }).join('');
      initArchiveFilters();
    }
    initTilt();
  }

  function initArchiveFilters() {
    var chips = $$('.chip[data-filter]'), input = $('#track-search'), count = $('#track-count');
    var cards = $$('#tracks-all .track');
    var data = D.tracks;
    var cur = 'all', q = '';
    function apply() {
      var n = 0;
      cards.forEach(function (c, i) {
        var t = data[i];
        var okG = cur === 'all' || t.genre === cur;
        var okQ = !q || (t.title + ' ' + t.genre + ' ' + t.year).toLowerCase().indexOf(q) > -1;
        var show = okG && okQ;
        c.style.display = show ? '' : 'none';
        if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? ' brano' : ' brani');
    }
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        ch.classList.add('active');
        cur = ch.getAttribute('data-filter'); apply();
      });
    });
    if (input) input.addEventListener('input', function () { q = input.value.trim().toLowerCase(); apply(); });
    apply();
  }

  /* ============ 14. RENDER: EVENTS ============ */
  var MESI = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'];
  function renderEvents() {
    var host = $('#events'); if (!host || !D.events) return;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var list = D.events.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var next = list.filter(function (e) { return new Date(e.date) >= now; });
    if (!next.length) next = list.slice(-6);
    var lim = host.getAttribute('data-limit');
    if (lim) next = next.slice(0, parseInt(lim, 10));
    host.innerHTML = next.map(function (e) {
      var d = new Date(e.date);
      return '<a class="event" data-rev="up" href="https://wa.me/' + (D.contact.phoneRaw || '').replace('+', '') +
        '?text=' + encodeURIComponent('Ciao Guido, info sulla serata del ' + d.getDate() + ' ' + MESI[d.getMonth()] + ' al ' + e.venue) + '" target="_blank" rel="noopener">' +
        '<span class="date">' + String(d.getDate()).padStart(2, '0') + '<small>' + MESI[d.getMonth()] + ' ' + d.getFullYear() + '</small></span>' +
        '<span class="info"><h3>' + e.venue + '</h3><p>' + e.city + (e.note ? ' — ' + e.note : '') + '</p></span>' +
        '<span class="go">Info <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h12l-5-5 1.4-1.4L20.8 12l-7.4 7.4L12 18l5-5H5z"/></svg></span>' +
        '</a>';
    }).join('');
  }

  /* ============ 15. RENDER: VENUES / VIDEO / SOCIAL ============ */
  function renderVenues() {
    var host = $('#venues'); if (!host || !D.venues) return;
    host.innerHTML = D.venues.map(function (v) {
      return '<div class="venue" data-rev="fade"><b>' + v[0] + '</b><span>' + v[1] + '</span></div>';
    }).join('');
  }
  function renderVideos() {
    var host = $('#videos'); if (!host || !D.videos) return;
    host.innerHTML = D.videos.map(function (v) {
      return '<a class="vcard" data-rev="up" href="https://www.youtube.com/watch?v=' + v.id + '" target="_blank" rel="noopener">' +
        '<img src="https://i.ytimg.com/vi/' + v.id + (small ? '/mqdefault.jpg' : '/hqdefault.jpg') + '" alt="' + v.title + '" width="480" height="270" loading="lazy" decoding="async">' +
        '<span class="pl"><b><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></b></span>' +
        '<span class="cap">' + v.title + '</span></a>';
    }).join('');
  }
  var SOC_ICONS = {
    Instagram: 'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.17-1 .37-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.22-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
    Facebook: 'M14 8.5V6.8c0-.8.2-1.2 1.4-1.2H17V2.6c-.3 0-1.2-.1-2.3-.1-2.4 0-4 1.4-4 4.1v1.9H8V12h2.7v9.4H14V12h2.7l.4-3.5H14z',
    YouTube: 'M21.6 7.2s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.85C16.2 4.2 12 4.2 12 4.2s-4.2 0-6.9.2c-.4.05-1.2.05-1.9.85-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.7.8 1.7.75 2.1.83 1.6.15 6.7.2 6.7.2s4.2 0 6.9-.2c.4-.05 1.2-.05 1.9-.85.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.6V8.9l5.4 2.9-5.4 2.8z',
    SoundCloud: 'M2.5 13.2v3.2c0 .2.1.3.3.3s.3-.1.3-.3v-3.2c0-.2-.1-.3-.3-.3s-.3.1-.3.3zm1.8-1.4v4.6c0 .2.1.3.3.3s.3-.1.3-.3v-4.6c0-.2-.1-.3-.3-.3s-.3.2-.3.3zm1.9-.7v5.3c0 .2.1.3.3.3s.3-.1.3-.3v-5.3c0-.2-.1-.3-.3-.3s-.3.1-.3.3zm1.9-.6v5.9c0 .2.1.3.3.3s.3-.1.3-.3v-5.9c0-.2-.1-.3-.3-.3s-.3.1-.3.3zm1.9-1.3v7.2c0 .2.2.3.4.3s.4-.1.4-.3V9.2c0-.2-.2-.4-.4-.4s-.4.2-.4.4zM12 7.6v8.8c0 .2.2.4.4.4h7c1.7 0 3.1-1.4 3.1-3.1s-1.4-3.1-3.1-3.1c-.4 0-.8.1-1.2.2-.3-2.8-2.6-4.9-5.4-4.9-.3 0-.6 0-.8.1v1.6z',
    Beatport: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-.6 15.4a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8zm0-6a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zM8.8 5.6h1.9v5.1H8.8z',
    'Amazon Music': 'M3.5 16.6c4.6 2.6 10.3 2.7 15.1.2l.5 1c-5.2 3-11.6 2.7-16.4-.4l.8-.8zm17.1 1c.3-.4-.2-1.9-.5-2.5-.1-.2 0-.3.2-.2.9.5 1.2 2.1.9 2.9-.2.5-.6.6-.6-.2zM12 5.2c2 0 3.2.8 3.2 3.1v3.3c0 .6.3.9.5 1.2.1.2.1.4 0 .5l-1 .9c-.2.1-.4.1-.5 0-.3-.3-.5-.6-.6-.8-.7.7-1.5 1.1-2.6 1.1-1.5 0-2.7-.9-2.7-2.7 0-1.4.8-2.4 2-2.8.9-.3 2-.4 2.9-.5v-.3c0-.7-.2-1.2-1.1-1.2-.7 0-1.2.4-1.4 1-.1.2-.2.3-.4.3l-1.2-.1c-.2 0-.3-.2-.3-.4.3-1.7 1.7-2.6 3.2-2.6zm1.2 4.9c-.6 0-1.2.1-1.7.3-.5.2-.8.6-.8 1.2 0 .7.4 1.1 1 1.1.6 0 1.1-.4 1.3-.9.2-.4.2-.8.2-1.3v-.4z'
  };
  function renderSocial() {
    $$('.socials[data-auto]').forEach(function (host) {
      if (!D.social) return;
      host.innerHTML = D.social.map(function (s) {
        var p = SOC_ICONS[s[0]] || '';
        return '<a class="soc" href="' + s[1] + '" target="_blank" rel="noopener" aria-label="' + s[0] + '" title="' + s[0] + '">' +
          '<svg viewBox="0 0 24 24"><path d="' + p + '"/></svg></a>';
      }).join('');
    });
  }

  /* ============ 16. HERO GL ============ */
  var hero;
  function initHero() {
    var cv = $('#gl-hero'); if (!cv || !window.GA_GL || reduce) return;
    hero = lowEnd ? null : window.GA_GL.HeroScene(cv);
    if (!hero) { cv.style.background = 'radial-gradient(60% 60% at 30% 30%,rgba(124,60,255,.5),transparent),radial-gradient(50% 50% at 80% 70%,rgba(0,229,255,.35),transparent),#08061a'; return; }
    var sec = cv.closest('.hero');
    onFrame(function (y) {
      var h = sec ? sec.offsetHeight : innerHeight;
      hero.setScroll(clamp(y / h, 0, 1.6));
      hero.setVisible(y < h * 1.35);
    });
    // parallax del titolo
    var t = $('.hero-title'), meta = $('.hero-meta');
    if (!reduce) onFrame(function (y) {
      var p = clamp(y / innerHeight, 0, 1);
      if (t) { t.style.transform = 'translate3d(0,' + (p * 110).toFixed(1) + 'px,0)'; t.style.opacity = (1 - p * 1.15).toFixed(3); }
      if (meta) { meta.style.transform = 'translate3d(0,' + (p * 60).toFixed(1) + 'px,0)'; meta.style.opacity = (1 - p * 1.4).toFixed(3); }
    });
  }

  /* ============ 17. INTRO ============ */
  function runIntro(done) {
    var intro = $('#intro');
    if (!intro) { done(); return; }
    var seen = false;
    try { seen = sessionStorage.getItem('ga_intro') === '1'; } catch (e) {}
    if (reduce || lowEnd || seen) {
      intro.classList.add('done');
      setTimeout(function () { intro.remove(); }, 100);
      done(); return;
    }
    document.body.classList.add('is-locked');

    var cv = $('#gl-intro');
    var scene = null;
    var word = $('.intro-word'), sub = $('.intro-sub'), bar = $('.intro-bar i'), num = $('.intro-num');

    var t0 = performance.now(), DUR = lite ? 1500 : 2200, closed = false;
    // le particelle disegnano il nome col font Anton: lo aspettiamo (max 600 ms)
    var fontReady = (document.fonts && document.fonts.load)
      ? Promise.race([document.fonts.load("400 120px 'Anton'"), new Promise(function (r) { setTimeout(r, 600); })])
      : Promise.resolve();
    fontReady.then(function () {
      if (!closed && window.GA_GL) scene = window.GA_GL.IntroScene(cv, ['GUIDO', 'ARCANGELI']);
    }, function () {
      if (!closed && window.GA_GL) scene = window.GA_GL.IntroScene(cv, ['GUIDO', 'ARCANGELI']);
    });
    function close() {
      if (closed) return; closed = true;
      try { sessionStorage.setItem('ga_intro', '1'); } catch (e) {}
      if (scene) {
        var s0 = performance.now();
        (function out() {
          var p = clamp((performance.now() - s0) / 620, 0, 1);
          scene.disperse = p; scene.scale = 0.95 + p * 0.55;
          if (p < 1) requestAnimationFrame(out);
        })();
      }
      if (word) { word.style.transition = 'opacity .5s, transform .6s cubic-bezier(.16,1,.3,1)'; word.style.opacity = 0; word.style.transform = 'translateY(-16px)'; }
      setTimeout(function () {
        intro.classList.add('done');
        document.body.classList.remove('is-locked');
        done();
        setTimeout(function () { if (scene) scene.destroy(); intro.remove(); }, 950);
      }, 460);
    }

    var skip = $('.intro-skip');
    if (skip) skip.addEventListener('click', close);
    intro.addEventListener('click', function (e) { if (performance.now() - t0 > (lite ? 300 : 900)) close(); });

    (function loop() {
      var p = clamp((performance.now() - t0) / DUR, 0, 1);
      var e = 1 - Math.pow(1 - p, 2.2);
      if (scene) scene.t = e;
      if (bar) bar.style.transform = 'scaleX(' + e.toFixed(4) + ')';
      if (num) num.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (word && p > 0.55) { word.style.transition = 'opacity .8s, transform .8s cubic-bezier(.16,1,.3,1)'; word.style.opacity = 1; word.style.transform = 'none'; }
      if (sub && p > 0.7) { sub.style.transition = 'opacity .8s'; sub.style.opacity = 1; }
      if (p < 1) requestAnimationFrame(loop);
      else setTimeout(close, 420);
    })();
  }

  /* ============ 18. FORM ============ */
  function initForm() {
    var f = $('#contact-form'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = $('#f-name').value.trim(), em = $('#f-email').value.trim(),
          d = $('#f-date').value.trim(), m = $('#f-msg').value.trim();
      var body = 'Nome: ' + n + '\nEmail: ' + em + '\nData / Locale: ' + d + '\n\n' + m;
      window.location.href = 'mailto:' + (D.contact ? D.contact.email1 : '') +
        '?subject=' + encodeURIComponent('Richiesta serata — ' + n) +
        '&body=' + encodeURIComponent(body);
    });
  }

  /* ============ 19. YEAR ============ */
  function initMisc() {
    $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    if (D.contact) {
      $$('[data-phone]').forEach(function (e) { e.textContent = D.contact.phone; });
      $$('[data-tel]').forEach(function (e) { e.href = 'tel:' + D.contact.phoneRaw; });
      $$('[data-wa]').forEach(function (e) { e.href = 'https://wa.me/' + D.contact.phoneRaw.replace('+', ''); });
      $$('[data-mail]').forEach(function (e) { e.href = 'mailto:' + D.contact.email1; e.textContent = e.textContent || D.contact.email1; });
    }
  }

  /* ============ 20. BARRA CONTATTI (telefono) ============ */
  function initMobileBar() {
    if (!D.contact || $('.mbar')) return;
    var raw = D.contact.phoneRaw || '';
    var bar = document.createElement('div');
    bar.className = 'mbar';
    bar.innerHTML =
      '<a href="tel:' + raw + '" aria-label="Chiama Guido"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>Chiama</a>' +
      '<a class="wa" href="https://wa.me/' + raw.replace('+', '') + '?text=' + encodeURIComponent('Ciao Guido, vorrei informazioni per una serata') + '" target="_blank" rel="noopener" aria-label="Scrivi su WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z"/></svg>WhatsApp</a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-mbar');
    // nascosta vicino ai contatti e nel footer (ci sono già i pulsanti)
    var block = 0;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { x.target.__in = x.isIntersecting; });
        block = $$('#contatti, .footer').filter(function (e) { return e.__in; }).length;
      });
      $$('#contatti, .footer').forEach(function (e) { io.observe(e); });
    }
    var shown = false;
    onFrame(function (y) {
      var want = y > innerHeight * 0.7 && !block;
      if (want !== shown) { shown = want; bar.classList.toggle('show', want); }
    });
  }

  /* ============ 21. PLAYER AUDIO ============ */
  function initPlayer() {
    if (!D.tracks) return;
    $$('[data-dlc]').forEach(function (el) { el.textContent = fmtN(dlCount(+el.getAttribute('data-dlc'))); });
    var audio = new Audio(); audio.preload = 'none';
    var cur = -1, bar = null;
    function fmtT(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function build() {
      if (bar) return bar;
      bar = document.createElement('div');
      bar.className = 'player'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Lettore musicale');
      bar.innerHTML =
        '<div class="pl-seek" role="slider" aria-label="Posizione" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
        '<div class="pl-row">' +
          '<img class="pl-cover" alt="" width="200" height="200">' +
          '<div class="pl-info"><b class="pl-title"></b><span class="pl-time">0:00 / 0:00</span></div>' +
          '<button class="pl-btn pl-prev" type="button" aria-label="Brano precedente"><svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9.5 12z"/></svg></button>' +
          '<button class="pl-btn pl-toggle" type="button" aria-label="Pausa">' + ICO.play + '</button>' +
          '<button class="pl-btn pl-next" type="button" aria-label="Brano successivo"><svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l10.5-7z"/></svg></button>' +
          '<a class="pl-btn pl-dl" aria-label="Scarica">' + ICO.dl + '</a>' +
          '<button class="pl-btn pl-close" type="button" aria-label="Chiudi lettore"><svg viewBox="0 0 24 24"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg></button>' +
        '</div>';
      document.body.appendChild(bar);
      $('.pl-toggle', bar).addEventListener('click', function () { toggle(cur); });
      $('.pl-prev', bar).addEventListener('click', function () { step(-1); });
      $('.pl-next', bar).addEventListener('click', function () { step(1); });
      $('.pl-close', bar).addEventListener('click', function () {
        audio.pause(); bar.classList.remove('show'); document.body.classList.remove('has-player'); sync();
      });
      var seek = $('.pl-seek', bar);
      function seekTo(e) {
        if (!audio.duration) return;
        var r = seek.getBoundingClientRect();
        audio.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * audio.duration;
      }
      seek.addEventListener('pointerdown', function (e) { seekTo(e); seek.setPointerCapture(e.pointerId); });
      seek.addEventListener('pointermove', function (e) { if (e.buttons) seekTo(e); });
      seek.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') audio.currentTime += 5; else if (e.key === 'ArrowLeft') audio.currentTime -= 5;
      });
      return bar;
    }
    function playable(i) { return D.tracks[i] && D.tracks[i].audio; }
    function step(d) {
      var n = D.tracks.length, i = cur;
      for (var k = 0; k < n; k++) { i = (i + d + n) % n; if (playable(i)) { play(i); return; } }
    }
    function sync() {
      var playing = !audio.paused;
      $$('[data-play]').forEach(function (b) {
        var on = +b.getAttribute('data-play') === cur && playing;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var l = $('.lbl', b); if (l) l.textContent = on ? 'Pausa' : 'Ascolta';
      });
      $$('.track[data-i]').forEach(function (c) {
        c.classList.toggle('is-playing', +c.getAttribute('data-i') === cur && playing);
        c.classList.toggle('is-current', +c.getAttribute('data-i') === cur);
      });
      if (bar) {
        bar.classList.toggle('paused', !playing);
        $('.pl-toggle', bar).setAttribute('aria-label', playing ? 'Pausa' : 'Riproduci');
      }
    }
    function play(i) {
      var t = D.tracks[i]; if (!t || !t.audio) return;
      build();
      if (cur !== i) {
        cur = i; audio.src = t.audio;
        $('.pl-title', bar).textContent = t.title;
        var c = $('.pl-cover', bar); c.src = t.cover; c.onerror = function () { c.src = 'assets/img/vinyl.jpg'; };
        var dl = $('.pl-dl', bar); dl.href = t.audio; dl.setAttribute('download', dlName(t)); dl.setAttribute('data-dl', i);
        $('.pl-seek i', bar).style.transform = 'scaleX(0)';
        if ('mediaSession' in navigator && window.MediaMetadata) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: t.title, artist: 'Guido Arcangeli', album: t.genre + ' · ' + t.year,
            artwork: [{ src: new URL(t.cover, location.href).href, sizes: '200x200', type: 'image/jpeg' }]
          });
        }
      }
      bar.classList.add('show'); document.body.classList.add('has-player');
      var pr = audio.play(); if (pr && pr.catch) pr.catch(function () { sync(); });
      sync();
    }
    function toggle(i) {
      if (i === cur && !audio.paused) { audio.pause(); return; }
      play(i);
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-play]');
      if (b) { e.preventDefault(); toggle(+b.getAttribute('data-play')); return; }
      var d = e.target.closest('[data-dl]');
      if (d) {
        // il download parte dal link; qui aggiorniamo il contatore di questo visitatore
        var i = +d.getAttribute('data-dl'), k = 'ga_dl_' + i;
        try { localStorage.setItem(k, String((parseInt(localStorage.getItem(k) || '0', 10) || 0) + 1)); } catch (err) {}
        $$('[data-dlc="' + i + '"]').forEach(function (el) {
          el.textContent = fmtN(dlCount(i));
          el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
        });
      }
    });
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', function () { step(1); });
    audio.addEventListener('timeupdate', function () {
      if (!bar || !audio.duration) return;
      var p = audio.currentTime / audio.duration;
      $('.pl-seek i', bar).style.transform = 'scaleX(' + p.toFixed(4) + ')';
      $('.pl-seek', bar).setAttribute('aria-valuenow', Math.round(p * 100));
      $('.pl-time', bar).textContent = fmtT(audio.currentTime) + ' / ' + fmtT(audio.duration);
    });
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
        navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
        navigator.mediaSession.setActionHandler('previoustrack', function () { step(-1); });
        navigator.mediaSession.setActionHandler('nexttrack', function () { step(1); });
      } catch (e) {}
    }
  }

  /* ============ BOOT ============ */
  function boot() {
    initSmooth();
    tick();
    renderTracks();
    renderEvents();
    renderVenues();
    renderVideos();
    renderSocial();
    initMisc();
    initNav();
    initMarquee();
    initCursor();
    initMagnetic();
    initTilt();
    initParallax();
    initViz();
    initCounters();
    initForm();
    initMobileBar();
    initPlayer();
    runIntro(function () {
      document.body.classList.add('ready');
      initHero();
      initReveal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
