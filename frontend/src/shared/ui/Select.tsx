import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [query, setQuery] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const selected = options.find((item) => item.value === value)
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((item) => item.label.toLowerCase().includes(q) || item.value.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (open) search.current?.focus()
    else setQuery('')
  }, [open])

  function pick(next: string) {
    onChange(next)
    setOpen(false)
  }

  return (
    <div className="ui-field">
      <span>{label}</span>
      <div className={`ui-select${open ? ' open' : ''}${disabled ? ' is-disabled' : ''}`} ref={box}>
        <button type="button" disabled={disabled} onClick={() => setOpen((v) => !v)}>
          <span>{selected?.label ?? 'Select'}</span>
          <span className="ui-select-caret" aria-hidden>▾</span>
        </button>
        {open ? (
          <div className="ui-select-menu">
            <input
              ref={search}
              className="ui-select-search"
              type="search"
              value={query}
              placeholder="Search"
              aria-label={`Search ${label}`}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setOpen(false)
                  return
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  const first = shown.find((item) => !item.disabled)
                  if (first) pick(first.value)
                }
              }}
            />
            <ul role="listbox">
              {shown.length ? shown.map((item) => (
                <li key={item.value || item.label}>
                  <button
                    type="button"
                    disabled={item.disabled}
                    className={item.value === value ? 'is-selected' : ''}
                    onClick={() => {
                      if (item.disabled) return
                      pick(item.value)
                    }}
                  >
                    <span className="ui-select-option-text">{item.label}</span>
                  </button>
                </li>
              )) : (
                <li className="ui-select-empty">No matches</li>
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
