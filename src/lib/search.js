// Recherche insensible à la casse, aux accents et à la ponctuation (« p2 test » trouve « P2-test »)
export const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

// tous les mots tapés doivent se retrouver dans le texte, dans n'importe quel ordre
export const matches = (text, q) => q.split(' ').every((w) => text.includes(w))
