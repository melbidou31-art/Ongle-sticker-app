// Surface claire quadrillée (1 carreau = 5 mm), comme la zone de traçage de la vidéo
export default function Grid({ pxPerMm, children, className = '' }) {
  const s = 5 * pxPerMm
  return (
    <div className={`grid-surface ${className}`} style={{ backgroundSize: `${s}px ${s}px` }}>
      {children}
    </div>
  )
}
