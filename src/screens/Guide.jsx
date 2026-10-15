// Guide d'utilisation intégré : la marche à suivre, en français, sans jargon.

const SECTIONS = [
  {
    title: '1. Avant tout : calibrer l\'écran',
    steps: [
      '📏 Calibrer l\'écran → pose une carte bancaire ou carte vitale sur le cadre et ajuste le curseur jusqu\'à ce qu\'ils se superposent.',
      'À faire une seule fois par appareil (le calibrage n\'est pas transféré par la sauvegarde).',
      'Sans calibrage, les tailles en millimètres sont approximatives.',
    ],
  },
  {
    title: '2. Créer un design',
    steps: [
      '+ Importer une image (photo ou dessin) ou ✨ Motifs pour partir d\'un motif tout prêt.',
      'Onglet Motif : « Dessin au trait » pour un dessin noir sur blanc, « Photo → contours » pour une photo en couleur. Ajuste le seuil et l\'épaisseur.',
      '✂ Recadrer pour ne garder que le motif ; 🧽 Gomme pour effacer les taches.',
      'Onglet Calques : ajoute d\'autres motifs (roses, nœud…) et place-les un par un.',
    ],
  },
  {
    title: '3a. Press-on (capsules)',
    steps: [
      'Onglet Ongle → Press-on → choisis la marque, la taille et la longueur de la capsule.',
      'Pour une taille exacte : pose ta vraie capsule sur l\'écran → 📏 Mesurer la capsule → « Ma boîte » retient la mesure.',
      '« Créer un set 10 doigts » : une taille par doigt, pour tracer tout le set à la suite.',
    ],
  },
  {
    title: '3b. Ongle direct (pose sur la cliente)',
    steps: [
      '👤 Clientes → + Cliente → mesure ses 10 ongles (📏 directement à l\'écran ou en millimètres).',
      'Onglet Ongle → Ongle direct → choisis la cliente et le doigt : le motif s\'adapte tout seul à chaque ongle.',
      'Repères : la bande rose montre la marge à laisser le long de la cuticule et des parois.',
    ],
  },
  {
    title: '4. Tracer',
    steps: [
      'Tracer → le design est verrouillé : l\'écran ignore la capsule et le pinceau posés dessus.',
      'Monte la luminosité au maximum. Sur téléphone, l\'interface se réduit à une fine barre (mode immersif).',
      '◀ ▶ pour passer d\'un doigt à l\'autre ; 🎨 pour voir les couleurs d\'origine ; ⚙ pour un trait rouge/bleu ou un fond sombre (plus visible à travers une capsule teintée).',
      'Pour déplacer le motif ou quitter : maintiens 🔓 quelques instants.',
    ],
  },
  {
    title: '5. Imprimer et sauvegarder',
    steps: [
      'Onglet Export : SVG ou PNG 300 dpi à taille réelle, en miroir pour les water decals. Imprime à « 100 % / taille réelle ».',
      '💾 Sauvegarde : un fichier avec tous tes designs et clientes, à garder en lieu sûr ou à ouvrir sur un autre appareil.',
    ],
  },
]

export default function Guide({ onBack, onCalibrate }) {
  return (
    <div className="screen guide">
      <header className="topbar">
        <button className="ghost dark" onClick={onBack}>‹ Designs</button>
        <b>Guide</b>
        <button className="chip gold" onClick={onCalibrate}>📏 Calibrer</button>
      </header>
      <div className="guide-body">
        {SECTIONS.map((s) => (
          <section key={s.title} className="guide-section">
            <h2>{s.title}</h2>
            <ul>
              {s.steps.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ))}
        <button className="pink big" onClick={onBack}>‹ Retour à mes designs</button>
      </div>
    </div>
  )
}
