import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiLogIn, FiLogOut, FiGrid } from 'react-icons/fi';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">F</div>
          <span>FoodShare</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <FiHome size={16} />
            <span>Home</span>
          </Link>

          {user ? (
            <>
              <Link 
                to={user.role === 'donor' ? '/donor' : '/ngo'} 
                className={`nav-link ${['/donor', '/ngo'].includes(location.pathname) ? 'active' : ''}`}
              >
                <FiGrid size={16} />
                <span>Dashboard</span>
              </Link>
              
              <NotificationBell />
              
              <div className="nav-user">
                <div className="nav-user-info">
                  <div className="nav-user-name">{user.displayName}</div>
                  <div className="nav-user-role">{user.role}</div>
                </div>
                <div className="nav-avatar">
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
                <button className="nav-link" onClick={handleLogout} id="logout-btn">
                  <FiLogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                <FiLogIn size={16} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
