import { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  Users,
  User,
  Pin,
  Check,
  CheckCheck,
  Sparkles,
  X,
  Shield,
  VolumeX,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onOpenNewChat }) {
  const {
    conversations,
    activeChatId,
    selectChat,
    typingUsers,
  } = useChat();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'DIRECT' | 'GROUPS' | 'UNREAD' | 'PINNED'

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Type / Status filter
      if (activeFilter === 'DIRECT' && c.type !== 'direct') return false;
      if (activeFilter === 'GROUPS' && c.type !== 'group') return false;
      if (activeFilter === 'UNREAD' && (!c.unreadCount || c.unreadCount === 0)) return false;
      if (activeFilter === 'PINNED' && !c.isPinned) return false;

      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesSnippet = c.lastMessage?.text?.toLowerCase().includes(query);
        const matchesHandle = c.handle?.toLowerCase().includes(query);
        return matchesName || matchesSnippet || matchesHandle;
      }

      return true;
    }).sort((a, b) => {
      // Pinned chats on top if viewing ALL
      if (activeFilter === 'ALL') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
    });
  }, [conversations, activeFilter, searchQuery]);

  // Format relative timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)} min`;
    if (diff < day) return `${Math.floor(diff / hour)} hr`;
    if (diff < 2 * day) return 'Yesterday';

    const d = new Date(timestamp);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <aside className="chat-sidebar" aria-label="Conversations Sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-title-wrap">
            <h2 className="sidebar-title">Chats</h2>
            {totalUnread > 0 && (
              <span className="sidebar-unread-pill" aria-label={`${totalUnread} unread messages`}>
                {totalUnread}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm sidebar-new-btn"
            onClick={onOpenNewChat}
            aria-label="Start New Chat"
            title="Start new conversation (Ctrl+N)"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search conversations, people, groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversations"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-icon btn-sm search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="sidebar-filter-tabs" role="tablist" aria-label="Conversation filters">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'ALL'}
            className={`filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'DIRECT'}
            className={`filter-chip ${activeFilter === 'DIRECT' ? 'active' : ''}`}
            onClick={() => setActiveFilter('DIRECT')}
          >
            <User size={13} />
            <span>Direct</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'GROUPS'}
            className={`filter-chip ${activeFilter === 'GROUPS' ? 'active' : ''}`}
            onClick={() => setActiveFilter('GROUPS')}
          >
            <Users size={13} />
            <span>Groups</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'UNREAD'}
            className={`filter-chip ${activeFilter === 'UNREAD' ? 'active' : ''}`}
            onClick={() => setActiveFilter('UNREAD')}
          >
            <span>Unread</span>
            {totalUnread > 0 && <span className="chip-badge">{totalUnread}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'PINNED'}
            className={`filter-chip ${activeFilter === 'PINNED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PINNED')}
          >
            <Pin size={13} />
            <span>Pinned</span>
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="conversation-list" role="list">
        {filteredConversations.length === 0 ? (
          <div className="sidebar-empty">
            <Sparkles size={32} color="var(--primary)" />
            <p className="sidebar-empty-title">No conversations found</p>
            <p className="sidebar-empty-desc">
              {searchQuery ? `No matches for "${searchQuery}"` : 'Try selecting another filter or start a new chat.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm mt-2"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm mt-2"
                onClick={onOpenNewChat}
              >
                <Plus size={14} />
                <span>New Chat</span>
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isActive = c.id === activeChatId;
            const isTyping = typingUsers[c.id] && typingUsers[c.id].length > 0;
            const isMine = c.lastMessage?.senderId === user?.userId;

            return (
              <button
                key={c.id}
                type="button"
                role="listitem"
                className={`conversation-item ${isActive ? 'active' : ''} ${c.unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => selectChat(c.id)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Chat with ${c.name}. ${c.unreadCount > 0 ? `${c.unreadCount} unread messages.` : ''}`}
              >
                {/* Avatar */}
                <div
                  className="avatar avatar-md conversation-avatar"
                  style={{
                    backgroundColor: c.avatarBg || 'var(--primary-light)',
                    color: c.avatarBg ? '#FFFFFF' : 'var(--primary)',
                  }}
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} />
                  ) : c.type === 'bot' ? (
                    <Shield size={20} color="#FFFFFF" />
                  ) : (
                    c.initials || c.name.slice(0, 2).toUpperCase()
                  )}
                  {c.type !== 'group' && (
                    <span className={`status-indicator ${c.status || 'offline'}`} />
                  )}
                </div>

                {/* Info */}
                <div className="conversation-info">
                  <div className="conversation-row-top">
                    <div className="conversation-name-wrap">
                      <span className="conversation-name">{c.name}</span>
                      {c.isPinned && (
                        <Pin size={12} className="pinned-icon" aria-label="Pinned conversation" />
                      )}
                      {c.isMuted && (
                        <VolumeX size={12} className="muted-icon" aria-label="Muted notifications" />
                      )}
                    </div>
                    <span className="conversation-time">
                      {formatTime(c.lastMessage?.timestamp)}
                    </span>
                  </div>

                  <div className="conversation-row-bottom">
                    {isTyping ? (
                      <span className="typing-snippet">
                        <span className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </span>
                        typing...
                      </span>
                    ) : (
                      <div className="conversation-snippet-wrap">
                        {isMine && (
                          <span className="status-tick">
                            {c.lastMessage?.status === 'read' ? (
                              <CheckCheck size={14} color="var(--primary)" />
                            ) : c.lastMessage?.status === 'delivered' ? (
                              <CheckCheck size={14} color="var(--text-muted)" />
                            ) : (
                              <Check size={14} color="var(--text-muted)" />
                            )}
                          </span>
                        )}
                        <span className="conversation-snippet">
                          {c.lastMessage?.text || 'No messages yet'}
                        </span>
                      </div>
                    )}

                    {c.unreadCount > 0 && (
                      <span className="unread-count-badge" aria-label={`${c.unreadCount} unread`}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
