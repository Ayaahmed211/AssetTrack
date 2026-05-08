import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'assets', label: 'Assets' },
      { id: 'reports', label: 'Reports' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'settings', label: 'Settings' },
      { id: 'users', label: 'Users' },
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">AT</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
            title={item.label}
          >
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={handleLogout} title="Logout">
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
