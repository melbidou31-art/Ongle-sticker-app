// Surface quadrillée (1 carreau = 5 mm), comme la zone de traçage de la vidéo.
// variant : 'grid' (clair quadrillé), 'dark' (fond noir, contraste maximal), 'plain' (blanc uni, lumière maximale)
export default function Grid({ pxPerMm, children, className = '', variant = 'grid' }) {
  const s = 5 * pxPerMm
  return (
    <div className={`grid-surface ${variant} ${className}`} style={{ backgroundSize: `${s}px ${s}px` }}>
      {children}
    </div>
  )
}
