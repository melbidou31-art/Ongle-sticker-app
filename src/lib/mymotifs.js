// « Mes motifs » : images importées enregistrées comme motifs réutilisables.
// Un motif garde le TRAIT nettoyé tel qu'on le voit (gomme et recadrage compris), aplati en noir sur blanc,
// plus la photo couleur recadrée pour le calque « couleurs d'origine ».
import { listMyMotifs, saveMyMotif } from './db.js'
import { downscale, fileToDataURL, loadImage, toLineArt } from './lineart.js'

const MAX = 1000 // px : assez fin pour tracer, léger à stocker

/** Trait transparent → image noir sur fond blanc (se retraite à l'identique en mode « Dessin au trait »). */
async function flatten(lineartUrl) {
  const img = await loadImage(lineartUrl)
  const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * k)
  c.height = Math.round(img.naturalHeight * k)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return c
}

async function makeMotif(name, lineartUrl, photoUrl) {
  const c = await flatten(lineartUrl)
  return {
    id: crypto.randomUUID(),
    name: (name || 'Mon motif').slice(0, 40),
    createdAt: Date.now(),
    image: c.toDataURL('image/png'), // trait nettoyé, noir sur blanc
    photo: photoUrl ? downscale(await loadImage(photoUrl), MAX).toDataURL('image/jpeg', 0.85) : null,
    aspect: c.height / c.width,
  }
}

/** Depuis un design de l'éditeur : ce qu'on voit (trait nettoyé + photo recadrée). */
export async function motifFromDesign(design) {
  const m = await makeMotif(design.name, design.lineart, design.cropOriginal || design.original)
  await saveMyMotif(m)
  return m
}

/** Depuis un fichier image : conversion « dessin au trait » par défaut. */
export async function motifFromFile(file) {
  const canvas = downscale(await loadImage(await fileToDataURL(file)))
  const m = await makeMotif(file.name.replace(/\.[^.]+$/, ''), toLineArt(canvas), canvas.toDataURL('image/jpeg', 0.9))
  await saveMyMotif(m)
  return m
}

/** Canvas du motif (pour créer un design ou un calque comme une image importée). */
export async function myMotifCanvas(m) {
  return downscale(await loadImage(m.image))
}

export { listMyMotifs }
