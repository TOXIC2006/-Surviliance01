import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { playReceivedSound } from '../../utils/sound';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  User,
  Sliders,
  Keyboard,
  Shield,
  Check,
} from 'lucide-react';
import './Modals.css';

export default function SettingsModal({ isOpen, onClose, initialTab = 'general' }) {
  const { user, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, addToast } = useChat();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      statusMessage,
      initials: name.slice(0, 2).toUpperCase(),
    });
    addToast('Profile updated successfully', { type: 'success' });
    onClose();
  };

  const handleTestSound = () => {
    playReceivedSound();
    addToast('Sound chime played', { type: 'info' });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-card modal-settings">
        <div className="modal-header">
          <h3 id="settings-title">Application Settings</h3>
          <button
            type="button"
            className="btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="settings-layout">
          {/* Settings Sidebar Tabs */}
          <div className="settings-nav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'general'}
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Sliders size={16} />
              <span>General & Theme</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'profile'}
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Profile & Account</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'shortcuts'}
              className={`settings-nav-item ${activeTab === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              <Keyboard size={16} />
              <span>Keyboard Shortcuts</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {activeTab === 'general' && (
              <div className="settings-pane">
                <div className="settings-group">
                  <label className="settings-group-label">Color Theme</label>
                  <div className="theme-options-grid">
                    <button
                      type="button"
                      className={`theme-card ${theme === 'light' ? 'selected' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <Sun size={20} />
                      <span className="theme-card-title">Light</span>
                      <span className="theme-card-desc">Indigo + Slate White</span>
                    </button>

                    <button
                      type="button"
                      className={`theme-card ${theme === 'dark' ? 'selected' : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <Moon size={20} />
                      <span className="theme-card-title">Dark</span>
                      <span className="theme-card-desc">Deep Slate Indigo</span>
                    </button>

                    <button
                      type="button"
                      className={`theme-card ${theme === 'system' ? 'selected' : ''}`}
                      onClick={() => setTheme('system')}
                    >
                      <Laptop size={20} />
                      <span className="theme-card-title">System</span>
                      <span className="theme-card-desc">Follow OS preference</span>
                    </button>
                  </div>
                </div>

                <div className="settings-group mt-2">
                  <label className="settings-group-label">Sound & Audio Effects</label>
                  <div className="setting-toggle-row">
                    <div className="setting-toggle-info">
                      <span className="setting-title">Notification Chimes</span>
                      <span className="setting-desc">Play synthesized audio chimes for new incoming messages</span>
                    </div>
                    <button
                      type="button"
                      className={`toggle-switch ${soundEnabled ? 'on' : ''}`}
                      onClick={() => setSoundEnabled((prev) => !prev)}
                      aria-label="Toggle notification sounds"
                    >
                      <span className="toggle-slider" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm mt-2"
                    onClick={handleTestSound}
                  >
                    <Volume2 size={14} />
                    <span>Test Notification Chime</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="settings-pane">
                <div className="input-group">
                  <label htmlFor="edit-name">Display Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="input-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="input-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="edit-status">Status Message / Bio</label>
                  <input
                    id="edit-status"
                    type="text"
                    className="input-base"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="What are you working on?"
                  />
                </div>

                <div className="modal-footer" style={{ margin: 'auto -20px -20px -20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'shortcuts' && (
              <div className="settings-pane">
                <div className="shortcuts-list">
                  <div className="shortcut-row">
                    <span className="shortcut-action">Send Message</span>
                    <span className="hint-kbd">Enter</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-action">New Line</span>
                    <div className="keys-wrap">
                      <span className="hint-kbd">Shift</span> + <span className="hint-kbd">Enter</span>
                    </div>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-action">Search Messages in Chat</span>
                    <div className="keys-wrap">
                      <span className="hint-kbd">Ctrl</span> + <span className="hint-kbd">F</span>
                    </div>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-action">Close Modal / Lightbox</span>
                    <span className="hint-kbd">Escape</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
