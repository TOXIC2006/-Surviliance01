import { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  X,
  Phone,
  Video,
  Pin,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  FileText,
  Link2,
  Users,
  Mail,
  Smartphone,
  Trash2,
  Shield,
  Download,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Maximize2,
  Lock,
} from 'lucide-react';
import './DetailsPanel.css';

export default function DetailsPanel({ onClose }) {
  const {
    activeChat,
    activeChatId,
    activeMessages,
    toggleMute,
    togglePinConversation,
    clearChat,
    startCall,
    setLightboxImage,
    addToast,
  } = useChat();

  const [activeTab, setActiveTab] = useState('MEDIA'); // 'MEDIA' | 'FILES' | 'LINKS' | 'MEMBERS'

  // Extract shared media from messages
  const sharedMedia = useMemo(() => {
    const images = [];
    activeMessages.forEach((msg) => {
      if (msg.attachments) {
        msg.attachments.forEach((att) => {
          if (att.type === 'image') {
            images.push({ ...att, timestamp: msg.timestamp, sender: msg.senderName });
          }
        });
      }
    });
    return images;
  }, [activeMessages]);

  // Extract shared files from messages
  const sharedFiles = useMemo(() => {
    const files = [];
    activeMessages.forEach((msg) => {
      if (msg.attachments) {
        msg.attachments.forEach((att) => {
          if (att.type === 'file') {
            files.push({ ...att, timestamp: msg.timestamp, sender: msg.senderName });
          }
        });
      }
    });
    return files;
  }, [activeMessages]);

  // Extract shared links from message texts
  const sharedLinks = useMemo(() => {
    const links = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    activeMessages.forEach((msg) => {
      if (msg.text) {
        const matches = msg.text.match(urlRegex);
        if (matches) {
          matches.forEach((url) => {
            links.push({ url, timestamp: msg.timestamp, sender: msg.senderName });
          });
        }
      }
    });
    return links;
  }, [activeMessages]);

  if (!activeChat) return null;

  return (
    <aside className="chat-details-panel" aria-label="Conversation Details Panel">
      {/* Header */}
      <div className="details-header">
        <h3 className="details-header-title">Details</h3>
        <button
          type="button"
          className="btn-icon btn-sm"
          onClick={onClose}
          aria-label="Close details panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="details-body">
        {/* Profile Card */}
        <div className="details-profile-card">
          <div
            className="avatar avatar-xl details-avatar"
            style={{
              backgroundColor: activeChat.avatarBg || 'var(--primary)',
              color: '#FFFFFF',
            }}
          >
            {activeChat.avatar ? (
              <img src={activeChat.avatar} alt={activeChat.name} />
            ) : (
              activeChat.initials || activeChat.name.slice(0, 2).toUpperCase()
            )}
            {activeChat.type !== 'group' && (
              <span className={`status-indicator ${activeChat.status || 'offline'}`} />
            )}
          </div>

          <h4 className="details-name">{activeChat.name}</h4>
          <span className="details-handle">{activeChat.handle || '@user'}</span>
          <span className="badge badge-subtle mt-1">{activeChat.role || 'Member'}</span>

          {activeChat.bio && <p className="details-bio">{activeChat.bio}</p>}

          {/* Quick Actions */}
          <div className="details-quick-actions">
            <button
              type="button"
              className="quick-action-item"
              onClick={() => startCall('audio', activeChat)}
              aria-label="Voice call"
            >
              <div className="quick-action-icon">
                <Phone size={16} />
              </div>
              <span>Audio</span>
            </button>

            <button
              type="button"
              className="quick-action-item"
              onClick={() => startCall('video', activeChat)}
              aria-label="Video call"
            >
              <div className="quick-action-icon">
                <Video size={16} />
              </div>
              <span>Video</span>
            </button>

            <button
              type="button"
              className="quick-action-item"
              onClick={() => toggleMute(activeChatId)}
              aria-label={activeChat.isMuted ? 'Unmute' : 'Mute'}
            >
              <div className={`quick-action-icon ${activeChat.isMuted ? 'active-mute' : ''}`}>
                {activeChat.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </div>
              <span>{activeChat.isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              type="button"
              className="quick-action-item"
              onClick={() => togglePinConversation(activeChatId)}
              aria-label={activeChat.isPinned ? 'Unpin' : 'Pin'}
            >
              <div className={`quick-action-icon ${activeChat.isPinned ? 'active-pin' : ''}`}>
                <Pin size={16} />
              </div>
              <span>{activeChat.isPinned ? 'Pinned' : 'Pin'}</span>
            </button>
          </div>
        </div>

        {/* Contact Info (if direct chat) */}
        {activeChat.type === 'direct' && (activeChat.email || activeChat.phone) && (
          <div className="details-info-section">
            <div className="section-subtitle">Contact Information</div>
            {activeChat.email && (
              <div className="info-row">
                <Mail size={16} className="info-icon" />
                <div className="info-text">
                  <span className="info-label">Email</span>
                  <a href={`mailto:${activeChat.email}`} className="info-val">{activeChat.email}</a>
                </div>
              </div>
            )}
            {activeChat.phone && (
              <div className="info-row">
                <Smartphone size={16} className="info-icon" />
                <div className="info-text">
                  <span className="info-label">Phone</span>
                  <span className="info-val">{activeChat.phone}</span>
                </div>
              </div>
            )}
            <div className="info-row">
              <Lock size={16} className="info-icon" />
              <div className="info-text">
                <span className="info-label">Encryption</span>
                <span className="info-val" style={{ color: 'var(--status-online)' }}>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabbed Media / Files / Links / Members */}
        <div className="details-tabs-section">
          <div className="details-tabs-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'MEDIA'}
              className={`details-tab-btn ${activeTab === 'MEDIA' ? 'active' : ''}`}
              onClick={() => setActiveTab('MEDIA')}
            >
              <ImageIcon size={14} />
              <span>Media ({sharedMedia.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'FILES'}
              className={`details-tab-btn ${activeTab === 'FILES' ? 'active' : ''}`}
              onClick={() => setActiveTab('FILES')}
            >
              <FileText size={14} />
              <span>Files ({sharedFiles.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'LINKS'}
              className={`details-tab-btn ${activeTab === 'LINKS' ? 'active' : ''}`}
              onClick={() => setActiveTab('LINKS')}
            >
              <Link2 size={14} />
              <span>Links ({sharedLinks.length})</span>
            </button>

            {activeChat.type === 'group' && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'MEMBERS'}
                className={`details-tab-btn ${activeTab === 'MEMBERS' ? 'active' : ''}`}
                onClick={() => setActiveTab('MEMBERS')}
              >
                <Users size={14} />
                <span>Members ({activeChat.members?.length || 0})</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="details-tab-content">
            {activeTab === 'MEDIA' && (
              sharedMedia.length === 0 ? (
                <div className="tab-empty">No media shared yet</div>
              ) : (
                <div className="media-grid">
                  {sharedMedia.map((m, i) => (
                    <div
                      key={i}
                      className="media-thumb"
                      onClick={() => setLightboxImage(m.url)}
                    >
                      <img src={m.url} alt="Shared media" loading="lazy" />
                      <div className="media-thumb-overlay">
                        <Maximize2 size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'FILES' && (
              sharedFiles.length === 0 ? (
                <div className="tab-empty">No files shared yet</div>
              ) : (
                <div className="files-list">
                  {sharedFiles.map((f, i) => (
                    <div key={i} className="file-item-row">
                      <div className="file-item-icon">
                        <FileText size={18} color="var(--primary)" />
                      </div>
                      <div className="file-item-meta">
                        <span className="file-item-name">{f.name}</span>
                        <span className="file-item-size">{f.size}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-icon btn-sm"
                        onClick={() => addToast(`Downloading ${f.name}`, { type: 'info' })}
                        aria-label={`Download ${f.name}`}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'LINKS' && (
              sharedLinks.length === 0 ? (
                <div className="tab-empty">No links shared yet</div>
              ) : (
                <div className="links-list">
                  {sharedLinks.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-item-row"
                    >
                      <Link2 size={16} className="link-icon" />
                      <span className="link-url">{l.url}</span>
                      <ExternalLink size={14} className="link-ext" />
                    </a>
                  ))}
                </div>
              )
            )}

            {activeTab === 'MEMBERS' && activeChat.type === 'group' && (
              <div className="members-list">
                {activeChat.members?.map((mem) => (
                  <div key={mem.id} className="member-item-row">
                    <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {mem.initials || mem.name.slice(0, 2).toUpperCase()}
                      <span className={`status-indicator ${mem.status || 'offline'}`} />
                    </div>
                    <div className="member-meta">
                      <span className="member-name">{mem.name}</span>
                      <span className="member-role">{mem.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destructive Actions */}
        <div className="details-danger-section">
          <button
            type="button"
            className="danger-action-btn"
            onClick={() => clearChat(activeChatId)}
          >
            <Trash2 size={16} />
            <span>Clear Chat History</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
