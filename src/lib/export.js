// Export à taille réelle : SVG en millimètres (s'imprime à la bonne taille) et PNG 300 dpi.
// Usage : imprimer pour un calque papier, des stickers ou des water decals (en miroir).
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import NailView from '../components/NailView.jsx'
import { FINGERS, listClients } from './clients.js'
import { fingerDims, forFinger, hasSet } from './fingerset.js'
import { findBrand, lengthLabel } from './tips.js'
import { allShapes } from './shapes.js'

const GAP = 3 // mm entre deux ongles
const MARGIN = 6 // mm autour de la planche
const PAD = 4 // marge interne de NailView (voir NailView.jsx)

/** Construit le SVG de la planche. options : { set, colors, mirror, outline } */
// others : designs id → design, pour les ongles accent de la planche
export function buildSheetSVG(design, { set = false, colors = false, mirror = false, outline = true, others = {} } = {}) {
  const items =
    set && hasSet(design)
      ? FINGERS.map((label, f) => ({ d: forFinger(design, f, others), label, f }))
      : [{ d: design, f: 0 }]
  const perRow = items.length > 1 ? 5 : 1

  // taille de chaque case = taille du SVG de NailView (pxPerMm = 1 → unités en mm)
  const cells = items.map(({ d, label, f }) => {
    const free = d.shape === 'none'
    const w = (free ? d.img.w : d.nailW) + PAD * 2
    const h = (free ? d.img.w * d.aspect : d.nailH) + PAD * 2
    const svg = renderToStaticMarkup(
      createElement(NailView, { design: d, pxPerMm: 1, colors, showOutline: outline, clipKey: `x${f}` }),
    )
    return { w, h, svg, label }
  })

  const rows = []
  for (let i = 0; i < cells.length; i += perRow) rows.push(cells.slice(i, i + perRow))
  const rowW = rows.map((r) => r.reduce((s, c) => s + c.w, 0) + GAP * (r.length - 1))
  const rowH = rows.map((r) => Math.max(...r.map((c) => c.h)) + (r[0].label ? 5 : 0))
  const W = Math.max(...rowW) + MARGIN * 2
  const H = rowH.reduce((s, h) => s + h, 0) + GAP * (rows.length - 1) + MARGIN * 2

  let body = ''
  let y = MARGIN
  rows.forEach((r, ri) => {
    let x = MARGIN
    for (const c of r) {
      // le SVG de NailView est imbriqué tel quel, positionné en mm
      body += c.svg.replace('<svg ', `<svg x="${x}" y="${y}" `)
      if (c.label)
        body += `<text x="${x + c.w / 2}" y="${y + rowH[ri] - 1}" font-size="2.6" text-anchor="middle" font-family="sans-serif" fill="#888">${c.label}</text>`
      x += c.w + GAP
    }
    y += rowH[ri] + GAP
  })

  const flip = mirror ? ` transform="translate(${W} 0) scale(-1 1)"` : ''
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="#fff"/><g${flip}>${body}</g></svg>`
  return { svg, W, H }
}

function download(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

// nom de fichier lisible : accents retirés (« Léa » → « Lea », « Cœur » → « Coeur ») plutôt que remplacés par « _ »
const safeName = (s) =>
  (s || 'design')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'design'

export function exportSVG(design, options) {
  const { svg } = buildSheetSVG(design, options)
  download(new Blob([svg], { type: 'image/svg+xml' }), `${safeName(design.name)}.svg`)
}

// ---- PNG avec résolution (chunk pHYs) pour que l'impression respecte la taille réelle ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(bytes) {
  let c = 0xffffffff
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function withDpi(png, dpi) {
  const ppm = Math.round(dpi / 0.0254) // pixels par mètre
  const chunk = new Uint8Array(21)
  const v = new DataView(chunk.buffer)
  v.setUint32(0, 9)
  chunk.set([0x70, 0x48, 0x59, 0x73], 4) // "pHYs"
  v.setUint32(8, ppm)
  v.setUint32(12, ppm)
  chunk[16] = 1 // unité : mètre
  v.setUint32(17, crc32(chunk.subarray(4, 17)))
  // insertion juste après l'en-tête IHDR (8 octets de signature + 25 octets d'IHDR)
  const out = new Uint8Array(png.length + chunk.length)
  out.set(png.subarray(0, 33))
  out.set(chunk, 33)
  out.set(png.subarray(33), 33 + chunk.length)
  return out
}

/** Planche rendue dans un canvas à la résolution demandée ; W, H en mm. */
async function renderSheet(design, options, dpi) {
  const { svg, W, H } = buildSheetSVG(design, options)
  const k = dpi / 25.4
  const img = new Image()
  img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  await img.decode()
  const c = document.createElement('canvas')
  c.width = Math.round(W * k)
  c.height = Math.round(H * k)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  URL.revokeObjectURL(img.src)
  return { canvas: c, W, H }
}

export async function exportPNG(design, options, dpi = 300) {
  const { canvas: c } = await renderSheet(design, options, dpi)
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
  const png = withDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
  download(new Blob([png], { type: 'image/png' }), `${safeName(design.name)}-${dpi}dpi.png`)
}

/**
 * Aperçu à envoyer à une cliente (WhatsApp, Instagram, SMS…) : image PNG nette, avec les couleurs d'origine,
 * via le menu de partage du téléphone. Repli : téléchargement si le partage de fichiers n'est pas possible.
 * Renvoie 'shared', 'downloaded' ou 'cancelled'.
 */
export async function shareDesign(design, options) {
  const { canvas } = await renderSheet(design, { colors: true, outline: true, ...options }, 200)
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'))
  const name = `${safeName(design.name)}-apercu.png`
  const file = new File([blob], name, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: design.name, text: `Proposition de design : ${design.name}` })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled' // la cliente… ou la prothésiste a fermé le menu
      throw e
    }
  }
  download(blob, name)
  return 'downloaded'
}

// ---- PDF minimal écrit à la main : une page A4 (ou plus grande si la planche ne tient pas), ----
// ---- avec la planche en image JPEG placée à sa taille exacte en millimètres.              ----
const PT = 72 / 25.4 // points PDF par mm

/** Assemble un PDF d'une page contenant une image JPEG de wMm × hMm, coin haut-gauche à (xMm, yMm). */
export function buildPDF(jpeg, pxW, pxH, { pageW, pageH, x, y, w, h }) {
  const enc = new TextEncoder()
  const parts = []
  const offsets = []
  let size = 0
  const push = (chunk) => {
    const b = typeof chunk === 'string' ? enc.encode(chunk) : chunk
    parts.push(b)
    size += b.length
  }
  const obj = (n, body) => {
    offsets[n] = size
    push(`${n} 0 obj\n`)
    body()
    push('\nendobj\n')
  }
  const f = (v) => (v * PT).toFixed(2)
  // le PDF compte y depuis le bas de la page
  const content = `q ${f(w)} 0 0 ${f(h)} ${f(x)} ${f(pageH - y - h)} cm /Im0 Do Q`

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'))
  obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'))
  obj(3, () =>
    push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pageW)} ${f(pageH)}] ` +
        '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
    ),
  )
  obj(4, () => {
    push(
      `<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB ` +
        `/BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    )
    push(jpeg)
    push('\nendstream')
  })
  obj(5, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`))

  const xref = size
  push(`xref\n0 6\n0000000000 65535 f \n`)
  for (let n = 1; n <= 5; n++) push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`)

  const out = new Uint8Array(size)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

/**
 * Fiche de tailles (A4, PDF) d'un set : cliente / marque, forme, longueur et, pour chaque doigt, numéro de capsule
 * et dimensions en mm, avec l'aperçu du motif. Pour préparer une commande press-on ou garder la trace d'une pose.
 */
export async function exportSizeSheet(design) {
  const k = 150 / 25.4 // 150 dpi suffisent pour du texte imprimé
  const c = document.createElement('canvas')
  c.width = Math.round(210 * k)
  c.height = Math.round(297 * k)
  const x = c.getContext('2d')
  const mm = (v) => v * k
  x.fillStyle = '#fff'
  x.fillRect(0, 0, c.width, c.height)
  x.fillStyle = '#1b1a18'
  x.textBaseline = 'alphabetic'
  const text = (s, px, py, size, weight = '400', align = 'left', color = '#1b1a18') => {
    x.font = `${weight} ${mm(size)}px Georgia, 'Times New Roman', serif`
    x.textAlign = align
    x.fillStyle = color
    x.fillText(s, mm(px), mm(py))
  }

  const client = design.mode === 'direct' && design.client?.id ? listClients().find((cl) => cl.id === design.client.id) : null
  const brand = design.tip?.brand ? findBrand(design.tip.brand) : null
  const shape = allShapes()[design.shape] || '—'
  const today = new Date().toLocaleDateString('fr-FR')

  text('Fiche de tailles', 15, 25, 9, '700')
  text(today, 195, 25, 4, '400', 'right', '#777')
  text(design.name, 15, 35, 5.5, '400', 'left', '#555')
  const info = [
    client ? ['Cliente', client.name] : null,
    brand ? ['Capsules', `${brand.name}${brand.ref ? ` — ${brand.ref}` : ''}`] : null,
    ['Forme', shape.replace(/^✍ /, '')],
    design.tip?.length ? ['Longueur', lengthLabel(design.tip.length)] : null,
  ].filter(Boolean)
  info.forEach(([l, v], i) => {
    text(`${l} :`, 15, 50 + i * 8, 4.5, '700')
    text(v, 45, 50 + i * 8, 4.5)
  })

  // notes du design (vernis, technique…) : 2 lignes max, à gauche de l'aperçu
  const notes = (design.notes || '').replace(/\s+/g, ' ').trim()
  if (notes) {
    x.font = `400 ${mm(3.8)}px Georgia, 'Times New Roman', serif`
    const lines = ['']
    for (const w of `📝 ${notes}`.split(' ')) {
      const next = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w
      if (x.measureText(next).width > mm(125) && lines[lines.length - 1]) lines.push(w)
      else lines[lines.length - 1] = next
    }
    const shown = lines.slice(0, 2)
    if (lines.length > 2) shown[1] += ' …'
    shown.forEach((l, i) => text(l, 15, 50 + info.length * 8 + 2 + i * 5.5, 3.8, '400', 'left', '#555'))
  }

  // aperçu du motif (trait) en haut à droite
  try {
    const img = new Image()
    img.src = design.lineart
    await img.decode()
    const bw = 50
    const bh = Math.min(50, bw * design.aspect)
    const iw = Math.min(bw, bh / design.aspect)
    x.drawImage(img, mm(195 - iw), mm(40), mm(iw), mm(iw * design.aspect))
  } catch {}

  // tableau des 10 doigts
  let y = 100
  const cols = [15, 70, 110, 150]
  ;['Doigt', 'Taille', 'Largeur', 'Longueur'].forEach((h, i) => text(h, cols[i], y, 4.5, '700'))
  x.fillRect(mm(15), mm(y + 2), mm(180), mm(0.4))
  FINGERS.forEach((f, i) => {
    y += 10
    const d = fingerDims(design, i)
    if (i === 5) x.fillRect(mm(15), mm(y - 6.5), mm(180), mm(0.2)) // séparation main gauche / main droite
    text(f, cols[0], y, 4.5)
    text(d?.size ?? '—', cols[1], y, 4.5)
    text(d ? `${d.w} mm` : '—', cols[2], y, 4.5)
    text(d ? `${d.h} mm` : '—', cols[3], y, 4.5)
  })
  text('Ongle Trace · dimensions de cuticule à bord libre, largeur au point le plus large.', 15, 285, 3.2, '400', 'left', '#999')

  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92))
  const jpeg = new Uint8Array(await blob.arrayBuffer())
  const pdf = buildPDF(jpeg, c.width, c.height, { pageW: 210, pageH: 297, x: 0, y: 0, w: 210, h: 297 })
  download(new Blob([pdf], { type: 'application/pdf' }), `${safeName(design.name)}-fiche-tailles.pdf`)
}

export async function exportPDF(design, options, dpi = 300) {
  const { canvas, W, H } = await renderSheet(design, options, dpi)
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.95))
  const jpeg = new Uint8Array(await blob.arrayBuffer())
  const margin = 10 // mm
  // A4 portrait, ou paysage / plus grand si la planche ne tient pas
  let [pageW, pageH] = [210, 297]
  if (W + 2 * margin > pageW && W + 2 * margin <= 297 && H + 2 * margin <= 210) [pageW, pageH] = [297, 210]
  pageW = Math.max(pageW, W + 2 * margin)
  pageH = Math.max(pageH, H + 2 * margin)
  const pdf = buildPDF(jpeg, canvas.width, canvas.height, { pageW, pageH, x: margin, y: margin, w: W, h: H })
  download(new Blob([pdf], { type: 'application/pdf' }), `${safeName(design.name)}-taille-reelle.pdf`)
}
