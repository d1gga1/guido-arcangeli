#!/usr/bin/env bash
# ============================================================
#  Scarica logo, copertine e foto dal vecchio sito
#  Uso:  cd nella cartella del sito e lancia:  bash scarica-assets.sh
#  Serve solo una connessione a internet. Nessun altro requisito.
# ============================================================
set -u
# --sostituisci  → sovrascrive anche la grafica generata (foto vere al posto delle immagini d'atmosfera)
FORCE=0
[ "${1:-}" = "--sostituisci" ] && FORCE=1
BASE="https://www.guidoarcangeli.com/wp-content/uploads"
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DIR/assets/img/covers" "$DIR/assets/img/gallery" "$DIR/assets/img/blog"

get () { # get <url> <destinazione>
  if [ -s "$2" ] && [ "$FORCE" = "0" ]; then echo "  · già presente: $(basename "$2")"; return; fi
  if curl -fsSL --max-time 40 -o "$2" "$1"; then echo "  ✓ $(basename "$2")";
  else echo "  ✗ non trovato: $1"; rm -f "$2"; fi
}

echo "→ Logo e ritratto"
get "$BASE/2015/01/guido-arcangeli-logo5.png"        "$DIR/assets/img/logo.png"
get "$BASE/2015/02/GUIDO-PIATTOl-980x400.jpg"        "$DIR/assets/img/guido.jpg"
get "$BASE/2015/04/copertina-guido-per-sito-980x400.png" "$DIR/assets/img/og.jpg"

echo "→ Copertine dei brani"
COVERS="
2023/08/cover-ambrace-a-dream-copia-200x200.jpg
2023/02/sestiamoinsieme-200x200.png
2023/02/02-SEI-IL-MIO-TORMENTO-COVER-QUADRATA--200x200.jpg
2022/08/love-your-life-copertina-200x200.jpg
2020/11/COMUNICATO-NOVALIS-15-11-20-1-200x200.jpg
2020/08/LAURANONCE-200x200.png
2020/03/my-robot-copertina-200x200.jpg
2020/01/mixamare-200x200.jpg
2019/06/medley-dolceamaro-profumo-1440px-200x200.jpg
2019/06/FpIOKZG2-200x200.jpeg
2019/06/COVER-200x200.jpg
2019/05/morire-senza-te-copertina_-1-200x200.jpg
2019/04/gelato-al-cioccolato-new-200x200.jpeg
2019/03/COPERTINA-OK-600X-600-200x200.jpg
2019/03/cd-case-cover-template-200x200.jpg
2019/03/ILVOLO-200x200.jpg
2018/10/cover-avana-200x200.png
2018/06/Front-Cover-prova-200x200.jpg
2018/04/Summer-CD-Cover-Front_final-200x200.jpg
2018/04/cover-template_final-200x200.jpg
2017/10/22855542_10210895343200561_989473401_n-200x200.jpg
2017/08/esercitoselfie-colonnello-cover-1-200x200.jpg
2017/07/strani-amori-copertina-200x200.jpg
2017/07/camminosullasabbia-200x200.jpg
2017/07/Copertina-Sayonara-200x200.jpg
2017/05/Cover-cd-Guardami-200x200.jpg
2016/09/cdo_immagine0_119_Big-200x200.jpg
2016/04/photodune-14896474-woman1TTeye-in-sky-s-Recovered-200x200.jpg
2016/02/voglio-un-emozione-cover-200x200.png
2015/11/Hello-artwork--200x200.jpg
2015/11/12278239_10205116287162621_697310624_n-200x200.jpg
2015/11/uomo_solo2-200x200.jpg
2015/11/02-Luca-Lo-Stesso-Remix-artwork-1-200x200.jpg
2015/09/malika-200x200.jpg
2015/08/roma-bangkok-200x200.jpg
2015/07/Copertina-Fragile-Guido-200x200.jpg
2015/07/Il-ritmo-della-vita-modificato-200x200.jpg
2015/07/Fermati-un-momento-Copertina--200x200.jpg
2015/07/08-Mambo-boy-artwork-feat-Arcangeli--200x200.jpg
2015/07/alegria-200x200.png
2015/07/07-Indios-Boras-artwork--200x200.jpg
2015/07/06-Bambola-italiana-artwork--200x200.jpg
2015/05/05-Dovè-lamore-artwork-1-200x200.jpg
2015/04/Sheet-Music-and-Music-5-200x200.jpg
2015/04/11092880_10203959085233296_1087786880_g-200x200.jpg
2015/04/61b-PaTA6NL._SL500_AA280_-200x200.jpg
2015/01/copertina1-200x200.jpg
2015/04/61tg8FHWWbL._SS500_-200x200.jpg
2015/04/Untitled-2-200x200.jpg
2015/04/ballaesorridi_vol.1-200x200.jpg
"
for p in $COVERS; do get "$BASE/$p" "$DIR/assets/img/covers/$(basename "$p")"; done

echo "→ Galleria fotografica"
G=(
"2015/04/1424464_10200831171357404_1193954454_n1.jpg|01.jpg"
"2015/04/1508619_10201317822723384_978198453_n1-950x631.jpg|02.jpg"
"2015/04/1900109_10201508891819992_725442735_n1.jpg|03.jpg"
"2015/04/1901239_10201482629083440_41336675_n1-950x769.jpg|04.jpg"
"2015/04/10518990_10203047097194165_7226647277675479557_n1.jpg|05.jpg"
"2015/04/1052447_10201325333871158_1830138683_o3-950x957.jpg|06.jpg"
"2016/01/TROCADERO-200x130.jpg|07.jpg"
"2015/01/music-mixer-equalizer-remote-dj-dark-background-1024x768.jpg|08.jpg"
)
for e in "${G[@]}"; do get "$BASE/${e%%|*}" "$DIR/assets/img/gallery/${e##*|}"; done

echo "→ Immagini blog"
get "$BASE/2015/04/featured22-220x166.png" "$DIR/assets/img/blog/cumbia.jpg"
get "$BASE/2023/05/ambrace-a-dream-con-custodia-3-200x130.png" "$DIR/assets/img/blog/produzioni.jpg"
get "$BASE/2015/04/radio-jamaica21-e1428529788589.png" "$DIR/assets/img/blog/radio.jpg"

echo
if [ "$FORCE" = "0" ]; then
  echo "Fatto. Ricarica il sito nel browser."
  echo "Le immagini d'atmosfera già presenti non sono state toccate."
  echo "Per sostituirle con le foto vere del vecchio sito:  bash scarica-assets.sh --sostituisci"
else
  echo "Fatto: le immagini sono state sostituite con quelle del vecchio sito."
fi
