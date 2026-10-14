import { useEffect, useState } from 'react'
import Library from './screens/Library.jsx'
import Editor from './screens/Editor.jsx'
import Trace from './screens/Trace.jsx'
import Calibrate from './screens/Calibrate.jsx'
import Clients from './screens/Clients.jsx'
import { defaultPxPerMm, deleteDesign, getSetting, listDesigns, newDesign, saveDesign, setSetting } from './lib/db.js'
import { downscale, fileToDataURL, loadImage, toLineArt } from './lib/lineart.js'
import { motifCanvas } from './lib/motifs.js'

export default function App() {
  const [screen, setScreen] = useState('library')
  const [designs, setDesigns] = useState([])
  const [design, setDesign] = useState(null)
  const [busy, setBusy] = useState(false)
  const [clientsBack, setClientsBack] = useState('library')
  const [pxPerMm, setPxPerMm] = useState(() => getSetting('pxPerMm', defaultPxPerMm()))

  const refresh = () => listDesigns().then(setDesigns).catch(() => setDesigns([]))
  useEffect(() => {
    refresh()
  }, [])

  // Sauvegarde automatique (anti-rebond) du design en cours
  useEffect(() => {
    if (!design) return
    const t = setTimeout(() => saveDesign(design).catch(console.error), 400)
    return () => clearTimeout(t)
  }, [design])

  // Crée un design à partir d'un canvas (image importée ou motif de la bibliothèque)
  async function createFrom(getCanvas, name) {
    setBusy(true)
    try {
      const canvas = await getCanvas()
      const original = canvas.toDataURL('image/jpeg', 0.9)
      const d = newDesign({ original, lineart: toLineArt(canvas), aspect: canvas.height / canvas.width })
      d.name = name || d.name
      await saveDesign(d)
      setDesign(d)
      setScreen('editor')
    } catch (e) {
      alert("Impossible de lire cette image.")
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const importFile = (file) =>
    createFrom(async () => downscale(await loadImage(await fileToDataURL(file))), file.name.replace(/\.[^.]+$/, '').slice(0, 40))

  const importMotif = (m) => createFrom(() => motifCanvas(m), m.name)

  function goLibrary() {
    setScreen('library')
    // laisse la sauvegarde différée se faire avant de relire la liste
    if (design) saveDesign(design).finally(refresh)
    else refresh()
  }

  function openClients(from) {
    setClientsBack(from)
    setScreen('clients')
  }

  if (screen === 'calibrate')
    return (
      <Calibrate
        pxPerMm={pxPerMm}
        onBack={() => setScreen('library')}
        onSave={(v) => {
          setPxPerMm(v)
          setSetting('pxPerMm', v)
          setScreen('library')
        }}
      />
    )

  if (screen === 'clients')
    return <Clients pxPerMm={pxPerMm} onBack={() => setScreen(clientsBack)} />

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
      onOpen={(d) => {
        setDesign(d)
        setScreen('editor')
      }}
      onTrace={(d) => {
        setDesign(d)
        setScreen('trace')
      }}
      onDelete={async (d) => {
        await deleteDesign(d.id)
        refresh()
      }}
      onCalibrate={() => setScreen('calibrate')}
      onClients={() => openClients('library')}
      onRestored={refresh}
    />
  )
}
