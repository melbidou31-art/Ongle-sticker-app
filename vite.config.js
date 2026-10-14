import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Chemins relatifs : l'app fonctionne aussi hébergée dans un sous-dossier (GitHub Pages)
  base: './',
  // host: true -> accessible depuis le téléphone sur le même Wi-Fi
  server: { host: true, port: 5173 },
})
