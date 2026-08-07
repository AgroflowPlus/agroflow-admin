import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdWarning,
  MdManageAccounts,
  MdSettings,
  MdImage,
  MdClose,
  MdVerifiedUser,
  MdLogout,
} from "react-icons/md";
import { PiLeafFill } from "react-icons/pi";
import "./Sidebar.css";

// ── Remove token function ──────────────────────────────────────────
const removeToken = () => {
  localStorage.removeItem('agroflow_token');
  localStorage.removeItem('agf_token');
};

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <MdDashboard size={17} /> },
  { label: "Alerts", path: "/alerts", icon: <MdWarning size={17} /> },
  { label: "Content", path: "/content", icon: <MdImage size={17} /> },
  { label: "Users", path: "/users", icon: <MdManageAccounts size={17} /> },
  { label: "Verification", path: "/verification", icon: <MdVerifiedUser size={17} /> },
  { label: "Settings", path: "/settings", icon: <MdSettings size={17} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('agroflow_user');
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar${isOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <PiLeafFill size={18} color="#141f15" />
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
          {navItems.slice(0, 1).map((item) => (
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
          {navItems.slice(1, 4).map((item) => (
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

          <p className="sidebar-nav-label">Management</p>
          {navItems.slice(4).map((item) => (
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

        {/* ── Footer ── */}
        <div className="sidebar-footer-user">
          <div className="sidebar-footer-avatar">SA</div>
          <div className="sidebar-footer-info">
            <p className="sidebar-footer-name">Super Admin</p>
            <p className="sidebar-footer-email">admin@agroflow.com</p>
          </div>
        </div>
        <button 
          className="sidebar-logout-item" 
          onClick={() => setShowLogoutConfirm(true)}
        >
          <span className="sidebar-nav-icon"><MdLogout size={17} /></span>
          Log Out
        </button>
      </aside>

      {/* ── Logout Confirmation Modal (Outside Sidebar) ────────────── */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Log out?</h3>
            <p>You'll need to sign in again to access the admin dashboard.</p>
            <div className="logout-modal-actions">
              <button 
                className="logout-cancel-btn" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-btn" 
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}