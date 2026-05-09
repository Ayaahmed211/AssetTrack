import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import './TopNavbar.css';

const firstNameFromUser = (u) => {
  if (!u) return 'there';
  const name = (u.fullName || '').trim();
  if (name) return name.split(/\s+/)[0];
  const email = (u.email || '').split('@')[0];
  return email || 'there';
};

const TopNavbar = ({
  title = 'Overview',
  user = { name: 'User', avatar: 'U' },
  developerMode = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (mounted) setUnreadCount(count);
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };

    loadUnreadCount();
    const timer = setInterval(loadUnreadCount, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const greetName = firstNameFromUser(authUser);

  return (
    <header className={`top-navbar${developerMode ? ' top-navbar--developer' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-left">
          {developerMode ? (
            <div className="navbar-greeting-block">
              <h1 className="navbar-greeting">Hello, {greetName}</h1>
            </div>
          ) : (
            <h1 className="navbar-title">{title}</h1>
          )}
        </div>

        <div className="navbar-right">
          <button className="navbar-icon-btn" title="Search" onClick={() => location.pathname === '/search' ? navigate(-1) : navigate('/search')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          <button className="navbar-icon-btn" title="Notifications" onClick={() => location.pathname === '/notifications' ? navigate(-1) : navigate('/notifications')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* User dropdown */}
          <div className="navbar-user-wrapper" ref={dropdownRef}>
            <div
              className="navbar-user"
              onClick={() => setDropdownOpen(prev => !prev)}
              title="Account"
            >
              <span className="user-avatar">{user.avatar}</span>
              <span className="user-name">{user.name}</span>
              <span className="user-dropdown" style={{
                display: 'inline-block',
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>▼</span>
            </div>

            {dropdownOpen && (
              <div className="user-dropdown-menu">
                {/* User info header */}
                <div className="dropdown-header">
                  <span className="dropdown-avatar">{user.avatar}</span>
                  <div>
                    <p className="dropdown-name">{authUser?.fullName || user.name}</p>
                    <p className="dropdown-email">{authUser?.email || ''}</p>
                    {authUser?.role && (
                      <span className="dropdown-role">{authUser.role}</span>
                    )}
                  </div>
                </div>

                <div className="dropdown-divider" />

                {authUser?.role !== 'DEVELOPER' && (
                  <>
                    <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                      Settings
                    </button>
                    <div className="dropdown-divider" />
                  </>
                )}

                <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
