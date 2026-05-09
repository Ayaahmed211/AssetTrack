import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import './TopNavbar.css';

const TopNavbar = ({ title = 'Overview', user = { name: 'User', avatar: 'U' } }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <header className="top-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h1 className="navbar-title">{title}</h1>
        </div>
        
        <div className="navbar-right">
          <button className="navbar-icon-btn" title="Search" onClick={() => navigate('/search')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          
          <button className="navbar-icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notification-badge">{unreadCount}</span>
          </button>

          <button className="navbar-icon-btn" title="Controls">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
              <circle cx="9" cy="7" r="2"/>
              <circle cx="15" cy="12" r="2"/>
              <circle cx="11" cy="17" r="2"/>
            </svg>
          </button>
          
          <div className="navbar-user">
            <span className="user-avatar">{user.avatar}</span>
            <span className="user-name">{user.name}</span>
            <span className="user-dropdown">▼</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
