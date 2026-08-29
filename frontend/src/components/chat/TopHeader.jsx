import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import {
  MessageSquare,
  Shield,
  PhoneCall,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Check,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Sparkles,
} from 'lucide-react';
import './TopHeader.css';

export default function TopHeader({ onOpenSettings, onOpenNewChat }) {
  const { user, presence, setUserPresence, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, conversations, selectChat } = useChat();
  const location = useLocation();

  const [isPresenceOpen, setIsPresenceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const presenceRef = useRef(null);
  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (presenceRef.current && !presenceRef.current.contains(e.target)) {
        setIsPresenceOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadConversations = conversations.filter((c) => c.unreadCount > 0);

  const presenceOptions = [
    { key: 'online', label: 'Online', color: 'var(--status-online)', desc: 'Available for chats & calls' },
    { key: 'busy', label: 'Busy / Do Not Disturb', color: 'var(--status-error)', desc: 'Mute popups' },
    { key: 'away', label: 'Away', color: 'var(--status-warning)', desc: 'Step away from keyboard' },
    { key: 'offline', label: 'Invisible', color: 'var(--status-offline)', desc: 'Appear offline' },
  ];

  return (
    <header className="top-header" role="banner">
      <div className="top-header-left">
        <Link to="/" className="app-branding" aria-label="PulseChat Home">
          <div className="app-logo-badge">
            <MessageSquare size={18} color="#FFFFFF" />
          </div>
          <div className="app-name-wrap">
            <span className="app-name">PulseChat</span>
            <span className="app-badge-saas">SaaS v2.4</span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-tab ${location.pathname === '/' || location.pathname.startsWith('/chat') ? 'active' : ''}`}
          >
            <MessageSquare size={16} />
            <span>Messages</span>
            {totalUnread > 0 && <span className="nav-unread-badge">{totalUnread}</span>}
          </Link>

          <Link
            to="/surveillance"
            className={`nav-tab ${location.pathname === '/surveillance' || location.pathname.startsWith('/devices') ? 'active' : ''}`}
          >
            <Shield size={16} />
            <span>Devices & Hub</span>
          </Link>

          <Link
            to="/calls"
            className={`nav-tab ${location.pathname === '/calls' ? 'active' : ''}`}
          >
            <PhoneCall size={16} />
            <span>Call History</span>
          </Link>
        </nav>
      </div>

      <div className="top-header-right">
        {/* Presence Selector */}
        <div className="header-dropdown-container" ref={presenceRef}>
          <button
            type="button"
            className="presence-badge-btn"
            onClick={() => setIsPresenceOpen((prev) => !prev)}
            aria-expanded={isPresenceOpen}
            aria-label={`Status: ${presence}. Click to change.`}
          >
            <span
              className="presence-dot"
              style={{
                backgroundColor:
                  presence === 'online'
                    ? 'var(--status-online)'
                    : presence === 'busy'
                    ? 'var(--status-error)'
                    : presence === 'away'
                    ? 'var(--status-warning)'
                    : 'var(--status-offline)',
              }}
            />
            <span className="presence-label">
              {presence === 'online' ? 'Online' : presence === 'busy' ? 'Busy' : presence === 'away' ? 'Away' : 'Invisible'}
            </span>
            <ChevronDown size={14} className="dropdown-chevron" />
          </button>

          {isPresenceOpen && (
            <div className="popover-menu presence-dropdown" role="menu">
              <div className="dropdown-title">Set your status</div>
              {presenceOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`popover-item ${presence === opt.key ? 'selected' : ''}`}
                  onClick={() => {
                    setUserPresence(opt.key);
                    setIsPresenceOpen(false);
                  }}
                  role="menuitem"
                >
                  <span className="presence-dot" style={{ backgroundColor: opt.color }} />
                  <div className="presence-item-text">
                    <span className="presence-item-label">{opt.label}</span>
                    <span className="presence-item-desc">{opt.desc}</span>
                  </div>
                  {presence === opt.key && <Check size={14} color="var(--primary)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          title={soundEnabled ? 'Sound alerts enabled' : 'Sound alerts muted'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {/* Notifications Center */}
        <div className="header-dropdown-container" ref={notifyRef}>
          <button
            type="button"
            className="btn-icon header-notify-btn"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            aria-label={`Notifications ${totalUnread > 0 ? `(${totalUnread} unread)` : ''}`}
            aria-expanded={isNotificationsOpen}
          >
            <Bell size={18} />
            {totalUnread > 0 && <span className="header-dot-badge">{totalUnread}</span>}
          </button>

          {isNotificationsOpen && (
            <div className="popover-menu notifications-dropdown" role="menu">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <span className="badge badge-subtle">{totalUnread} unread</span>
              </div>
              <div className="notifications-list">
                {unreadConversations.length === 0 ? (
                  <div className="notifications-empty">
                    <Sparkles size={24} color="var(--primary)" />
                    <p>You're all caught up!</p>
                  </div>
                ) : (
                  unreadConversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="notification-item"
                      onClick={() => {
                        selectChat(c.id);
                        setIsNotificationsOpen(false);
                      }}
                    >
                      <div className="avatar avatar-sm" style={{ backgroundColor: c.avatarBg || 'var(--primary-light)' }}>
                        {c.initials || 'U'}
                      </div>
                      <div className="notification-info">
                        <div className="notification-name">{c.name}</div>
                        <div className="notification-snippet">{c.lastMessage?.text || 'New message'}</div>
                      </div>
                      <span className="badge badge-primary">{c.unreadCount}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          type="button"
          className="btn-icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="header-divider" />

        {/* User Profile Menu */}
        <div className="header-dropdown-container" ref={profileRef}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            <div className="avatar avatar-sm user-avatar" style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF' }}>
              {user?.initials || 'AM'}
              <span className={`status-indicator ${presence}`} />
            </div>
            <div className="user-profile-info">
              <span className="user-profile-name">{user?.name || 'Alex Morgan'}</span>
              <span className="user-profile-role">{user?.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
            </div>
            <ChevronDown size={14} className="dropdown-chevron" />
          </button>

          {isProfileOpen && (
            <div className="popover-menu profile-dropdown" role="menu">
              <div className="profile-dropdown-user">
                <div className="avatar avatar-md" style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF' }}>
                  {user?.initials || 'AM'}
                </div>
                <div className="profile-dropdown-meta">
                  <strong>{user?.name || 'Alex Morgan'}</strong>
                  <span className="text-secondary">{user?.email || 'alex@pulsechat.io'}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onOpenSettings) onOpenSettings('profile');
                }}
              >
                <User size={16} />
                <span>Account Profile</span>
              </button>

              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onOpenSettings) onOpenSettings('general');
                }}
              >
                <Settings size={16} />
                <span>Preferences & Audio</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="popover-item danger"
                onClick={() => {
                  setIsProfileOpen(false);
                  logoutUser();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
