// Polices du texte : uniquement des polices déjà présentes sur les appareils (l'app marche hors-ligne).
// Chaque style liste des équivalents iPhone / Android / Windows, du plus au moins proche.
export const FONTS = {
  elegant: { label: 'Élégante', family: "Didot, 'Bodoni 72', 'Bodoni MT', Georgia, serif" },
  script: { label: 'Calligraphie', family: "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', 'Dancing Script', cursive" },
  hand: { label: 'Manuscrite', family: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', 'Comic Neue', cursive" },
  modern: { label: 'Moderne', family: "Futura, 'Century Gothic', 'Avenir Next', 'Trebuchet MS', sans-serif" },
  bold: { label: 'Bâton', family: "Impact, 'Arial Black', 'Helvetica Neue', sans-serif" },
  gothic: { label: 'Gothique', family: "'Old English Text MT', 'Blackletter', 'UnifrakturMaguntia', 'Times New Roman', serif" },
}

// valeurs par défaut des nouveaux réglages (les anciens designs n'ont que value / size / y)
export const DEFAULT_TEXT = { value: '', size: 3, y: 8, x: 0, rot: 0, font: 'elegant', outline: false, spacing: 0 }

export const fontFamily = (id) => (FONTS[id] || FONTS.elegant).family
