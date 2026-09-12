# Sito Guido Arcangeli DJ — nuova versione

## 0. Prototipi di navigazione (nuovo)

Apri **`prototipi.html`** per confrontare quattro home con impianti di
navigazione diversi dallo scroll verticale classico. Stessi contenuti, stesso
`data.js`: cambia solo **come si naviga**.

| File | Concept |
|---|---|
| `index-mixer.html` | **La consolle** — sei canali con fader: alzi il fader, il canale si apre |
| `index-radio.html` | **Il sintonizzatore** — ogni sezione è una stazione FM, con fruscio fra una e l'altra |
| `index-disco.html` | **Il disco** — navigazione circolare, giri il vinile di solco in solco |
| `index-notte.html` | **La serata** — dalle 21:00 all'ultimo ballo: luci, BPM e sala cambiano con l'ora |

Sotto gli 880px di larghezza (telefoni) tutti e quattro tornano a uno scroll
verticale normale, così il pubblico meno smanettone non resta bloccato.

Sono **file a parte**: il sito attuale (`index.html` e le pagine interne) non
è stato toccato. File aggiunti: i quattro `index-*.html`, `prototipi.html`,
`assets/css/proto.css`, `assets/js/proto-shared.js`.
Per tornare indietro basta cancellarli.


Sito statico, senza WordPress e senza dipendenze esterne: si carica su
qualsiasi hosting copiando la cartella così com'è.

## 1. Immagini

**Il sito è già completo: nessun riquadro vuoto.** Tutte le immagini di
atmosfera (luci di scena, pubblico, vinile) sono generate su misura e incluse
nella cartella `assets/img/`.

Restano da recuperare solo il **logo** e le **50 copertine dei brani**, che
stanno sul vecchio dominio. Apri il Terminale, entra in questa cartella e lancia:

```bash
bash scarica-assets.sh
```

Non tocca le immagini già presenti. Se invece vuoi rimpiazzare la grafica
generata con le foto vere del vecchio sito:

```bash
bash scarica-assets.sh --sostituisci
```

Quando avrai foto migliori basta sovrascrivere i file, i nomi restano questi:

| File | Cosa sostituisce |
|---|---|
| `assets/img/guido.jpg` | ritratto/atmosfera nella sezione "Chi sono" (verticale 4:5) |
| `assets/img/gallery/01…08.jpg` | le 8 foto della galleria scorrevole (verticali 3:4) |
| `assets/img/og.jpg` | anteprima per social e WhatsApp (1200×630) |
| `assets/img/blog/*.jpg` | copertine degli articoli |
| `assets/img/vinyl.jpg` | il disco nel blocco "Brano del momento" |

Anche se un file dovesse mancare, il sito non mostra mai un buco: ogni
contenitore ha uno sfondo di sicurezza.

## 2. Struttura

```
index.html        home one-page (intro 3D, hero, bio, produzioni, serate, locali, media, contatti)
archivio.html     tutti i 50 brani, con filtri per genere e ricerca
biografia.html    storia completa + linea del tempo
news.html         blog, video YouTube, galleria foto
scarica-assets.sh script per recuperare le immagini
assets/css/style.css   tutto lo stile
assets/js/data.js      >>> CONTENUTI: brani, serate, locali, video, contatti
assets/js/gl.js        motore WebGL (intro a particelle + sfondo hero)
assets/js/main.js      animazioni, scroll, filtri, form
```

## 3. Come aggiornare i contenuti

Apri **`assets/js/data.js`** con un editor di testo. Trovi tre blocchi:

**Serate** — aggiungi o togli righe, la data va in formato `AAAA-MM-GG`.
Il sito mostra solo le date future e le ordina da solo.

```js
{ date:'2026-11-08', venue:'Nome del locale', city:'Città (PR)', note:'Dalle 22:00' },
```

**Brani** — ogni riga è `[ titolo, link, copertina, anno, genere ]`.

**Locali**, **video YouTube** (basta l'ID del video) e **contatti**: stessa logica.

Telefono ed email si cambiano in un punto solo (blocco `contact`) e si
aggiornano su tutte le pagine.

## 4. Cosa fa il sito

- Intro con il nome che si compone da ~9.000 particelle in WebGL (una volta a
  sessione, con pulsante "salta intro")
- Transizione a tendina fra una pagina e l'altra
- Titoli che si "decodificano" carattere per carattere quando entrano in campo
- Vinile 3D animato nell'hero: gira da solo, accelera con lo scroll, testo
  circolare in rotazione contraria e braccio del giradischi che oscilla
- Galleria fotografica orizzontale ancorata: scorre in orizzontale mentre
  scendi (su mobile diventa uno swipe con snap)
- Spotlight che segue il cursore, riflesso sulle card, inclinazione leggera
  dei blocchi in base alla velocità di scroll
- Sfondo hero in WebGL: nebulosa animata + campo di particelle 3D che reagisce
  al mouse e allo scroll
- Scroll fluido, rivelazioni progressive, parallasse, cursore personalizzato,
  pulsanti magnetici, carte brano con inclinazione 3D, marquee a velocità
  variabile, contatori animati
- Archivio con filtro per genere e ricerca istantanea
- Form contatti che apre l'email già compilata; pulsanti WhatsApp diretti
- Responsive fino a 360px, con animazioni ridotte su mobile
- Rispetta `prefers-reduced-motion` (chi ha le animazioni disattivate a sistema
  vede il sito statico)
- Dati strutturati Schema.org per Google, meta Open Graph per le condivisioni

## 5. Pubblicazione

Carica tutta la cartella nella root del dominio via FTP, oppure trascinala su
Netlify / Vercel / Cloudflare Pages. Nessun database, nessun PHP.

**Nota sui font:** il sito usa Anton, Space Grotesk e JetBrains Mono da Google
Fonts. Se preferisci non dipendere da Google, si possono scaricare in locale —
basta chiedermelo.
