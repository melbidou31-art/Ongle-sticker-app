import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { requestPersist } from './lib/storage.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Demande un stockage protégé pour que le navigateur n'efface pas les designs en cas de manque de place
requestPersist()

// Mode hors-ligne + installation sur l'écran d'accueil (uniquement en version publiée)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {})
}
