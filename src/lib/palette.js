// Palette de couleurs d'une image : les teintes dominantes, pour choisir ses vernis.
// Méthode simple et rapide : image réduite, couleurs regroupées par cases (4 bits / canal),
// puis fusion des cases voisines ; on ignore la transparence.

const SIZE = 80 // côté max de l'image analysée (px)
const MERGE = 48 // distance RGB sous laquelle deux couleurs sont considérées identiques

const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()

/** Teintes dominantes de l'image (data URL) : [{ hex, share }] du plus présent au moins présent. */
export async function extractPalette(src, count = 6) {
  const img = new Image()
  img.src = src
  await img.decode()
  const k = Math.min(1, SIZE / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * k))
  const h = Math.max(1, Math.round(img.height * k))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, 0, 0, w, h)
  const px = x.getImageData(0, 0, w, h).data

  // 1. cases de 16 niveaux par canal : somme des couleurs et nombre de pixels
  const bins = new Map()
  let total = 0
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue
    const key = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4)
    const b = bins.get(key) || { r: 0, g: 0, b: 0, n: 0 }
    b.r += px[i]
    b.g += px[i + 1]
    b.b += px[i + 2]
    b.n++
    bins.set(key, b)
    total++
  }
  if (!total) return []

  // 2. des plus grosses cases aux plus petites, on fusionne avec une couleur déjà retenue si elle est proche
  const groups = []
  for (const b of [...bins.values()].sort((a, z) => z.n - a.n)) {
    const col = [b.r / b.n, b.g / b.n, b.b / b.n]
    const near = groups.find((g) => Math.hypot(g.c[0] - col[0], g.c[1] - col[1], g.c[2] - col[2]) < MERGE)
    if (near) {
      const n = near.n + b.n
      near.c = near.c.map((v, j) => (v * near.n + col[j] * b.n) / n)
      near.n = n
    } else groups.push({ c: col, n: b.n })
  }

  return groups
    .sort((a, z) => z.n - a.n)
    .filter((g) => g.n / total >= 0.01) // moins de 1 % : du bruit (bords, compression)
    .slice(0, count)
    .map((g) => ({ hex: hex(g.c), share: g.n / total }))
}
