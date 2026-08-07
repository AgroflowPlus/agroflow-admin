import { NavLink } from 'react-router-dom'
import { MdDashboard, MdVerifiedUser, MdManageAccounts, MdSettings } from 'react-icons/md'
import './BottomNav.css'

const items = [
  { to: '/dashboard', icon: <MdDashboard size={22} />, label: 'Home' },
  { to: '/verification', icon: <MdVerifiedUser size={22} />, label: 'Verify' },
  { to: '/users', icon: <MdManageAccounts size={22} />, label: 'Users' },
  { to: '/settings', icon: <MdSettings size={22} />, label: 'Settings' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? ' active' : ''}`
          }
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}