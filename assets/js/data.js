/* ============================================================
   data.js — Contenuti del sito (facili da aggiornare)
   Modifica QUI per cambiare brani, serate e locali: il sito
   si aggiorna da solo, non serve toccare l'HTML.
   ============================================================ */
window.GA_DATA = (function () {

  var OLD = 'https://www.guidoarcangeli.com';

  /* -------- BRANI --------
     [ titolo, url pagina, file copertina, anno, genere ]     */
  var T = [
    ['Embrace a Dream','/audio/embrace-a-dream/','2023/08/cover-ambrace-a-dream-copia-200x200.jpg',2023,'Dance'],
    ['Se Stiamo Insieme (Cumbia o Kizomba Remix)','/audio/se-stiamo-insieme-cumbia-kizomba-remix/','2023/02/sestiamoinsieme-200x200.png',2023,'Cumbia'],
    ['Sei il Mio Tormento','/audio/sei-il-mio-tormento/','2023/02/02-SEI-IL-MIO-TORMENTO-COVER-QUADRATA--200x200.jpg',2023,'Dance'],
    ['Love Your Life','/audio/love-your-life/','2022/08/love-your-life-copertina-200x200.jpg',2022,'Dance'],
    ['I Can Be the One','/audio/i-can-be-the-one/','2020/11/COMUNICATO-NOVALIS-15-11-20-1-200x200.jpg',2020,'Dance'],
    ['Laura Non C’è (Dance Remix 130 BPM)','/audio/laura-non-ce-dance-remix-130-bpm/','2020/08/LAURANONCE-200x200.png',2020,'Remix'],
    ['Rock ’n’ Roll Robot / My Sharona (Dance Remix)','/audio/rock-n-roll-robot-my-sharona-dance-remix-130-bpm/','2020/03/my-robot-copertina-200x200.jpg',2020,'Remix'],
    ['Mix Tozzi (Cumbia Version Remix)','/audio/mix-tozzi-cumbia-remix/','2020/01/mixamare-200x200.jpg',2020,'Cumbia'],
    ['Dolceamaro (Dance Remix)','/audio/dolceamaro-dance-remix/','2019/06/medley-dolceamaro-profumo-1440px-200x200.jpg',2019,'Remix'],
    ['Mix d’Amore','/audio/mix-d-amore/','2019/06/FpIOKZG2-200x200.jpeg',2019,'Remix'],
    ['Su di Noi – Sintesy (Dance Remix 130 BPM)','/audio/pupo-su-di-noi-dance-remix-130bpm/','2019/06/COVER-200x200.jpg',2019,'Remix'],
    ['Gianni Drudi feat. Guido Arcangeli – Morire Senza Te','/audio/gianni-drudi-feat-guido-arcangeli-dj-morire-senza-te-cumbia-2019/','2019/05/morire-senza-te-copertina_-1-200x200.jpg',2019,'Cumbia'],
    ['Gelato al Cioccolato / Mamma Maria (Dance Version)','/audio/gelato-al-cioccolato-mamma-maria-dance-version/','2019/04/gelato-al-cioccolato-new-200x200.jpeg',2019,'Remix'],
    ['Dopo la Tempesta – Un Cuore Non Hai','/audio/dopo-la-tempesta-un-cuore-non-hai/','2019/03/COPERTINA-OK-600X-600-200x200.jpg',2019,'Dance'],
    ['Cosa ti Aspetti da Me – Remix','/audio/cosa-ti-aspetti-da-me-remix/','2019/03/cd-case-cover-template-200x200.jpg',2019,'Remix'],
    ['Musica Che Resta – Remix','/audio/musica-che-resta-musica-remix/','2019/03/ILVOLO-200x200.jpg',2019,'Remix'],
    ['Havana (Kizomba 2019)','/audio/havana-kizomba-2019/','2018/10/cover-avana-200x200.png',2019,'Kizomba'],
    ['Tu Per Me – Sei (Cumbia Remix)','/audio/tu-per-me-franco-simone-cumbia-remix/','2018/06/Front-Cover-prova-200x200.jpg',2018,'Cumbia'],
    ['Una Storia Importante – Come ti Vorrei (Remix 130 BPM)','/audio/una-storia-importante-come-ti-vorrei-remix-130-bpm/','2018/04/Summer-CD-Cover-Front_final-200x200.jpg',2018,'Remix'],
    ['Nessuno Mai – Mix Nessuno / Jesahel (Remix 130 BPM)','/audio/nessuno-mai-mix-nessuno-jesahel-remix-130-bpm/','2018/04/cover-template_final-200x200.jpg',2018,'Remix'],
    ['Please Don’t Go – Cumbia Remix','/audio/please-dont-go-cumbia-remix/','2017/10/22855542_10210895343200561_989473401_n-200x200.jpg',2017,'Cumbia'],
    ['L’Esercito del Selfie (Remix)','/audio/esercito-del-selfie-remix/','2017/08/esercitoselfie-colonnello-cover-1-200x200.jpg',2017,'Remix'],
    ['Strani Amori (Versione Cumbia)','/audio/strani-amori-versione-cumbia/','2017/07/strani-amori-copertina-200x200.jpg',2017,'Cumbia'],
    ['Cammino Sulla Sabbia','/audio/cammino-sulla-sabbia/','2017/07/camminosullasabbia-200x200.jpg',2017,'Ballabile'],
    ['Sayonara – Cumbia 2019','/audio/sayonara-nuova-cumbia-2019/','2017/07/Copertina-Sayonara-200x200.jpg',2019,'Cumbia'],
    ['Guardami (Ballabile 2017)','/audio/guardami-ballabile-2017/','2017/05/Cover-cd-Guardami-200x200.jpg',2017,'Ballabile'],
    ['Profumo di Fragole – Reggaeton','/audio/profumo-di-fragole-reggaeton-2019/','2016/09/cdo_immagine0_119_Big-200x200.jpg',2019,'Reggaeton'],
    ['Il Mare lo Sa (Cumbia Romantica)','/audio/il-mare-lo-sa-cumbia-romantica-2016/','2016/04/photodune-14896474-woman1TTeye-in-sky-s-Recovered-200x200.jpg',2016,'Cumbia'],
    ['Voglio un’Emozione (Love Songs)','/audio/voglio-un-emozione-love-songs-2016/','2016/02/voglio-un-emozione-cover-200x200.png',2016,'Ballabile'],
    ['Hello (Kizomba Remix)','/audio/hello-kizomba-remix-2016/','2015/11/Hello-artwork--200x200.jpg',2016,'Kizomba'],
    ['Storie Mix (Storie di Tutti i Giorni Remix)','/audio/storie-di-tutti-i-giorni-remix-2016/','2015/11/12278239_10205116287162621_697310624_n-200x200.jpg',2016,'Remix'],
    ['L’Anno che Verrà – Caro Amico (Moderato Reggae)','/audio/l-anno-che-verra-caro-amico-moderato-reggae-2016/','2015/11/uomo_solo2-200x200.jpg',2016,'Remix'],
    ['Luca Lo Stesso Remix','/audio/luca-lo-stesso-remix/','2015/11/02-Luca-Lo-Stesso-Remix-artwork-1-200x200.jpg',2015,'Remix'],
    ['Senza Fare sul Serio – Malika Mix','/audio/senza-fare-sul-serio-malika-mix/','2015/09/malika-200x200.jpg',2015,'Remix'],
    ['Roma Bangkok – Turn it Up (Club Mashup)','/audio/roma-bangkok-turn-it-up-club-mashup/','2015/08/roma-bangkok-200x200.jpg',2015,'Club'],
    ['Fragile – From the Stars (Kizomba 2015)','/audio/fragile-from-the-stars-kizomba-2015/','2015/07/Copertina-Fragile-Guido-200x200.jpg',2015,'Kizomba'],
    ['Il Ritmo della Vita (Cumbia 2015)','/audio/il-ritmo-della-vita-cumbia-2015/','2015/07/Il-ritmo-della-vita-modificato-200x200.jpg',2015,'Cumbia'],
    ['Fermati un Momento (Ballabile Pop)','/audio/fermati-un-momento-ballabile-pop-2015/','2015/07/Fermati-un-momento-Copertina--200x200.jpg',2015,'Ballabile'],
    ['Mambo Boy','/audio/mambo-boy-2015-download/','2015/07/08-Mambo-boy-artwork-feat-Arcangeli--200x200.jpg',2015,'Latin'],
    ['Alegria – Magico Incanto','/audio/alegria-magico-incanto/','2015/07/alegria-200x200.png',2015,'Latin'],
    ['Indios – Boras (Cumbia 2015)','/audio/indios-boras-cumbia-2015-guido-arcangeli/','2015/07/07-Indios-Boras-artwork--200x200.jpg',2015,'Cumbia'],
    ['Bambola Italiana (Dance 2015)','/audio/guido-arcangeli-bambola-italiana-dance-2015/','2015/07/06-Bambola-italiana-artwork--200x200.jpg',2015,'Dance'],
    ['Dov’è l’Amore (Cumbia 2015)','/audio/dove-lamore-cumbia-2015-download/','2015/05/05-Dovè-lamore-artwork-1-200x200.jpg',2015,'Cumbia'],
    ['Love','/audio/love-mp3-download/','2015/04/Sheet-Music-and-Music-5-200x200.jpg',2015,'Ballabile'],
    ['Tema di Laura','/audio/tema-di-laura-download/','2015/04/11092880_10203959085233296_1087786880_g-200x200.jpg',2015,'Ballabile'],
    ['La Verdad (Bachata 2015)','/audio/la-verdad-bachata-2015-download/','2015/04/61b-PaTA6NL._SL500_AA280_-200x200.jpg',2015,'Bachata'],
    ['Arabo Felice (Cumbia 2015)','/audio/arabo-felice-cumbia-2015-mp3-download/','2015/01/copertina1-200x200.jpg',2015,'Cumbia'],
    ['Sole e Mare (Cumbia)','/audio/sole-e-mare-cumbia-download/','2015/04/61tg8FHWWbL._SS500_-200x200.jpg',2015,'Cumbia'],
    ['Linda Muchachita (Cumbia)','/audio/linda-muchachita-cumbia-download/','2015/04/Untitled-2-200x200.jpg',2015,'Cumbia'],
    ['Love Me Tonight (Cumbia)','/audio/love-me-tonight-cumbia-download/','2015/04/ballaesorridi_vol.1-200x200.jpg',2015,'Cumbia']
  ];

  var tracks = T.map(function (t) {
    var base = t[2].split('/').pop();
    return {
      title: t[0],
      url: OLD + t[1],
      cover: 'covers/' + base,
      coverRemote: OLD + '/wp-content/uploads/' + t[2],
      year: t[3],
      genre: t[4]
    };
  });

  /* -------- SERATE --------
     Aggiorna qui il calendario. date = ISO (YYYY-MM-DD)          */
  var events = [
    { date:'2026-09-12', venue:'Trocadero Village', city:'Viareggio (LU)', note:'Resident DJ — il sabato' },
    { date:'2026-09-19', venue:'Discoteca Sombrero', city:'San Miniato (PI)', note:'Resident DJ' },
    { date:'2026-09-26', venue:'Dancing Grotta Maona', city:'Montecatini Terme (PT)', note:'Balli di gruppo & liscio' },
    { date:'2026-10-03', venue:'Vistamare', city:'Marina di Massa (MS)', note:'Terrazza sul Tirreno — cena su prenotazione' },
    { date:'2026-10-10', venue:'Dancing La Coroncina', city:'Siena', note:'Dalle 22:00' },
    { date:'2026-10-17', venue:'Disco Papillon', city:'Piano di Mommio (LU)', note:'Musica a 360°' }
  ];

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
  var videos = [
    { id:'OEHW02GMoy8', title:'Guido Arcangeli DJ — Live set' },
    { id:'pX9OdUxxvdU', title:'Cumbia — Sala da ballo' },
    { id:'PsgKqaKUNhk', title:'Produzione in studio' }
  ];

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

  return { OLD:OLD, tracks:tracks, events:events, venues:venues, videos:videos, contact:contact, social:social };
})();
