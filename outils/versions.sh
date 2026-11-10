#!/bin/bash
# Met à jour les numéros de version (cache) de salle.css et du service worker. À lancer depuis la racine du dépôt.
OLD=$(grep -o "salle.css?v=[0-9a-f]*" belote.html | head -1 | cut -d= -f2); H=$(sha1sum common/salle.css | cut -c1-8)
[ "$OLD" != "$H" ] && grep -l "salle.css?v=$OLD" *.html sw.js | xargs sed -i "s/salle.css?v=$OLD/salle.css?v=$H/g"
OV=$(grep -o "sdj-[0-9a-f]*" sw.js | head -1 | cut -d- -f2); V=$(cat *.html common/* manifest.webmanifest | sha1sum | cut -c1-10); sed -i "s/$OV/$V/g" sw.js
echo "salle.css $H, appli $V"
