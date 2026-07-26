import { MdSearch, MdClose } from 'react-icons/md'
import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="search-bar">
      <MdSearch size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>
          <MdClose size={15} />
        </button>
      )}
    </div>
  )
}