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

## feat/20-favoris-collections — 15/10/2026

**Ajouté** dans la bibliothèque :
- **★ Favoris** : étoile sur chaque carte pour marquer les designs les plus utilisés.
- **📁 Collections** : ranger un design dans une collection (Halloween, Mariage, Noël, une cliente…) ; la
  boîte de saisie rappelle les collections existantes ; vide = retirer de la collection.
- **Filtres** en haut de la liste : Tous · ★ Favoris · 📁 chaque collection (affichés dès qu'il y en a).
- La recherche porte aussi sur le nom de collection ; l'étiquette de la carte affiche la collection.
- Ranger ou mettre en favori ne change pas l'ordre « Récents ». Inclus dans la 💾 sauvegarde (champs du design).

**Tester** : ☆ sur une carte → filtre « ★ Favoris » ; 📁 → taper « Halloween » → filtre « 📁 Halloween ».

**Limites** : un design appartient à une seule collection ; pas de renommage groupé d'une collection (changer
chaque design).

## feat/21-forme-ongle-par-cliente — 15/10/2026

**Ajouté** : **forme habituelle des ongles** dans chaque fiche cliente (ovale, carré, amande, ballerine,
stiletto). En mode *Ongle direct*, choisir la cliente applique automatiquement sa forme (au lieu d'un ovale
pour tout le monde) ; la forme est rappelée sous les doigts et dans la liste des clientes.
- Changer de doigt garde une forme modifiée à la main dans l'éditeur (pour un essai ponctuel).
- Les fiches existantes sans forme utilisent l'ovale.

**Tester** : 👤 Clientes → ouvrir une cliente → « Forme habituelle » → Carré → Enregistrer → ouvrir un design →
Ongle → Ongle direct → choisir la cliente : le contour passe en carré.

**Limites** : une seule forme par cliente (pas de forme différente par doigt).

## feat/22-export-pdf-a4 — 15/10/2026

**Ajouté** : onglet *Export* → **« PDF à imprimer (A4) »** (bouton principal). La planche (design seul ou set 10
doigts, avec les mêmes options : couleurs, contour, miroir water decals) est placée sur une page A4 avec 10 mm de
marge, **à sa taille exacte en millimètres** (300 dpi). Paysage automatiquement si elle ne tient qu'en largeur,
page agrandie si elle dépasse l'A4. C'est le format le plus simple à imprimer depuis un téléphone (ouvrir →
imprimer à 100 %). PDF écrit directement par l'app, sans bibliothèque supplémentaire (≈ 100 Ko pour un set).
SVG et PNG 300 dpi restent disponibles.

**Tester** : ouvrir un design → Export → PDF à imprimer (A4) → ouvrir le fichier → imprimer en « Taille réelle /
100 % » → mesurer une capsule à la règle.

**Limites** : la structure du PDF a été vérifiée (index, objets, image JPEG), mais son rendu n'a pas pu être
contrôlé visuellement dans l'environnement de développement → à confirmer en ouvrant/imprimant un fichier.
L'image est en JPEG (pas de transparence, fond blanc).

## feat/23-texte-polices-contour — 15/10/2026

**Ajouté** dans l'onglet *Texte* (prénoms, initiales, dates…) :
- **6 styles de police** : élégante, calligraphie, manuscrite, moderne, bâton, gothique — uniquement des polices
  déjà présentes sur les appareils (fonctionne hors-ligne ; chaque style a des équivalents iPhone / Android /
  Windows).
- **Contour seul** : les lettres sont dessinées en trait, pour décalquer leur bord puis les remplir au pinceau.
- **Position horizontale**, **rotation** (−90° à +90°) et **espacement des lettres** en plus de la taille et de la
  hauteur. En mode « motif seul », le placement se fait par rapport au motif.
- Le texte suit la mise à l'échelle par doigt / capsule (position horizontale comprise), la couleur du trait,
  le miroir et les exports.

**Tester** : ouvrir un design → Texte → taper un prénom → Calligraphie → cocher Contour seul → régler rotation.

**Limites** : le rendu exact d'un style dépend des polices de l'appareil (Snell Roundhand sur iPhone, Segoe Script
sur Windows…). Le texte est maintenant centré verticalement sur sa position : un texte existant peut remonter
d'environ un tiers de sa taille. Dans l'export SVG, la police doit exister sur l'appareil qui imprime (le PDF et
le PNG, eux, figent le rendu).

## feat/24-fiabilite-stockage — 15/10/2026

**Fiabilité** (les données ne vivent que dans le navigateur de l'appareil) :
- **Stockage protégé** : au démarrage, l'app demande au navigateur de ne pas effacer ses données quand l'appareil
  manque de place (accordé en général quand l'app est installée sur l'écran d'accueil ou souvent utilisée).
- **Alerte si un enregistrement échoue** (stockage plein…) : bandeau rouge visible sur tous les écrans, au lieu
  de perdre le travail en silence ; il disparaît dès qu'un enregistrement réussit.
- **💾 Sauvegarde** affiche l'espace utilisé et si les données sont protégées (sinon : conseil de sauvegarder /
  d'installer l'app).
- **Ouvrir un design sans le modifier ne le fait plus remonter** dans « Récents » (il n'est plus réenregistré).

**Tester** : ouvrir un design puis revenir sans rien changer → l'ordre ne bouge pas ; 💾 Sauvegarde → ligne
« Espace utilisé ».

**Limites** : la protection dépend du navigateur (Safari iOS l'accorde surtout aux apps installées sur l'écran
d'accueil) ; la sauvegarde 💾 reste la vraie sécurité.

## feat/25-annuler-retablir — 15/10/2026

**Ajouté** : **↶ Annuler / ↷ Rétablir** dans l'en-tête de l'éditeur, pour toutes les modifications : déplacement
ou zoom du motif, curseurs, forme, capsule, cliente, calques ajoutés ou retirés, French, texte, recadrage, gomme…
- Une étape regroupe les changements faits sans pause (un glissé ou un mouvement de curseur = une seule étape).
- Raccourcis clavier sur ordinateur : **Ctrl+Z** / **Ctrl+Y** (ou Ctrl+Maj+Z), sauf pendant la saisie de texte.
- Jusqu'à 50 étapes ; les boutons sont grisés quand il n'y a rien à annuler/rétablir.

**Tester** : ouvrir un design → Calques → changer la rotation, puis la taille → ↶ deux fois → ↷.

**Limites** : l'historique se vide en quittant l'éditeur (il n'est pas enregistré) ; les modifications faites en
mode traçage (déplacement déverrouillé) n'y figurent pas.

## feat/26-suivi-doigts-traces — 15/10/2026

**Ajouté** en mode traçage, pour les sets 10 doigts (press-on) et les clientes (ongle direct) :
- Bouton **« ✓ Fait · n/10 »** : marque le doigt affiché comme tracé et **passe directement au prochain doigt
  pas encore tracé** (plus besoin de compter ni de se demander où on en est).
- Un doigt déjà tracé est signalé « ✓ » dans son nom ; réappuyer le remet à faire ; **↺** recommence le suivi.
- Disponible aussi dans la fine barre du mode immersif (utilisable verrouillé).
- Suivi mémorisé pendant la séance (onglet ouvert), par design.

**Tester** : Tracer un design avec un set → ✓ Fait plusieurs fois → ◀ pour revenir sur un doigt tracé.

**Limites** : le suivi s'efface en fermant l'app (pensé pour une séance de pose) ; pas de suivi en vue
« Main entière ».

## feat/27-crayon-retouche-trait — 15/10/2026

**Ajouté** : **✏ Crayon** à côté de la 🧽 Gomme (onglet *Motif*) pour **ajouter du trait** : refermer un contour
coupé, compléter un détail perdu à la conversion d'une photo, renforcer une ligne trop fine.
- Épaisseur réglable (0,2 à 3 mm) ; gomme et crayon s'utilisent dans l'ordre (on peut gommer un trait de crayon).
- Comme la gomme : retouches stockées par rapport à l'image (suivent déplacement, rotation, miroir, recadrage),
  réappliquées quand on change le seuil ; « ↶ Dernière retouche » et « Tout restaurer » ; aussi annulables avec ↶.
- Pris en compte partout : traçage, export, « ⭐ Mes motifs ».

**Tester** : ouvrir un design → Motif → ✏ Crayon → dessiner sur le motif → ↶ Dernière retouche.

**Limites** : trait noir uniforme (pas de pression) ; un trait tracé hors de l'image (dans la marge) n'est pas
conservé ; s'applique au motif principal, pas aux calques ajoutés.

## feat/28-partage-apercu-cliente — 15/10/2026

**Ajouté** : onglet *Export* → **📤 Partager un aperçu à la cliente**. Crée une image nette du design (ou de la
planche 10 doigts), **avec les couleurs d'origine** et les contours, jamais en miroir, et ouvre le **menu de
partage du téléphone** (WhatsApp, Instagram, SMS, mail…) avec le texte « Proposition de design : … » — pour
faire valider le design avant la pose. Sur ordinateur (ou si le partage de fichiers n'est pas possible), l'image
est téléchargée avec un message d'explication.

**Tester** : sur téléphone, ouvrir un design → Export → 📤 Partager → choisir WhatsApp.

**Limites** : le partage direct dépend du navigateur (Safari iOS et Chrome Android le permettent, la plupart des
navigateurs d'ordinateur non → téléchargement) et demande une connexion https (OK une fois en ligne sur Vercel).

## feat/29-zoom-editeur — 15/10/2026

**Ajouté** : **zoom de l'éditeur** (boutons 1:1 · ×2 · ×3 · ×4 en haut à droite de la zone de travail). À taille
réelle, un ongle ne fait que ~14 mm sur l'écran : zoomer rend la gomme, le crayon, le placement des calques et
du texte bien plus précis. Les déplacements restent exacts en millimètres quel que soit le zoom ; la zone défile
quand le motif dépasse. Le **mode traçage reste toujours en 1:1** (taille réelle).

**Tester** : ouvrir un design → ×3 → 🧽 Gomme ou ✏ Crayon sur un petit détail → 1:1 pour revenir.

**Limites** : quand le motif occupe toute la zone zoomée, faire défiler depuis les bords quadrillés (glisser sur
le motif le déplace / gomme / dessine) ; le zoom n'est pas mémorisé d'une ouverture à l'autre.

## feat/30-ongles-accent — 15/10/2026

**Ajouté** : **💅 Ongles accent** (onglet *Ongle*, dès qu'il y a un set 10 doigts ou une cliente) : pour chaque
doigt, « Même motif » ou **le motif d'un autre design de la bibliothèque** — ex. annulaires avec une étoile ou des
paillettes, initiale sur le pouce. Le motif emprunté (trait, couleurs, calques, texte) est mis à la taille de
l'ongle ; la forme, la capsule/cliente, le French et le miroir restent ceux du set.
- Pris en compte en **traçage** (◀ ▶ et vue « Main entière ») et dans l'**export de la planche** (PDF / PNG / SVG)
  et le **partage** d'aperçu.

**Tester** : avoir au moins deux designs → ouvrir celui avec un set → Ongle → 💅 Ongles accent → Annulaire G/D :
choisir l'autre design → Tracer → Main entière.

**Limites** : l'ongle accent reprend le motif du design choisi tel qu'il est (on le modifie dans son propre
design) ; il ne se déplace pas depuis le mode traçage ; si le design choisi est supprimé, le doigt reprend le
motif du set.

## feat/31-formes-rond-carre-stiletto — 15/10/2026 (retour de test)

**Corrigé / ajouté** :
- Nouvelle forme **Rond** (bout en demi-cercle) ; l'**Ovale** a maintenant un vrai bout en ellipse, plus allongé.
- **Carré** à coins nets + nouvelle forme **Carré arrondi** (le carré précédent ressemblait à un carré arrondi).
- **Stiletto redessiné** : flancs presque droits qui se resserrent dès le premier tiers jusqu'à une pointe fine
  (l'ancien ressemblait à une amande).
- **Longueur selon la forme** : à longueur commerciale égale, une capsule stiletto (×1,25) ou amande (×1,12) est
  plus longue qu'une ballerine, un rond/carré un peu plus court (×0,95). Changer de forme avec une capsule du
  commerce recalcule la longueur.

**Tester** : Ongle → Press-on → une marque + taille → cliquer Stiletto, Rond, Carré arrondi…

**Limites** : les coefficients de longueur par forme sont approximatifs (pas de données officielles) — mesurer
ses vraies capsules (Ma boîte, marques perso à venir) pour l'exactitude.

## feat/32-longueurs-xs-xl — 15/10/2026 (retour de test)

**Changé** : les longueurs de capsules sont notées comme des tailles **XS · S · M · L · XL · XXL** (et non plus
« court / moyen… »), avec deux longueurs courtes en plus :
XS extra court (14 mm) · S très court (17) · M court (20) · L moyen (26) · XL long (32) · XXL très long (38) —
×coefficient de la forme (feat/31). La longueur choisie s'applique aux 10 doigts du set.
Les designs existants sont convertis automatiquement (court → M, moyen → L, long → XL, très long → XXL).

**Tester** : Ongle → Press-on → une marque → boutons XS à XXL.

**Limites** : longueurs approximatives (cuticule → bord libre) ; pour une longueur exacte, régler « Longueur »
à la main ou utiliser une marque perso (à venir).

## feat/33-panneau-defilant-image-visible — 15/10/2026 (retour de test)

**Corrigé** : en réglant le sourire French (ou le texte, ou tout réglage en bas du panneau), l'image n'était plus
visible. Désormais **l'image reste fixe en haut de l'éditeur** (≈ 42 % de l'écran) et **seul le panneau de réglages
défile** en dessous, les onglets restant collés en haut du panneau. On voit donc le résultat en direct en bougeant
n'importe quel curseur.

**Tester** : sur téléphone, ouvrir un design avec une forme → Ongle → Gabarit French → faire défiler les réglages
et bouger « Profondeur du sourire » : l'ongle reste visible.

**Limites** : sur un très petit écran, la zone de réglages est plus courte (défiler davantage).

## feat/34-marques-capsules-perso — 15/10/2026 (retour de test)

**Ajouté** : **Mes marques / mes capsules** — onglet *Ongle* → Press-on → liste des capsules → « + Nouvelle marque /
mes capsules… ».
- On saisit le **nom**, une **référence** (boîte, forme, collection…) et la liste des **tailles** : libellé
  (1, 2, 10, S…) + **largeur en mm**, saisie ou **mesurée à l'écran** (📏, en posant la vraie capsule).
  « + Taille » propose la taille suivante (−1 mm, à ajuster).
- Les marques perso apparaissent sous « Mes marques » dans la liste (avec leur référence), s'utilisent comme les
  marques du commerce (tailles, longueurs XS–XXL, set 10 doigts) et sont **exactes** (pas d'« approx. »).
- « ✎ Modifier » / Supprimer une marque perso ; incluses dans la 💾 sauvegarde.

**Tester** : Ongle → Press-on → + Nouvelle marque → nom + 2 tailles → Enregistrer → choisir les tailles.

**Limites** : une marque perso utilise les formes et longueurs de l'app (le contour exact se dessine en feat/35).

## feat/35-contour-capsule-dessine — 15/10/2026 (retour de test)

**Ajouté** : **✍ Dessiner ma capsule** (onglet *Ongle*, sous les formes) : on pose sa vraie capsule à plat sur
l'écran (**cuticule vers le haut**) et on fait le tour de son bord d'un trait, au doigt ou au stylet. Grâce au
calibrage, l'app enregistre **la forme exacte ET ses dimensions** (affichées pendant le tracé) ; on lui donne un nom.
- La forme dessinée devient une forme comme les autres (« ✍ Nom ») : utilisable pour tous les designs, toutes les
  tailles (le contour est mis à l'échelle), les sets 10 doigts, les fiches clientes (forme habituelle), le French,
  le traçage et l'export.
- « Supprimer cette forme » (les designs qui l'utilisent repassent en ovale) ; incluse dans la 💾 sauvegarde.

**Tester** : Ongle → ✍ Dessiner ma capsule → tracer autour d'une capsule → nommer → Valider.

**Limites** : la précision dépend du calibrage et du tracé (un stylet aide ; on peut recommencer autant que
voulu) ; le contour n'est pas rendu symétrique automatiquement.

## feat/36-cliente-marque-taille — 15/10/2026 (retour de test)

**Ajouté** dans la fiche cliente (👤 Clientes) : choix de la **saisie des ongles** :
- **Largeur / longueur (mm)** : comme avant, doigt par doigt (ou 📏 à l'écran).
- **Marque + numéro** : on choisit la **marque** (du commerce ou perso), le **numéro de capsule de chaque doigt**
  (pré-rempli avec un set habituel) et **une longueur XS–XXL commune aux 10 doigts** ; les millimètres sont
  calculés et affichés à côté de chaque doigt, puis utilisés partout (ongle direct, traçage, export).

**Tester** : 👤 Clientes → + Cliente → « Marque + numéro » → choisir marque, numéros, longueur → Enregistrer.

**Limites** : en « marque + numéro », les largeurs sont celles de la marque (approx. pour les marques du commerce
sauf mesures « Ma boîte », exactes pour les marques perso).

## feat/37-mode-enfant-longueurs-mm — 15/10/2026 (retour de test)

**Ajouté** : **👧 Mode enfant** à côté du choix de longueur (capsules dans l'éditeur, et fiche cliente en « marque +
numéro »). Activé, les longueurs s'affichent **directement en millimètres** et sont adaptées aux petits ongles :
8 · 10 · 12 · 14 · 16 mm (appliquées telles quelles, sans coefficient de forme). Désactivé, on revient aux
longueurs XS–XXL. La longueur reste la même pour les 10 doigts ; les étiquettes de la bibliothèque affichent la
longueur en mm pour ces designs.

**Tester** : Ongle → Press-on → une marque → cocher « 👧 Mode enfant » → choisir 10 mm.

**Limites** : seules les longueurs changent en mode enfant (les numéros de capsules restent ceux de la marque —
utiliser une marque perso pour des capsules enfant aux largeurs exactes).

## feat/38-corrections-tests-mobile — 15/10/2026 (retours de test + passe de tests 1)

**Corrigé** :
- **Impossible de valider la mesure de la capsule** (et le tracé de contour / le recadrage) sur téléphone : depuis
  que le panneau de réglages défile (feat/33), ces outils s'ouvraient *dans* le panneau et Safari iOS les coupait,
  rendant la barre « Valider » inaccessible. Ils s'ouvrent maintenant au niveau de la page, tiennent compte de
  l'encoche de l'iPhone, et ont un **grand bouton « ✓ Valider » en bas** de l'écran.
- **Impossible de sortir du guide** : la barre avec « ‹ Designs » reste collée en haut en faisant défiler (guide,
  clientes, calibrage) + bouton **« ‹ Retour à mes designs »** en bas du guide.
- **Formes** redessinées : **stiletto** (flancs droits sur le lit de l'ongle puis longue courbe bombée jusqu'à une
  pointe nette), **ballerine** (flancs qui s'affinent en ligne droite vers un bout plat), **amande** (flancs droits
  puis bout pointu arrondi).
- **Largeurs des tailles** : elles décroissaient de 1 mm par taille sans limite (Beetles taille 14 = 4 mm !) ;
  désormais réparties de ≈ 18 mm (plus grande) à ≈ 7–8 mm (plus petite), demi-tailles Apres à mi-chemin.
- **Set 10 doigts** créé depuis une très petite taille : toutes les tailles étaient identiques ; le pouce laisse
  maintenant de la place aux doigts plus petits.
- Éditeur : deux réglages faits coup sur coup ne s'écrasent plus (chaque modification part de l'état le plus récent).

**Tester** : sur téléphone, Ongle → Press-on → 📏 Mesurer la capsule → ✓ Valider en bas ; ❓ Guide → défiler →
retour ; formes Stiletto / Ballerine.

**Limites** : les formes restent des modèles génériques ; pour coller exactement à une capsule précise, utiliser
« ✍ Dessiner ma capsule ».

## feat/39-mode-enfant-longueur-manuelle — 15/10/2026 (retour de test)

**Changé** :
- **👧 Mode enfant : longueur saisie à la main** (au lieu de choisir 8 / 10 / 12… mm) : champ en millimètres
  (virgule ou point acceptés, 3 à 40 mm) + boutons − / + par demi-millimètre. Capsules (éditeur) et fiche cliente
  en « marque + numéro ». Les longueurs enfant enregistrées avant restent reconnues.
- **Mode enfant aussi dans la fiche cliente en « Largeur / longueur (mm) »** : une longueur commune saisie à la
  main pour les 10 doigts (la colonne Longueur disparaît), largeurs toujours modifiables doigt par doigt et
  pré-remplies avec des largeurs d'enfant (11 / 8 / 8,5 / 8 / 6,5 mm) si la fiche n'avait pas été modifiée ;
  📏 ne mesure alors que la largeur.

**Tester** : Ongle → Press-on → une marque → 👧 Mode enfant → taper 9,5 ; 👤 Clientes → + Cliente →
👧 Mode enfant → taper la longueur → Enregistrer.

**Limites** : largeurs d'enfant par défaut approximatives (à mesurer pour chaque enfant).

## feat/40-corrections-passes-tests — 15/10/2026 (passes de tests 2 à 6)

Corrections trouvées par les passes de test automatisées (toutes les fonctionnalités, plusieurs fois) :
- **Recherche de la bibliothèque** : « p2 test » ne trouvait pas « P2-test » (tiret, ponctuation). La recherche
  ignore maintenant la ponctuation et accepte plusieurs mots dans n'importe quel ordre (nom, étiquette, collection).
