import { useState } from 'react'

// Carte bancaire / carte vitale : format ISO ID-1
const CARD_W = 85.6
const CARD_H = 53.98

export default function Calibrate({ pxPerMm, onSave, onBack }) {
  const [v, setV] = useState(pxPerMm)
  return (
    <div className="screen calibrate">
      <header className="topbar">
        <button className="ghost dark" onClick={onBack}>‹ Retour</button>
        <b>Calibrer l'écran</b>
        <button className="pink" onClick={() => onSave(v)}>Valider</button>
      </header>
      <p className="muted pad">
        Pose une carte bancaire (ou carte vitale) sur l'écran, coin en haut à gauche du cadre, puis ajuste le curseur pour que le cadre ait exactement la taille de la carte. Les ongles s'afficheront alors à leur taille réelle.
      </p>
      <div className="card-frame" style={{ width: CARD_W * v, height: CARD_H * v }}>
        <span>85,6 × 54 mm</span>
      </div>
      <div className="pad">
        <input type="range" min={2.5} max={12} step={0.01} value={v} onChange={(e) => setV(+e.target.value)} />
        <div className="row">
          <button className="chip" onClick={() => setV((x) => x - 0.02)}>−</button>
          <span className="muted">{v.toFixed(2)} px/mm</span>
          <button className="chip" onClick={() => setV((x) => x + 0.02)}>+</button>
        </div>
      </div>
    </div>
  )
}
