import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  const initial = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">🛡️</span>
        Surveil
      </Link>

      <div className="navbar-links">
        <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>
          Dashboard
        </Link>
        <Link to="/calls" className={`navbar-link ${location.pathname === '/calls' ? 'active' : ''}`}>
          Calls
        </Link>
      </div>

      <div className="navbar-actions">
        <div className="navbar-user">
          <div className="navbar-avatar">{initial}</div>
          <span>{user?.username}</span>
        </div>
        <button onClick={handleLogout} className="navbar-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
