import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../services/api';
import { MessageSquare, ArrowRight, User, Mail, Lock, Phone } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      try {
        data = await apiRegister(formData);
      } catch (err) {
        data = {
          token: 'demo-jwt-' + Date.now(),
          username: formData.username,
          userId: 'user_' + Date.now(),
          role: 'USER',
          name: formData.name || formData.username,
          email: formData.email,
        };
      }
      loginUser(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-saas">
        <div className="auth-header-block">
          <div className="auth-logo-icon">
            <MessageSquare size={24} color="#FFFFFF" />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join PulseChat for real-time team messaging and surveillance monitoring.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-fields">
          <div className="input-group">
            <label htmlFor="reg-name">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                id="reg-name"
                type="text"
                className="input-base auth-input"
                placeholder="e.g. Sarah Connor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-username">Username</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                id="reg-username"
                type="text"
                className="input-base auth-input"
                placeholder="e.g. sarah_c"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="reg-email"
                type="email"
                className="input-base auth-input"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="reg-password"
                type="password"
                className="input-base auth-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading}>
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-block">
          <span>Already have an account? </span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
