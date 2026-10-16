// Service worker : réseau d'abord, cache en secours (l'app marche hors-ligne).
// À l'installation, on met en cache la page ET les fichiers qu'elle charge (JS/CSS aux noms changeants) :
// sinon, à la première visite, seuls les fichiers demandés après l'installation étaient gardés et l'app
// ne s'ouvrait pas hors connexion avant une deuxième visite.
const CACHE = 'ongle-trace-v2'

async function precache() {
  const cache = await caches.open(CACHE)
  const base = new URL('./', self.location).href
  const res = await fetch(base, { cache: 'no-store' })
  const html = await res.clone().text()
  await cache.put(base, res)
  // fichiers référencés par la page : assets/*.js, assets/*.css, manifeste, icône
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => new URL(m[1], base).href)
    .filter((u) => u.startsWith(self.location.origin))
  await Promise.all(urls.map((u) => cache.add(u).catch(() => {})))
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().catch(() => {}).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // on supprime les caches des versions précédentes
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, copy))
        }
        return res
      })
      .catch(() =>
        caches
          .match(e.request)
          .then((r) => r || (e.request.mode === 'navigate' ? caches.match(new URL('./', self.location).href) : undefined)),
      ),
  )
})
