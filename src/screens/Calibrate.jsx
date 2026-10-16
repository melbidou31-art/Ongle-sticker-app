import { useState } from 'react'

// Carte bancaire / carte vitale : format ISO ID-1
const CARD_LONG = 85.6
const CARD_SHORT = 53.98

export default function Calibrate({ pxPerMm, onSave, onBack }) {
  const [v, setV] = useState(pxPerMm)
  // Carte à la verticale sur un écran plus étroit que la carte posée à plat (téléphone) :
  // à l'horizontale, 85,6 mm (≈ 540 px) dépassaient de l'écran et le calibrage était impossible.
  const portrait = typeof window !== 'undefined' && window.innerWidth < CARD_LONG * v + 32
  const w = (portrait ? CARD_SHORT : CARD_LONG) * v
  const h = (portrait ? CARD_LONG : CARD_SHORT) * v
  return (
    <div className="screen calibrate">
      <header className="topbar">
        <button className="ghost dark" onClick={onBack}>‹ Retour</button>
        <b>Calibrer l'écran</b>
        <button className="pink" onClick={() => onSave(v)}>Valider</button>
      </header>
      <p className="muted pad">
        Pose une carte bancaire (ou carte vitale) sur l'écran{portrait ? ', à la verticale' : ''}, coin en haut à gauche
        du cadre, puis ajuste le curseur pour que le cadre ait exactement la taille de la carte. Les ongles s'afficheront
        alors à leur taille réelle.
      </p>
      <div className="pad">
        <input type="range" min={2.5} max={12} step={0.01} value={v} onChange={(e) => setV(+e.target.value)} />
        <div className="row">
          <button className="chip" onClick={() => setV((x) => +(x - 0.02).toFixed(2))}>−</button>
          <span className="muted">{v.toFixed(2)} px/mm</span>
          <button className="chip" onClick={() => setV((x) => +(x + 0.02).toFixed(2))}>+</button>
        </div>
      </div>
      <div className="card-frame" style={{ width: w, height: h }}>
        <span>{portrait ? '54 × 85,6 mm' : '85,6 × 54 mm'}</span>
      </div>
    </div>
  )
}
