# Ongle-sticker-app — cahier des charges

Référence : vidéo Instagram de *nails_reloaded* (« Phone hack for nail techs »), app nommée **Nail Trace Pro**.
Introuvable en ligne (ni App Store ni site web) : c'est probablement un outil privé. On le recrée à partir de la vidéo.

## Principe
Le téléphone sert de **table lumineuse**. L'app affiche un motif au trait, à la taille réelle de l'ongle.
On pose une capsule transparente (tip) sur l'écran, puis on repasse le trait au pinceau, comme un calque.

## Écrans vus dans la vidéo
1. **Édition** (0–4 s)
   - Fond clair quadrillé, motif noir au trait au centre.
   - En bas : panneau « EDITING », avec un identifiant de design (UUID) et une option « Text overlay » (ajouter du texte sans modifier l'image).
   - Texte d'accueil : « …for nail artists. Bring a reference … let your hands do the work. »
2. **Tracing mode / Hands on** (5–14 s)
   - Thème sombre, accents dorés. En-tête « BY NAILS RELOADED · NAIL TRACE PRO », badge « • PRIVATE ».
   - Bouton rose « Unlock design ».
   - Zone de traçage claire quadrillée, pastille « 🔒 DESIGN LOCKED » : l'écran ignore les touches pour que la capsule et le pinceau ne déplacent rien.
   - Silhouette d'ongle (forme ballerine/coffin), motif centré dedans. En bas : « READY TO TRACE ».
3. **Résultat** (15–24 s) : capsule peinte (Ghostface + nœud rose + roses), fond bleu.

## Fonctionnalités à reproduire (V1)
- Importer une image (galerie ou appareil photo).
- Convertir l'image en **trait noir sur fond clair** (niveaux de gris, seuil, détection de contours).
- Choisir la **forme d'ongle** (ballerine, amande, carré, stiletto…) et la **taille** (calibrage en mm, par exemple avec une carte bancaire posée sur l'écran).
- Déplacer, zoomer et faire pivoter le motif dans la forme.
- Option **Text overlay**.
- **Mode traçage** : luminosité au maximum, écran toujours allumé, verrouillage tactile (« Design locked »), déverrouillage par appui long.
- Bibliothèque de designs sauvegardés (identifiant par design).

## Pistes techniques
- **PWA** (React + Vite + Canvas) : fonctionne sur iPhone et Android via le navigateur, sans App Store. C'est la solution la plus simple pour un usage perso.
- Ou **Expo / React Native** si une vraie app installable est voulue plus tard.
- Écran toujours allumé : API Wake Lock. Le verrouillage tactile se fait dans l'interface, avec un appui long pour déverrouiller.

## Ma touche (idées V2)
- Calques couleur (afficher les zones à remplir en plus du trait).
- Planche de 10 ongles (un motif par doigt).
- Génération de motifs par IA.

> Usage perso : on reprend le fonctionnement et l'ergonomie, mais pas le nom ni la marque « Nail Trace Pro / Nails Reloaded ».
