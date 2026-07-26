import './StatusBadge.css'

type Status = 'active' | 'warning' | 'danger' | 'info' | 'suspended' | 'resolved' | 'critical'

interface StatusBadgeProps {
  status: Status
  label?: string
}

const labelMap: Record<Status, string> = {
  active:    'Active',
  warning:   'Warning',
  danger:    'Alert',
  info:      'Info',
  suspended: 'Suspended',
  resolved:  'Resolved',
  critical:  'Critical',
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${status}`}>
      {label ?? labelMap[status]}
    </span>
  )
}