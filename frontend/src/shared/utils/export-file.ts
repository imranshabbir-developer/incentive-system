function esc(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function stamp() {
  return new Date().toLocaleString()
}

function documentHtml(title: string, meta: string, columns: string[], rows: Array<Array<string | number>>) {
  const body = rows.length
    ? rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${esc(String(cell ?? ''))}</td>`).join('')}</tr>`,
        )
        .join('')
    : `<tr><td colspan="${columns.length}">No records for the selected filters.</td></tr>`
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #111827; margin: 32px; }
    .brand { color: #166534; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; }
    h1 { margin: 6px 0 8px; color: #14532d; font-size: 22px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #166534; color: #fff; text-align: left; padding: 9px 10px; font-size: 12px; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .foot { margin-top: 22px; font-size: 11px; color: #9ca3af; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <div class="brand">IPS-USA · FINANCE INCENTIVE MANAGEMENT SYSTEM</div>
  <h1>${esc(title)}</h1>
  <p class="meta">${esc(meta)}</p>
  <table>
    <thead><tr>${columns.map((col) => `<th>${esc(col)}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody>
  </table>
  <p class="foot">Confidential · Generated ${esc(stamp())} · Do not include card data</p>
</body>
</html>`
}

function triggerDownload(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportCsv(filename: string, columns: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const body = [columns.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n')
  triggerDownload(filename, 'text/csv;charset=utf-8;', `\uFEFF${body}`)
}

export function exportExcel(filename: string, title: string, meta: string, columns: string[], rows: Array<Array<string | number>>) {
  triggerDownload(filename, 'application/vnd.ms-excel', documentHtml(title, meta, columns, rows))
}

export function exportWord(filename: string, title: string, meta: string, columns: string[], rows: Array<Array<string | number>>) {
  triggerDownload(filename, 'application/msword', documentHtml(title, meta, columns, rows))
}

export function exportPdf(title: string, meta: string, columns: string[], rows: Array<Array<string | number>>) {
  const html = documentHtml(title, meta, columns, rows)
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  if (!doc) {
    frame.remove()
    return
  }
  doc.open()
  doc.write(html)
  doc.close()
  window.setTimeout(() => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    window.setTimeout(() => frame.remove(), 1200)
  }, 250)
}
