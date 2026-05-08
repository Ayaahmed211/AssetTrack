import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import './MainLayout.css';

const MainLayout = ({ children, title }) => {
  const { user } = useAuth();
  
  const displayUser = user ? {
    name: user.fullName || user.email || 'User',
    avatar: user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 
            user.email ? user.email.substring(0, 2).toUpperCase() : 'U'
  } : {
    name: 'User',
    avatar: 'U'
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <TopNavbar title={title} user={displayUser} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
