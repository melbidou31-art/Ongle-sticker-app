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
