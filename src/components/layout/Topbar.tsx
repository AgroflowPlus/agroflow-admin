import { MdNotifications, MdSearch, MdMenu } from 'react-icons/md'
import { RiSignalWifi3Fill } from 'react-icons/ri'
import './Topbar.css'

interface TopbarProps {
  title: string
  onMenuClick: () => void
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <MdMenu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <MdSearch size={16} color="#9ab88a" />
          <input type="text" placeholder="Search..." className="topbar-search-input" />
        </div>

        <span className="topbar-season">Q2 2026</span>

        <div className="topbar-live">
          <RiSignalWifi3Fill size={13} color="#6ab04c" />
          <span>Live</span>
        </div>

        <button className="topbar-bell" aria-label="Notifications">
          <MdNotifications size={19} />
          <span className="topbar-bell-dot" />
        </button>
      </div>
    </header>
  )
}