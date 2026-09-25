export function FinanceLoader({ label = 'Opening your finance workspace' }: { label?: string }) {
  return (
    <div className="loader-overlay" role="status" aria-live="polite">
      <div className="finance-loader">
        <div className="coin">
          <span>$</span>
        </div>
        <strong>FIMS</strong>
        <p className="muted">{label}</p>
      </div>
    </div>
  )
}
