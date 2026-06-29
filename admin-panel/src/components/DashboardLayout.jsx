import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  Upload,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';

const DashboardLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'View Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Student Registration', path: '/registrations/view', icon: <FileText size={20} /> },
    { name: 'Upload File', path: '/upload-file', icon: <Upload size={20} /> },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="admin-sidebar-title">Ledger Admin</div>
            <div className="admin-sidebar-subtitle">Student Payments</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" onClick={onLogout} className="admin-logout-btn">
            <LogOut size={18} />
            Logout Account
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>Admin Dashboard</span>
          <div style={{ width: '2.5rem' }} />
        </header>

        <main className="admin-main">
          <div className="admin-main-inner fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
