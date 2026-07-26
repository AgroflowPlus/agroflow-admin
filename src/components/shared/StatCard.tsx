import './StatCard.css'
import type { ReactNode } from 'react'

interface StatCardProps {
  icon?: ReactNode
  label: string
  value: string | number
  sub?: string
  subType?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ icon, label, value, sub, subType = 'neutral' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <p className="stat-card-label">{label}</p>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <p className="stat-card-value">{value}</p>
      {sub && <p className={`stat-card-sub ${subType}`}>{sub}</p>}
    </div>
  )
}