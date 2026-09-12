/* ============================================================
   proto-shared.js — contenuti condivisi dai 4 prototipi di home
   Non tocca il sito attuale. Legge i dati da assets/js/data.js
   ============================================================ */
(function () {
  var D = window.GA_DATA || {};
  var C = D.contact || {};
  var esc = function (s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  window.PIMG = function (img) {
    if (img.dataset.tried !== '1' && img.dataset.remote) { img.dataset.tried = '1'; img.src = img.dataset.remote; return; }
    img.style.visibility = 'hidden';
  };

  var MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  function dParts(iso) {
    var d = new Date(iso + 'T21:00:00');
    return { g: String(d.getDate()).padStart(2,'0'), m: MESI[d.getMonth()], a: d.getFullYear(),
             wd: ['dom','lun','mar','mer','gio','ven','sab'][d.getDay()] };
  }

  var wa = 'https://wa.me/' + String(C.phoneRaw || '').replace(/\D/g,'');

  /* ---------- blocchi ---------- */

  function chi() {
    return ''
    + '<div class="sc-two">'
    +   '<div class="sc-copy">'
    +     '<p class="sc-big">Ho iniziato con la radio, nel 1976. Prima le frequenze e l’elettronica, poi il microfono, poi la consolle: la stessa ossessione per il suono, applicata a tre mestieri diversi.</p>'
    +     '<p>Speaker e direttore di emittenti toscane, fino a Radio Jamaica — dieci anni di riconoscimenti, 10 nomination e il Gran Premio della Radio nel 1993.</p>'
    +     '<p>In parallelo i night club: Moulin del Topo a Firenze, il Bimbo’s di Pistoia, l’All Music Tramp di Montecatini. Da lì la specializzazione nel dancing e un modo di costruire la serata che tiene insieme liscio, revival, cumbia e dance di oggi.</p>'
    +     '<p>Oggi produco musica mia — iscritto SIAE, con Montefeltro Edizioni e Bernardi Records — e suono ogni settimana nei migliori dancing della Toscana.</p>'
    +     '<div class="sc-stats">'
    +       '<div><b>1976</b><span>Prima volta in radio</span></div>'
    +       '<div><b>10</b><span>Nomination radiofoniche</span></div>'
    +       '<div><b>50+</b><span>Produzioni pubblicate</span></div>'
    +       '<div><b>30+</b><span>Locali e dancing</span></div>'
    +     '</div>'
    +     '<a class="sc-btn" href="biografia.html">Storia completa</a>'
    +   '</div>'
    +   '<figure class="sc-portrait"><img src="assets/img/guido.jpg" alt="Guido Arcangeli in consolle" loading="lazy" onerror="PIMG(this)"></figure>'
    + '</div>';
  }

  function produzioni() {
    var t = (D.tracks || []).slice(0, 8);
    var h = '<div class="sc-tracks">';
    t.forEach(function (x, i) {
      h += '<a class="sc-track" href="' + esc(x.url) + '" target="_blank" rel="noopener">'
        +    '<span class="sc-track-n">' + String(i + 1).padStart(2,'0') + '</span>'
        +    '<span class="sc-track-art"><img src="' + esc(x.cover) + '" data-remote="' + esc(x.coverRemote) + '" alt="" loading="lazy" onerror="PIMG(this)"></span>'
        +    '<span class="sc-track-tx"><b>' + esc(x.title) + '</b><small>' + esc(x.genre) + ' · ' + x.year + '</small></span>'
        +    '<span class="sc-track-go">↗</span>'
        +  '</a>';
    });
    h += '</div><div class="sc-row"><a class="sc-btn sc-btn--solid" href="archivio.html">Tutto l’archivio — 50 brani</a>'
      +  '<a class="sc-btn" href="https://soundcloud.com/guidoarcangeli" target="_blank" rel="noopener">Ascolta su SoundCloud</a></div>';
    return h;
  }

  function serate() {
    var today = new Date(); today.setHours(0,0,0,0);
    var ev = (D.events || []).filter(function (e) { return new Date(e.date + 'T23:59') >= today; })
                             .sort(function (a,b) { return a.date < b.date ? -1 : 1; });
    var h = '<ul class="sc-events">';
    ev.forEach(function (e) {
      var p = dParts(e.date);
      h += '<li class="sc-event">'
        +   '<span class="sc-date"><b>' + p.g + '</b><i>' + p.m + '</i><u>' + p.wd + '</u></span>'
        +   '<span class="sc-ev-tx"><b>' + esc(e.venue) + '</b><small>' + esc(e.city) + '</small></span>'
        +   '<span class="sc-ev-note">' + esc(e.note || '') + '</span>'
        +   '<a class="sc-btn sc-btn--sm" href="' + wa + '?text=' + encodeURIComponent('Ciao Guido, info sulla serata del ' + p.g + ' ' + p.m) + '" target="_blank" rel="noopener">Info</a>'
        + '</li>';
    });
    h += '</ul><p class="sc-note">Date soggette a conferma — per prenotazioni ' + esc(C.phone || '') + '</p>';
    return h;
  }

  function locali() {
    var v = D.venues || [];
    var h = '<div class="sc-venues">';
    v.forEach(function (x, i) {
      h += '<div class="sc-venue"><span class="sc-venue-n">' + String(i + 1).padStart(2,'0') + '</span><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></div>';
    });
    h += '</div>';
    return h;
  }

  function media() {
    var v = D.videos || [];
    var h = '<div class="sc-videos">';
    v.forEach(function (x) {
      h += '<a class="sc-video" href="https://www.youtube.com/watch?v=' + esc(x.id) + '" target="_blank" rel="noopener">'
        +   '<img src="https://i.ytimg.com/vi/' + esc(x.id) + '/hqdefault.jpg" alt="" loading="lazy">'
        +   '<span class="sc-play">▶</span><b>' + esc(x.title) + '</b></a>';
    });
    h += '</div><div class="sc-shots">';
    for (var i = 1; i <= 8; i++) {
      var n = String(i).padStart(2,'0');
      h += '<figure><img src="assets/img/gallery/' + n + '.jpg" alt="" loading="lazy" onerror="PIMG(this)"><figcaption>' + n + '</figcaption></figure>';
    }
    h += '</div><div class="sc-row"><a class="sc-btn" href="news.html">News, video e foto →</a></div>';
    return h;
  }

  function contatti() {
    var s = (D.social || []).map(function (x) {
      return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a>';
    }).join('');
    return ''
    + '<div class="sc-two sc-two--contact">'
    +   '<div class="sc-copy">'
    +     '<p class="sc-big">Serate in dancing e discoteca, feste private, matrimoni, eventi. Scrivimi o chiamami: rispondo personalmente.</p>'
    +     '<div class="sc-lines">'
    +       '<div><small>Telefono &amp; WhatsApp</small><a href="tel:' + esc(C.phoneRaw || '') + '">' + esc(C.phone || '') + '</a></div>'
    +       '<div><small>Email</small><a href="mailto:' + esc(C.email1 || '') + '">' + esc(C.email1 || '') + '</a></div>'
    +       '<div><small>Email alternativa</small><a href="mailto:' + esc(C.email2 || '') + '">' + esc(C.email2 || '') + '</a></div>'
    +       '<div><small>Zona</small><span>Toscana e tutta Italia</span></div>'
    +     '</div>'
    +     '<div class="sc-socials">' + s + '</div>'
    +   '</div>'
    +   '<div class="sc-panel">'
    +     '<p class="sc-eyebrow">Richiesta serata</p>'
    +     '<form class="sc-form" onsubmit="return PFORM(this)">'
    +       '<label><span>Nome e cognome</span><input name="nome" required></label>'
    +       '<label><span>Email</span><input name="email" type="email" required></label>'
    +       '<label><span>Data e locale</span><input name="data"></label>'
    +       '<label><span>Messaggio</span><textarea name="msg" rows="3" required></textarea></label>'
    +       '<button class="sc-btn sc-btn--solid" type="submit">Invia richiesta</button>'
    +     '</form>'
    +     '<div class="sc-row"><a class="sc-btn sc-btn--sm" href="' + wa + '" target="_blank" rel="noopener">WhatsApp diretto</a>'
    +     '<a class="sc-btn sc-btn--sm" href="tel:' + esc(C.phoneRaw || '') + '">Chiama ora</a></div>'
    +   '</div>'
    + '</div>';
  }

  window.PFORM = function (f) {
    var b = 'Nome: ' + f.nome.value + '\nEmail: ' + f.email.value + '\nData e locale: ' + f.data.value + '\n\n' + f.msg.value;
    window.location.href = 'mailto:' + (C.email1 || '') + '?subject=' + encodeURIComponent('Richiesta serata — ' + f.nome.value) + '&body=' + encodeURIComponent(b);
    return false;
  };

  /* ---------- le sei sezioni ---------- */
  window.PSECTIONS = [
    { id:'chi',        num:'01', label:'Chi sono',   kicker:'Il mestiere di far ballare',  freq:'88.5',  hour:'21:00', hourLabel:'Apertura sala',  bpm:96,  html: chi },
    { id:'produzioni', num:'02', label:'Produzioni', kicker:'Le ultime uscite',            freq:'92.1',  hour:'22:30', hourLabel:'Primo set',      bpm:112, html: produzioni },
    { id:'serate',     num:'03', label:'Serate',     kicker:'Prossime date',               freq:'96.7',  hour:'00:00', hourLabel:'Il picco',       bpm:128, html: serate },
    { id:'locali',     num:'04', label:'Locali',     kicker:'Dove suono',                  freq:'101.2', hour:'01:00', hourLabel:'Sala piena',     bpm:130, html: locali },
    { id:'media',      num:'05', label:'Media',      kicker:'Video e fotografie',          freq:'104.9', hour:'02:00', hourLabel:'After',          bpm:118, html: media },
    { id:'contatti',   num:'06', label:'Contatti',   kicker:'Facciamo ballare la sala',    freq:'107.3', hour:'03:00', hourLabel:'Ultimo ballo',   bpm:88,  html: contatti }
  ];

  window.PBUILD = function (sec) { return sec.html(); };
})();
