// Export à taille réelle : SVG en millimètres (s'imprime à la bonne taille) et PNG 300 dpi.
// Usage : imprimer pour un calque papier, des stickers ou des water decals (en miroir).
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import NailView from '../components/NailView.jsx'
import { FINGERS } from './clients.js'
import { forFinger, hasSet } from './fingerset.js'

const GAP = 3 // mm entre deux ongles
const MARGIN = 6 // mm autour de la planche
const PAD = 4 // marge interne de NailView (voir NailView.jsx)

/** Construit le SVG de la planche. options : { set, colors, mirror, outline } */
export function buildSheetSVG(design, { set = false, colors = false, mirror = false, outline = true } = {}) {
  const items = set && hasSet(design) ? FINGERS.map((label, f) => ({ d: forFinger(design, f), label, f })) : [{ d: design, f: 0 }]
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

const safeName = (s) => (s || 'design').replace(/[^\w\-]+/g, '_').slice(0, 40)

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

export async function exportPNG(design, options, dpi = 300) {
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
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
  const png = withDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
  download(new Blob([png], { type: 'image/png' }), `${safeName(design.name)}-${dpi}dpi.png`)
}
