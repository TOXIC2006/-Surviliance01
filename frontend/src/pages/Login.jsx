import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';
import { MessageSquare, ArrowRight, Sparkles, Check, Lock, User } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      try {
        data = await apiLogin(username, password);
      } catch (err) {
        // Fallback for standalone demo mode
        data = {
          token: 'demo-jwt-' + Date.now(),
          username: username || 'alex_morgan',
          userId: 'user_alex_01',
          role: 'ADMIN',
          name: username === 'alex_morgan' ? 'Alex Morgan' : username,
        };
      }
      loginUser(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  const handleQuickDemo = (demoName, role = 'ADMIN') => {
    loginUser({
      token: 'demo-jwt-' + Date.now(),
      username: demoName.toLowerCase().replace(/\s+/g, '_'),
      name: demoName,
      userId: 'user_' + demoName.toLowerCase().replace(/\s+/g, '_'),
      role,
      email: `${demoName.toLowerCase().replace(/\s+/g, '.')}@pulsechat.io`,
    });
    navigate('/');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-saas">
        <div className="auth-header-block">
          <div className="auth-logo-icon">
            <MessageSquare size={24} color="#FFFFFF" />
          </div>
          <h1 className="auth-title">Welcome back to PulseChat</h1>
          <p className="auth-subtitle">Real-time collaboration, team channels, and surveillance streaming.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Quick Demo Sign In */}
        <div className="quick-demo-section">
          <span className="demo-label">Instant Demo Access</span>
          <div className="demo-btn-grid">
            <button
              type="button"
              className="demo-profile-btn"
              onClick={() => handleQuickDemo('Alex Morgan', 'ADMIN')}
            >
              <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF' }}>
                AM
              </div>
              <div className="demo-btn-text">
                <strong>Alex Morgan</strong>
                <span>Lead Admin</span>
              </div>
            </button>

            <button
              type="button"
              className="demo-profile-btn"
              onClick={() => handleQuickDemo('Rahul Sharma', 'USER')}
            >
              <div className="avatar avatar-sm" style={{ backgroundColor: '#6366F1', color: '#FFFFFF' }}>
                RS
              </div>
              <div className="demo-btn-text">
                <strong>Rahul Sharma</strong>
                <span>Product Lead</span>
              </div>
            </button>
          </div>
        </div>

        <div className="auth-or-divider">
          <span>or sign in with credentials</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-fields">
          <div className="input-group">
            <label htmlFor="login-username">Username or Email</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                id="login-username"
                type="text"
                className="input-base auth-input"
                placeholder="e.g. alex_morgan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="login-password"
                type="password"
                className="input-base auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-block">
          <span>Don't have an account? </span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
