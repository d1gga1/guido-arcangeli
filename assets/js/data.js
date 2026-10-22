/* ============================================================
   data.js — Contenuti del sito (facili da aggiornare)
   Brani, serate e video: vedi assets/js/contenuti.js (pannello /gestione/).
   Qui: locali, contatti e social.
   ============================================================ */
window.GA_DATA = (function () {

  var OLD = 'https://www.guidoarcangeli.com';

  /* -------- BRANI, SERATE, VIDEO --------
     Stanno in assets/js/contenuti.js, che Guido aggiorna dal pannello
     di gestione (indirizzo riservato /gestione/). Si può anche modificare
     a mano: ogni brano ha titolo, autori, anno, genere, copertina,
     audio (brano completo), base (solo base), testo (pdf o mp3),
     download (numero di partenza) e youtube (ID del video, facoltativo).
     Se un file di base/testo manca, nel menu "Scarica" appare "in arrivo". */
  var C = window.GA_CONTENUTI || { brani: [], serate: [], video: [] };

  var tracks = (C.brani || []).map(function (b) {
    return {
      title: b.titolo || '',
      authors: b.autori || '',
      url: b.pagina || '',
      cover: b.copertina || 'assets/img/vinyl.jpg',
      coverRemote: b.copertinaWeb || '',
      year: b.anno || '',
      genre: b.genere || '',
      audio: b.audio || '',
      base: b.base || '',
      testo: b.testo || '',
      youtube: b.youtube || '',
      downloads: +b.download || 0
    };
  });

  /* brano in evidenza ("Brano del momento" in home) */
  var mom = C.momento || {};
  var featured = 0;
  tracks.forEach(function (t, i) { if (mom.audio && t.audio === mom.audio) featured = i; });

  /* -------- SERATE -------- date = ISO (YYYY-MM-DD) */
  var events = C.serate || [];

  /* -------- LOCALI / RESIDENZE -------- */
  var venues = [
    ['Trocadero Village','Viareggio — Resident'],
    ['Discoteca Sombrero','San Miniato — Resident'],
    ['La Pagoda','Pisa'],
    ['Il Pueblo','Calenzano'],
    ['Liscio Più','Ponte Buggianese'],
    ['Lo Sperone','Pistoia'],
    ['Glass Globe','Campi Bisenzio'],
    ['Vanilla Disco','Siena'],
    ['Grotta Maona','Montecatini Terme'],
    ['All Music Tramp','Montecatini Terme'],
    ['Bimbo’s','Pistoia'],
    ['Moulin del Topo','Firenze'],
    ['La Capannina','Viareggio'],
    ['Discoteca Concorde','Chiesina Uzzanese'],
    ['Kalua','Marina di Pisa'],
    ['Il Settebello','Firenze']
  ];

  /* -------- VIDEO (YouTube) -------- */
  var videos = C.video || [];

  /* -------- CONTATTI / SOCIAL -------- */
  var contact = {
    phone: '+39 333 84 48 728',
    phoneRaw: '+393338448728',
    email1: 'info@guidoarcangeli.com',
    email2: 'guidoarcangeli@alice.it'
  };

  var social = [
    ['Instagram','https://www.instagram.com/guidoarcangeli/'],
    ['Facebook','https://www.facebook.com/dj.guidoarcangeli'],
    ['YouTube','https://www.youtube.com/channel/UCcVdSIVdgziaFblrGqeL6OQ'],
    ['SoundCloud','https://soundcloud.com/guidoarcangeli'],
    ['Beatport','https://www.beatport.com/release/ballando-compilation-vol-2/2057709'],
    ['Amazon Music','https://www.amazon.it/Musica-Digitale-Guido-Arcangeli/s?rh=n%3A1748203031%2Cp_27%3AGuido+Arcangeli']
  ];

  return { OLD:OLD, tracks:tracks, featured:featured, featuredText:mom.frase || '', events:events, venues:venues, videos:videos, contact:contact, social:social };
})();
