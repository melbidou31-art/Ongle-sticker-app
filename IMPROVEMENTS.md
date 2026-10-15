# Améliorations (boucle horaire)

Chaque amélioration est sur sa propre branche `feat/NN-…`, créée à partir de la précédente
(la première part de `dev`). La branche au plus grand numéro contient donc tout.

## feat/01-tailles-capsules-marques — 14/10/2026

**Ajouté** : onglet *Ongle* → « Capsule du commerce ». On choisit une marque (Apres Gel-X, Kiara Sky Gelly Tips,
Beetles, Modelones, Makartt, Born Pretty), une taille et une longueur (court / moyen / long / très long), et le
contour de l'ongle prend automatiquement la bonne largeur et la bonne longueur. Le réglage manuel reste disponible.

**« Ma boîte »** : pose ta vraie capsule sur le contour à l'écran, ajuste *Largeur* jusqu'à ce qu'ils se superposent,
puis « Enregistrer … mm pour la taille X ». La mesure est mémorisée sur l'appareil, la taille passe en vert
et sera utilisée à la place de l'approximation (pour tous les designs).

**Tester** : ouvrir un design → onglet Ongle → choisir « Apres Gel-X » → cliquer les tailles et les longueurs.

**Limites** : aucune marque ne publie de tableau officiel en mm facilement accessible. Les largeurs par défaut
sont des **approximations** (≈ 1 mm entre deux tailles, 0,5 mm pour les demi-tailles Apres), affichées « approx. »
avec la source des gammes de tailles (apresnail.com, beetlesgel.com, fiches revendeurs). Les longueurs
(20 / 26 / 32 / 38 mm) sont aussi approximatives. → Mesurer sa propre boîte avec « Ma boîte » pour un résultat exact.

## feat/02-profils-clientes-ongle-direct — 15/10/2026

**Ajouté** :
- Écran **👤 Clientes** (depuis la bibliothèque ou l'éditeur) : un profil par cliente avec largeur et longueur de
  ses 10 ongles naturels (main gauche / main droite), pré-rempli avec des valeurs moyennes à corriger.
- Onglet *Ongle* : bascule **Press-on (capsule)** / **Ongle direct**. En ongle direct, on choisit la cliente puis
  le doigt : l'ongle prend ses mesures exactes.
- **Le motif suit la taille** : en changeant de doigt (ou de taille de capsule en press-on), le motif, sa position
  et le texte sont mis à l'échelle proportionnellement — plus besoin de le recaler à chaque ongle.

**Tester** : 👤 Clientes → « + Cliente » → modifier quelques largeurs → Enregistrer → ouvrir un design → onglet
Ongle → « Ongle direct » → choisir la cliente → cliquer les doigts.

**Limites** : profils stockés sur l'appareil uniquement (localStorage). Les valeurs par défaut d'un nouveau profil
sont des moyennes approximatives. La forme reste celle choisie dans l'éditeur (pas encore de forme par doigt).

## feat/03-planche-10-doigts-tracage — 15/10/2026

**Ajouté** :
- **Set 10 doigts en press-on** : onglet *Ongle* → capsule du commerce → « Créer un set 10 doigts ». Une taille par
  doigt (main gauche / main droite), pré-remplie à partir de la taille du pouce avec l'écart habituel d'un set
  (pouce, index +4, majeur +3, annulaire +4, auriculaire +7 — approx.), modifiable doigt par doigt.
- **Navigation en mode traçage** : si le design a un set (press-on) ou une cliente (ongle direct), une barre
  ◀ doigt ▶ apparaît sous l'en-tête. Chaque doigt s'affiche à sa taille réelle avec le motif mis à l'échelle.
  Elle reste utilisable quand le design est verrouillé : on enchaîne les 10 capsules sans retourner dans l'éditeur.
- **Vue « Main entière »** : les 5 ongles d'une main côte à côte à taille réelle (pratique sur tablette).

**Tester** : ouvrir un design → Ongle → Press-on → choisir une marque et une taille → « Créer un set 10 doigts »
→ Tracer → ◀ ▶ et « Main entière ». En ongle direct : choisir une cliente puis Tracer.

**Limites** : sur un téléphone, la main entière déborde souvent de l'écran (5 ongles ≈ 60–75 mm) — prévue pour
tablette. Les écarts de tailles par défaut du set sont approximatifs. Déplacer le motif (déverrouillé) depuis un
doigt le déplace pour tout le set.

## feat/04-motif-seul-sans-ongle — 15/10/2026 (demande de l'utilisatrice)

**Changé** : une image importée s'affiche désormais **seule, directement sur le quadrillage**, sans contour ni
découpe d'ongle (nouvelle forme « Aucun (motif seul) », par défaut pour les nouveaux designs, motif à 20 mm de
large). Le contour reste disponible : choisir une forme dans l'onglet *Ongle*, ou une capsule du commerce
(→ ballerine) ou une cliente en ongle direct (→ ovale) l'active automatiquement.

**Tester** : importer une image → elle apparaît seule sur la grille ; onglet Ongle → « Ballerine » pour revoir le
contour, « Aucun » pour le retirer.

**Limites** : les designs déjà créés gardent leur forme d'ongle (pas de migration).

## feat/05-mesure-ongle-ecran — 15/10/2026

**Ajouté** : une **règle à l'écran** (taille réelle grâce au calibrage). On pose l'ongle ou la capsule sur l'écran
et on fait glisser des repères roses sur ses bords ; la mesure s'affiche au demi-millimètre.
- Fiche cliente : bouton 📏 sur chaque doigt → mesure largeur + longueur et remplit la ligne.
- Capsule du commerce : « 📏 Mesurer la capsule » → mesure la largeur, l'enregistre dans « Ma boîte » pour
  cette taille et l'applique au design.

**Tester** : 👤 Clientes → + Cliente → 📏 sur un doigt → déplacer les repères → Valider.

**Limites** : la précision dépend du calibrage de l'écran (📏 Calibrer l'écran). Un doigt posé à plat masque
une partie de l'écran : les repères dépassent en haut/bas pour rester visibles.

## feat/06-calque-couleurs-origine — 15/10/2026

**Ajouté** : **calque des couleurs d'origine** sous le trait, pour savoir quelle couleur peindre où sans regarder
la photo à côté.
- Onglet *Motif* : « 🎨 Afficher les couleurs d'origine sous le trait » + curseur d'intensité (10–100 %).
- Mode traçage : bouton 🎨 pour basculer instantanément trait seul ↔ trait + couleurs (même verrouillé).
- Le fond blanc de la photo devient transparent (fusion « produit ») : le quadrillage reste visible.

**Tester** : ouvrir un design importé en couleur → Motif → cocher 🎨 → Tracer → bouton 🎨.

**Limites** : un fond de photo foncé ou coloré reste visible (seul le blanc disparaît). Les designs créés avant
cette version ont le calque désactivé par défaut.

## feat/07-export-taille-reelle — 15/10/2026

**Ajouté** : onglet **Export** dans l'éditeur.
- **SVG en millimètres** : s'imprime exactement à la taille réelle (impression « 100 % / taille réelle »).
- **PNG 300 dpi** avec la résolution inscrite dans le fichier (chunk pHYs) pour que logiciels d'impression et
  imprimantes à stickers respectent les dimensions.
- Options : planche complète 10 doigts (si set ou cliente), couleurs d'origine, contour des ongles, **miroir**
  pour water decals / papier transfert.

**Tester** : ouvrir un design → Export → Télécharger SVG / PNG 300 dpi → ouvrir le fichier et imprimer à 100 %.

**Limites** : sur iPhone, le téléchargement ouvre parfois le fichier dans un nouvel onglet (à enregistrer via
Partager). Le module d'export est chargé à la demande pour garder l'app légère.

## feat/08-bibliotheque-motifs — 15/10/2026

**Ajouté** : bouton **✨ Motifs** dans la bibliothèque : 14 motifs au trait prêts à tracer (cœur, étoile, lune &
étoiles, fleur, marguerite, papillon, nœud, éclair, goutte, feuille, flocon, toile d'araignée, ligne French,
chevrons). Un clic crée un design comme une image importée : on peut ensuite le redimensionner, l'appliquer à
une capsule ou une cliente, le tracer et l'exporter.

**Tester** : bibliothèque → ✨ Motifs → cliquer un motif → l'éditeur s'ouvre avec le motif seul sur la grille.

**Limites** : motifs simples dessinés à la main (vectoriels, 100 × 100) ; la « Ligne French » donne la courbe du
sourire (trait plein + repère pointillé) à adapter à la largeur de l'ongle avec « Taille du motif ».

## feat/09-affichage-tracage — 15/10/2026

**Ajouté** : bouton **⚙** en mode traçage (utilisable verrouillé), réglages mémorisés sur l'appareil :
- **Couleur du trait** : noir, rouge, bleu, blanc — le rouge/bleu se voient mieux à travers une capsule teintée
  ou un gel de couleur.
- **Fond** : quadrillé (par défaut), **blanc uni** (lumière maximale, sans grille qui gêne), **sombre** (contraste
  maximal ; un trait noir devient automatiquement blanc).
- **Main droite en miroir** (si set 10 doigts ou cliente) : motifs symétriques entre les deux mains.

**Tester** : Tracer un design → ⚙ → changer trait / fond ; avec un set : cocher « Main droite en miroir » puis ▶
jusqu'aux doigts de la main droite.

**Limites** : sur fond sombre, le calque couleurs n'est plus fusionné (le fond blanc de la photo réapparaît en
transparence) — le calque couleurs est plus lisible sur fond clair.

## feat/10-gomme-nettoyage-trait — 15/10/2026

**Ajouté** : **🧽 Gomme** dans l'onglet *Motif* pour nettoyer le trait (taches, bouts de fond, détails inutiles
qu'une photo convertie en contours laisse souvent) avant de tracer.
- On frotte directement sur le motif dans l'éditeur ; taille de la gomme réglable (0,5 à 8 mm).
- **↶ Annuler** (dernier coup de gomme) et **Tout restaurer**.
- Les coups de gomme sont mémorisés en coordonnées relatives à l'image : ils restent au bon endroit si l'on
  déplace, agrandit, tourne ou met le motif en miroir, et sont réappliqués quand on change le seuil ou l'épaisseur.

**Tester** : ouvrir un design → Motif → 🧽 Gomme → frotter sur une partie du trait → ↶ Annuler.

**Limites** : la gomme efface le trait uniquement (pas le calque couleurs d'origine). Pendant que la gomme est
activée, le motif ne se déplace plus au doigt (désactiver la gomme pour le repositionner).

## feat/11-sauvegarde-transfert-donnees — 15/10/2026

**Ajouté** : bouton **💾 Sauvegarde** dans la bibliothèque.
- **⬇ Sauvegarder** : un fichier `ongle-trace-sauvegarde-AAAA-MM-JJ.json` avec tous les designs (images
  comprises), les fiches clientes, les mesures « Ma boîte » et les réglages d'affichage du traçage.
- **⬆ Restaurer** : fusionne le fichier avec ce qui est déjà sur l'appareil (même identifiant = remplacé, le reste
  est conservé). Sert aussi à **transférer** ses designs et clientes du PC vers le téléphone (ou l'inverse).
- Un fichier qui n'est pas une sauvegarde Ongle Trace est refusé avec un message clair.

**Pourquoi** : tout est stocké uniquement dans le navigateur ; vider les données du site ou changer de téléphone
faisait tout perdre.

**Tester** : 💾 Sauvegarde → Sauvegarder → supprimer un design → Restaurer avec le fichier → il réapparaît.

**Limites** : le calibrage de l'écran n'est pas inclus (propre à chaque appareil — à refaire). Le fichier peut être
lourd avec beaucoup de designs (≈ 40 Ko par design). Pas de sauvegarde automatique dans le cloud.

## feat/12-calques-plusieurs-motifs — 15/10/2026

**Ajouté** : **plusieurs motifs sur un même ongle** (ex. Ghostface + roses + nœud). Onglet *Calques* (ex-*Position*) :
- « + Motif » (bibliothèque intégrée) ou « + Image » (import) ajoute un calque.
- Puces « Principal / 2. Cœur / … » pour choisir le calque actif : c'est lui qu'on déplace au doigt (glisser /
  pincer) et que règlent les curseurs Taille et Rotation ; un cadre rose pointillé le signale dans l'éditeur.
- « Retirer ce calque ».
- Les calques suivent partout : mise à l'échelle par doigt/capsule, set 10 doigts, traçage (couleur du trait,
  fond, couleurs d'origine), export SVG/PNG.

**Tester** : ouvrir un design → Calques → + Motif → choisir un cœur → le glisser à côté du motif principal →
Tracer.

**Limites** : la gomme et les réglages de trait (seuil, épaisseur) ne s'appliquent qu'au motif principal ; le miroir
s'applique à tous les motifs, chacun sur place. En mode « motif seul », la zone affichée est calée sur le motif
principal (un calque éloigné peut déborder du cadre à l'export).

## feat/13-reperes-axe-marge-securite — 15/10/2026

**Ajouté** : **repères de placement**, dans l'éditeur (onglet *Ongle*) et en traçage (⚙) :
- **Axe central + mi-hauteur** en pointillés dorés : centrer le motif et garder la symétrie.
- **Marge de sécurité** (bande rose, 0 à 2,5 mm, 1 mm par défaut) le long de la cuticule et des parois, à
  l'intérieur de l'ongle : zone à laisser sans produit en pose directe (et repère de bord pour les capsules).
- Réglage commun à l'éditeur et au traçage, mémorisé sur l'appareil.

**Tester** : ouvrir un design avec une forme d'ongle → Ongle → cocher « Repères » → régler la marge → Tracer
(⚙ → Repères pour les masquer/afficher).

**Limites** : en mode « motif seul » (sans ongle), seul l'axe central est affiché. Les repères ne sont pas
exportés (aide visuelle uniquement).

## feat/14-bibliotheque-dupliquer-rechercher — 15/10/2026

**Ajouté** dans la bibliothèque :
- **⧉ Dupliquer** un design (copie indépendante « … (copie) ») : décliner un même motif pour une autre cliente,
  une autre marque/taille de capsule, ou tester une variante sans abîmer l'original.
- **Recherche** (insensible aux majuscules et aux accents) sur le nom et sur l'étiquette du design.
- **Tri** : récents ou nom A→Z.
- **Étiquette** sur chaque carte : à quoi sert le design — « Kiara Sky moyen · set 10 », « Ongle direct · Léa »,
  « Motif seul · 20 mm », « … · 3 motifs » (remplace l'identifiant technique).

**Tester** : bibliothèque → ⧉ sur un design → la copie apparaît en tête ; taper une marque ou un nom de cliente
dans la recherche ; changer le tri.

**Limites** : pas de dossiers ni de favoris ; la recherche ne porte pas sur le contenu de l'image.

## feat/15-recadrage-image — 15/10/2026

**Ajouté** : **✂ Recadrer** dans l'onglet *Motif* : on entoure la partie utile de la photo de référence (sans
doigts, fond ni texte) avec un cadre déplaçable aux coins étirables ; le reste est assombri pendant le réglage.
- Le trait, le calque couleurs d'origine et la miniature n'utilisent plus que la zone gardée.
- Le motif garde la même échelle à l'écran (la taille affichée suit la part d'image conservée).
- Non destructif : « ✂ Recadrer » → « Image entière » revient à la photo complète ; la gomme reste alignée.

**Tester** : importer une photo → Motif → ✂ Recadrer → tirer un coin → Valider → le motif ne montre plus que la
zone choisie ; recommencer avec « Image entière » pour annuler.

**Limites** : cadre rectangulaire uniquement (pas de détourage libre) ; s'applique au motif principal, pas aux
calques ajoutés.

## feat/16-mode-immersif-tracage — 15/10/2026

**Ajouté** : **mode immersif** en traçage : une fois le design verrouillé, l'en-tête, la barre des doigts et les
options disparaissent au profit d'une fine barre (🔓 Maintenir · ◀ doigt / taille ▶ · 🎨). Sur un téléphone
(375 × 812), la zone de traçage passe de 550 à 756 px de haut (+37 %), et il y a moins de boutons à portée
du pinceau. Déverrouiller (appui long) fait revenir l'interface complète.
- Activé par défaut sur écran tactile, désactivé sur ordinateur ; réglable dans ⚙ « Mode immersif une fois
  verrouillé » (mémorisé).

**Tester** : sur téléphone (ou vue mobile), Tracer un design → la barre fine apparaît ; ◀ ▶ si set 10 doigts ;
maintenir 🔓 pour revenir.

**Limites** : en vue « Main entière », la barre fine n'affiche pas la navigation (déverrouiller pour changer de
main).

## feat/17-guide-integre-rappel-calibrage — 15/10/2026

**Ajouté** :
- **❓ Guide** (bibliothèque) : la marche à suivre en 6 étapes — calibrer, créer un design, press-on, ongle
  direct, tracer, imprimer/sauvegarder — avec les bons boutons à chaque étape.
- **Rappel de calibrage** : tant que l'écran de cet appareil n'a jamais été calibré, un bandeau rose le signale
  dans la bibliothèque (« les tailles en mm sont approximatives ») avec un bouton 📏 Calibrer. Il disparaît
  dès le premier calibrage.

**Tester** : sur un appareil jamais calibré → bandeau visible → Calibrer → Valider → bandeau disparu ;
❓ Guide pour lire la marche à suivre.

**Limites** : le guide est un texte fixe (pas de tutoriel interactif).

## feat/18-gabarit-french-sourire — 15/10/2026

**Ajouté** : **gabarit French** (onglet *Ongle*, dès qu'une forme d'ongle est choisie) : la ligne du sourire tracée
en vecteur, à l'intérieur de l'ongle, à décalquer au pinceau.
- Styles : **classique**, **en V**, **oblique**, **sourire profond** ; option **double French** (2e ligne en
  pointillés, 1,2 mm au-dessus).
- Réglages en millimètres : **hauteur du bord libre** (au centre) et **profondeur du sourire** (remontée le long
  des parois). Comme les cotes sont en mm, la ligne s'adapte automatiquement à la largeur de chaque doigt et de
  chaque capsule (set 10 doigts, ongle direct) — même hauteur de bord blanc sur tout le set.
- Suit la couleur du trait et le fond du mode traçage ; incluse dans l'export SVG/PNG.

**Tester** : design avec une forme (ou une capsule) → Ongle → cocher « Gabarit French » → changer le style et les
réglages → Tracer → ◀ ▶ : la ligne garde la même hauteur sur chaque doigt.

**Limites** : la ligne suit la forme 2D de l'ongle vu de dessus (pas la courbure C). La hauteur est mesurée
depuis le bout de la capsule/ongle tel que dessiné.

## feat/19-mes-motifs-perso — 15/10/2026 (demande de l'utilisatrice)

**Ajouté** : **⭐ Mes motifs** — enregistrer ses propres images comme motifs, pour les retrouver et les réutiliser
aussi souvent que nécessaire.
- Depuis l'éditeur (onglet *Motif*) : **« ⭐ Enregistrer dans Mes motifs »** garde le trait **tel qu'il est
  affiché** (recadrage et coups de gomme compris) + la photo couleur pour le calque « couleurs d'origine ».
- Depuis la bibliothèque : ✨ Motifs → **« + Ajouter une image »** pour enregistrer directement une image.
- ✨ Motifs affiche maintenant **Mes motifs en premier**, puis les motifs intégrés ; un clic crée un nouveau design.
- Disponible aussi dans l'onglet *Calques* (« + Motif ») pour combiner ses motifs sur un même ongle.
- ✕ sur une vignette pour retirer un motif perso (les designs déjà créés avec ne sont pas touchés).
- Inclus dans la **💾 Sauvegarde** (et restaurés avec).

**Tester** : ouvrir un design → Motif → ⭐ Enregistrer dans Mes motifs → revenir à la bibliothèque → ✨ Motifs → le
motif apparaît sous « Mes motifs » → cliquer dessus.

**Limites** : un motif perso est enregistré comme dessin au trait (noir sur blanc) : changer le seuil ou passer en
« Photo → contours » ne retrouve pas la photo d'origine (garder le design d'origine pour ça). Recadrer un design
créé depuis un motif perso masque ses couleurs d'origine. Stockage sur l'appareil (≈ 50–150 Ko par motif).
