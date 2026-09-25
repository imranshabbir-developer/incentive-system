import { useEffect, useRef, useState } from 'react'

export type SelectOption = { value: string; label: string; disabled?: boolean }

type Props = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

export function Select({ label, value, options, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const selected = options.find((item) => item.value === value)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="ui-field">
      <span>{label}</span>
      <div className={`ui-select${open ? ' open' : ''}${disabled ? ' is-disabled' : ''}`} ref={box}>
        <button type="button" disabled={disabled} onClick={() => setOpen((v) => !v)}>
          <span>{selected?.label ?? 'Select'}</span>
          <span className="ui-select-caret" aria-hidden>▾</span>
        </button>
        {open ? (
          <ul role="listbox">
            {options.map((item) => (
              <li key={item.value || item.label}>
                <button
                  type="button"
                  disabled={item.disabled}
                  className={item.value === value ? 'is-selected' : ''}
                  onClick={() => {
                    if (item.disabled) return
                    onChange(item.value)
                    setOpen(false)
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
