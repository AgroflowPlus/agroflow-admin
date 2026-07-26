import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdLandscape,
  MdWarning,
  MdManageAccounts,
  MdSettings,
  MdImage,
  MdClose,
} from "react-icons/md";
import { PiLeafFill } from "react-icons/pi";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <MdDashboard size={17} /> },
  { label: "All Farmers", path: "/farmers", icon: <MdPeople size={17} /> },
  { label: "All Fields", path: "/fields", icon: <MdLandscape size={17} /> },
  { label: "Alerts", path: "/alerts", icon: <MdWarning size={17} /> },
  { label: "Content", path: "/content", icon: <MdImage size={17} /> },
  { label: "Users", path: "/users", icon: <MdManageAccounts size={17} /> },
  { label: "Settings", path: "/settings", icon: <MdSettings size={17} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <PiLeafFill size={18} color="black" />
        </div>
        <span className="sidebar-logo-text">
          AgroFlow<span>+</span>
        </span>
        <button className="sidebar-close-btn" onClick={onClose}>
          <MdClose size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Overview</p>
        {navItems.slice(0, 3).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <p className="sidebar-nav-label">Operations</p>
        {navItems.slice(3, 6).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <p className="sidebar-nav-label">System</p>
        {navItems.slice(6).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">SA</div>
        <div>
          <p className="sidebar-footer-name">Super Admin</p>
          <p className="sidebar-footer-email">admin@harvesta.io</p>
        </div>
      </div>
    </aside>
  );
}
