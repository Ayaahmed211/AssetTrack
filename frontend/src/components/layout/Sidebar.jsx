import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'MANAGER'] },
      { id: 'my-assets', label: 'My Assets', path: '/my-assets', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
      { id: 'assets', label: 'Assets', path: '/assets', roles: ['ADMIN', 'MANAGER', 'DEVELOPER'] },
      { id: 'reports', label: 'Reports', path: '/reports', roles: ['ADMIN', 'MANAGER'] },
      { id: 'analytics', label: 'Analytics', path: '/analytics', roles: ['ADMIN', 'MANAGER'] },
      { id: 'settings', label: 'Settings', path: '/settings', roles: ['ADMIN', 'MANAGER'] },
      { id: 'users', label: 'Users', path: '/users', roles: ['ADMIN'] },
    ],
    []
  );

  // Filter items based on user role
  const filteredMenuItems = useMemo(() => {
    if (!user || !user.role) return [];
    return menuItems.filter(item => item.roles.includes(user.role));
  }, [user, menuItems]);

  const activeItem = useMemo(() => {
    const currentPath = location.pathname;
    const item = menuItems.find(item => item.path === currentPath);
    return item ? item.id : 'dashboard';
  }, [location.pathname, menuItems]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">AT</div>
      </div>
      
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleNavigate(item.path)}
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
