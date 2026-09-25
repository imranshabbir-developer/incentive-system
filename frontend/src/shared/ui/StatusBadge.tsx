const tone: Record<string, string> = {
  Active: 'ok',
  Approved: 'ok',
  Paid: 'ok',
  Verified: 'ok',
  Submitted: 'info',
  Received: 'info',
  Draft: 'muted',
  Pending: 'warn',
  Returned: 'warn',
  'Notice Period': 'warn',
  'Ready for Payment': 'info',
  Rejected: 'bad',
  Inactive: 'muted',
  Terminated: 'bad',
  Resigned: 'muted',
  Cancelled: 'bad',
  Unlocked: 'ok',
  Locked: 'warn',
  Pass: 'ok',
  Fail: 'bad',
  'N/A': 'muted',
  Resubmitted: 'info',
  'Under Finance Review': 'info',
  Finalized: 'info',
  Open: 'warn',
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge status-${tone[value] ?? 'muted'}`}>{value}</span>
}
