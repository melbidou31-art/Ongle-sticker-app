import { useEffect, useRef, useState } from 'react'
import Library from './screens/Library.jsx'
import Editor from './screens/Editor.jsx'
import Trace from './screens/Trace.jsx'
import Calibrate from './screens/Calibrate.jsx'
import Clients from './screens/Clients.jsx'
import Guide from './screens/Guide.jsx'
import {
  defaultPxPerMm, deleteDesign, getSetting, listDesigns, newDesign, saveDesign, setSetting, updateDesignMeta,
} from './lib/db.js'
import { downscale, fileToDataURL, loadImage, toLineArt } from './lib/lineart.js'
import { motifCanvas } from './lib/motifs.js'
import { myMotifCanvas } from './lib/mymotifs.js'

export default function App() {
  const [screen, setScreen] = useState('library')
  const [designs, setDesigns] = useState([])
  const [design, setDesign] = useState(null)
  const [busy, setBusy] = useState(false)
  const [clientsBack, setClientsBack] = useState('library')
  const [pxPerMm, setPxPerMm] = useState(() => getSetting('pxPerMm', defaultPxPerMm()))
  // l'écran a-t-il déjà été calibré sur cet appareil ? (sinon la taille réelle est approximative)
  const [calibrated, setCalibrated] = useState(() => getSetting('pxPerMm', null) != null)

  const refresh = () => listDesigns().then(setDesigns).catch(() => setDesigns([]))
  useEffect(() => {
    refresh()
  }, [])

  // Sauvegarde automatique (anti-rebond) du design en cours.
  // `opened` = le design tel qu'ouvert : tant qu'il n'a pas changé, rien à enregistrer
  // (sinon le simple fait d'ouvrir un design le ferait remonter dans « Récents »).
  const opened = useRef(null)
  const [saveError, setSaveError] = useState(false)
  const persist = (d) =>
    saveDesign(d).then(
      () => setSaveError(false),
      (e) => {
        console.error(e)
        setSaveError(true) // stockage plein ou refusé : prévenir au lieu de perdre le travail en silence
      },
    )
  const openDesign = (d, next) => {
    opened.current = d
    setDesign(d)
    setScreen(next)
  }
  useEffect(() => {
    if (!design || design === opened.current) return
    const t = setTimeout(() => persist(design), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design])

  // Crée un design à partir d'un canvas (image importée ou motif de la bibliothèque)
  async function createFrom(getCanvas, name, extra = {}) {
    setBusy(true)
    try {
      const canvas = await getCanvas()
      const original = canvas.toDataURL('image/jpeg', 0.9)
      const d = { ...newDesign({ original, lineart: toLineArt(canvas), aspect: canvas.height / canvas.width }), ...extra }
      d.name = name || d.name
      await saveDesign(d)
      openDesign(d, 'editor')
    } catch (e) {
      alert("Impossible de lire cette image.")
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const importFile = (file) =>
    createFrom(async () => downscale(await loadImage(await fileToDataURL(file))), file.name.replace(/\.[^.]+$/, '').slice(0, 40))

  // motif intégré, ou « Mes motifs » (trait déjà nettoyé + photo couleur pour le calque couleurs)
  const importMotif = ({ kind, motif }) =>
    kind === 'mine'
      ? createFrom(() => myMotifCanvas(motif), motif.name, { colorSrc: motif.photo })
      : createFrom(() => motifCanvas(motif), motif.name)

  function goLibrary() {
    setScreen('library')
    // laisse la sauvegarde différée se faire avant de relire la liste (seulement si le design a changé)
    if (design && design !== opened.current) persist(design).finally(refresh)
    else refresh()
  }

  async function openClients(from) {
    setClientsBack(from)
    // la fiche cliente liste ses designs : enregistrer d'abord la modification en attente
    if (design && design !== opened.current) await persist(design)
    setScreen('clients')
  }

  return (
    <>
      {renderScreen()}
      {saveError && (
        <div className="save-error" role="alert">
          ⚠ Enregistrement impossible — l'espace de stockage est peut-être plein. Fais une 💾 Sauvegarde et supprime
          des designs inutiles.
          <button className="chip mini" onClick={() => setSaveError(false)}>OK</button>
        </div>
      )}
    </>
  )

  function renderScreen() {
  if (screen === 'calibrate')
    return (
      <Calibrate
        pxPerMm={pxPerMm}
        onBack={() => setScreen('library')}
        onSave={(v) => {
          setPxPerMm(v)
          setSetting('pxPerMm', v)
          setCalibrated(true)
          setScreen('library')
        }}
      />
    )

  if (screen === 'guide') return <Guide onBack={() => setScreen('library')} onCalibrate={() => setScreen('calibrate')} />

  if (screen === 'clients')
    return (
      <Clients
        pxPerMm={pxPerMm}
        onBack={() => setScreen(clientsBack)}
        // design ouvert depuis la fiche d'une cliente (la sauvegarde en attente a été faite en ouvrant les clientes)
        onOpenDesign={(d, next) => openDesign(d, next)}
      />
    )

  if (screen === 'editor' && design)
    return (
      <Editor
        design={design}
        pxPerMm={pxPerMm}
        onChange={setDesign}
        onTrace={() => setScreen('trace')}
        onBack={goLibrary}
        onManageClients={() => openClients('editor')}
      />
    )

  if (screen === 'trace' && design)
    return <Trace design={design} pxPerMm={pxPerMm} onChange={setDesign} onExit={() => setScreen('editor')} />

  return (
    <Library
      designs={designs}
      busy={busy}
      onImport={importFile}
      onMotif={importMotif}
      onOpen={(d) => openDesign(d, 'editor')}
      onTrace={(d) => openDesign(d, 'trace')}
      onMeta={async (d) => {
        await updateDesignMeta(d)
        refresh()
      }}
      onDuplicate={async (d) => {
        // copie indépendante : nouvel identifiant, même contenu
        const copy = { ...d, id: crypto.randomUUID().toUpperCase(), name: `${d.name} (copie)`, createdAt: Date.now() }
        await saveDesign(copy)
        refresh()
      }}
      onDelete={async (d) => {
        await deleteDesign(d.id)
        refresh()
      }}
      onCalibrate={() => setScreen('calibrate')}
      onClients={() => openClients('library')}
      onRestored={refresh}
      onGuide={() => setScreen('guide')}
      calibrated={calibrated}
    />
  )
  }
}
