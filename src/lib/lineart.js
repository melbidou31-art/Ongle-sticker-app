// Conversion d'une photo en motif "au trait" : lignes noires sur fond transparent.

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// Réduit l'image pour garder un traitement rapide et un stockage léger
export function downscale(img, max = 1200) {
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * k)
  c.height = Math.round(img.naturalHeight * k)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c
}

function luminance(data, w, h) {
  const lum = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const a = data[i * 4 + 3] / 255
    // un pixel transparent compte comme blanc
    const l = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    lum[i] = l * a + 255 * (1 - a)
  }
  return lum
}

function blur(src, w, h) {
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, n = 0
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= w) continue
          s += src[yy * w + xx]; n++
        }
      }
      out[y * w + x] = s / n
    }
  }
  return out
}

function sobel(lum, w, h) {
  const out = new Float32Array(w * h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1]
      const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1]
      out[i] = Math.hypot(gx, gy) / 4
    }
  }
  return out
}

function dilate(mask, w, h) {
  const out = new Uint8Array(mask)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue
      if (x > 0) out[y * w + x - 1] = 1
      if (x < w - 1) out[y * w + x + 1] = 1
      if (y > 0) out[(y - 1) * w + x] = 1
      if (y < h - 1) out[(y + 1) * w + x] = 1
    }
  }
  return out
}

/**
 * mode 'trait'    : garde les zones sombres (idéal pour un dessin déjà au trait)
 * mode 'contours' : détecte les bords (idéal pour une photo en couleur)
 * seuil 0–100, epaisseur 0–3
 * erase : traits de gomme [{ r, pts: [[u, v], …] }] en coordonnées relatives à l'image (0–1 ; r en largeur d'image)
 * crop : zone conservée { x, y, w, h } relative à l'image entière (la gomme reste exprimée sur l'image entière)
 */
export function toLineArt(canvas, { mode = 'trait', seuil = 50, epaisseur = 0 } = {}, erase = [], crop = null) {
  const { width: w, height: h } = canvas
  const ctx = canvas.getContext('2d')
  const { data } = ctx.getImageData(0, 0, w, h)
  const lum = luminance(data, w, h)

  let mask = new Uint8Array(w * h)
  if (mode === 'contours') {
    const g = sobel(blur(lum, w, h), w, h)
    const t = 6 + (100 - seuil) * 0.9
    for (let i = 0; i < w * h; i++) mask[i] = g[i] > t ? 1 : 0
  } else {
    const t = 40 + seuil * 1.8
    for (let i = 0; i < w * h; i++) mask[i] = lum[i] < t ? 1 : 0
  }
  for (let k = 0; k < epaisseur; k++) mask = dilate(mask, w, h)

  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const octx = out.getContext('2d')
  const img = octx.createImageData(w, h)
  for (let i = 0; i < w * h; i++) {
    img.data[i * 4 + 3] = mask[i] ? 255 : 0 // noir opaque ou transparent
  }
  octx.putImageData(img, 0, 0)

  // Retouches dans l'ordre : gomme (efface le trait) ou crayon (mode 'draw', ajoute du trait noir)
  if (erase.length) {
    octx.lineCap = 'round'
    octx.lineJoin = 'round'
    octx.strokeStyle = '#000'
    for (const s of erase) {
      octx.globalCompositeOperation = s.mode === 'draw' ? 'source-over' : 'destination-out'
      octx.lineWidth = s.r * w * 2
      octx.beginPath()
      s.pts.forEach(([u, v], i) => (i ? octx.lineTo(u * w, v * h) : octx.moveTo(u * w, v * h)))
      // un simple clic efface un point
      if (s.pts.length === 1) octx.lineTo(s.pts[0][0] * w + 0.01, s.pts[0][1] * h)
      octx.stroke()
    }
  }
  return crop ? cropCanvas(out, crop).toDataURL('image/png') : out.toDataURL('image/png')
}

/** Zone { x, y, w, h } (relative, 0–1) d'un canvas, dans un nouveau canvas. */
export function cropCanvas(canvas, crop) {
  const sx = Math.round(crop.x * canvas.width)
  const sy = Math.round(crop.y * canvas.height)
  const sw = Math.max(1, Math.round(crop.w * canvas.width))
  const sh = Math.max(1, Math.round(crop.h * canvas.height))
  const c = document.createElement('canvas')
  c.width = sw
  c.height = sh
  c.getContext('2d').drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh)
  return c
}

/** Recadrage actif ? (null ou la zone entière = pas de recadrage) */
export const hasCrop = (c) => !!c && (c.x > 0 || c.y > 0 || c.w < 1 || c.h < 1)
