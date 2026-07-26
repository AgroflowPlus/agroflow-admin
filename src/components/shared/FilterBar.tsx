import './FilterBar.css'

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  filters: {
    key: string
    label: string
    options: FilterOption[]
    value: string
    onChange: (val: string) => void
  }[]
}

export default function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {filters.map(f => (
        <select
          key={f.key}
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
          className="filter-select"
        >
          <option value="">{f.label}: All</option>
          {f.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
    </div>
  )
}