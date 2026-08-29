import { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Search, Users, User, Check, Sparkles } from 'lucide-react';
import './Modals.css';

const AVAILABLE_CONTACTS = [
  { id: 'u_rahul', name: 'Rahul Sharma', handle: '@rahul_sharma', role: 'Product Lead', initials: 'RS', avatarBg: '#6366F1' },
  { id: 'u_priya', name: 'Priya Singh', handle: '@priya_design', role: 'UI/UX Designer', initials: 'PS', avatarBg: '#EC4899' },
  { id: 'u_aman', name: 'Aman Kumar', handle: '@aman_backend', role: 'Backend Engineer', initials: 'AK', avatarBg: '#10B981' },
  { id: 'u_sarah', name: 'Sarah Chen', handle: '@sarah_chen', role: 'Frontend Architect', initials: 'SC', avatarBg: '#06B6D4' },
  { id: 'u_elena', name: 'Elena Rostova', handle: '@elena_devops', role: 'DevOps & Cloud', initials: 'ER', avatarBg: '#8B5CF6' },
  { id: 'u_david', name: 'David Kim', handle: '@david_mobile', role: 'Mobile Specialist', initials: 'DK', avatarBg: '#F59E0B' },
  { id: 'u_maya', name: 'Maya Patel', handle: '@maya_qa', role: 'QA Lead', initials: 'MP', avatarBg: '#3B82F6' },
];

export default function NewChatModal({ isOpen, onClose }) {
  const { createNewChat, selectChat, conversations } = useChat();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('DIRECT'); // 'DIRECT' | 'GROUP'
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupBio, setGroupBio] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  if (!isOpen) return null;

  const filteredContacts = AVAILABLE_CONTACTS.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
  });

  const handleStartDirectChat = (contact) => {
    // Check if conversation already exists
    const existing = conversations.find((c) => c.name.toLowerCase() === contact.name.toLowerCase());
    if (existing) {
      selectChat(existing.id);
      onClose();
      return;
    }

    const newChatId = createNewChat({
      name: contact.name,
      type: 'direct',
      initials: contact.initials,
      bio: `${contact.role} @ PulseChat.`,
    });
    selectChat(newChatId);
    onClose();
  };

  const handleToggleMember = (contact) => {
    if (selectedMembers.some((m) => m.id === contact.id)) {
      setSelectedMembers((prev) => prev.filter((m) => m.id !== contact.id));
    } else {
      setSelectedMembers((prev) => [...prev, contact]);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;

    const newChatId = createNewChat({
      name: groupName.trim(),
      type: 'group',
      bio: groupBio.trim() || `Group discussion for ${groupName.trim()}`,
      members: selectedMembers,
    });
    selectChat(newChatId);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="new-chat-title">
      <div className="modal-card modal-new-chat">
        <div className="modal-header">
          <div className="modal-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'DIRECT'}
              className={`modal-tab-btn ${activeTab === 'DIRECT' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIRECT')}
            >
              <User size={16} />
              <span>Direct Message</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'GROUP'}
              className={`modal-tab-btn ${activeTab === 'GROUP' ? 'active' : ''}`}
              onClick={() => setActiveTab('GROUP')}
            >
              <Users size={16} />
              <span>Create Group</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'DIRECT' ? (
            <>
              <div className="sidebar-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="sidebar-search-input"
                  placeholder="Search contacts by name, handle, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="contacts-modal-list">
                {filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="contact-modal-item"
                    onClick={() => handleStartDirectChat(c)}
                  >
                    <div className="avatar avatar-md" style={{ backgroundColor: c.avatarBg, color: '#FFFFFF' }}>
                      {c.initials}
                    </div>
                    <div className="contact-modal-info">
                      <span className="contact-modal-name">{c.name}</span>
                      <span className="contact-modal-role">{c.role} • {c.handle}</span>
                    </div>
                    <span className="btn btn-secondary btn-sm">Chat</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateGroup} className="group-form">
              <div className="input-group">
                <label htmlFor="group-name-input">Group Name *</label>
                <input
                  id="group-name-input"
                  type="text"
                  className="input-base"
                  placeholder="e.g. Mobile Architecture, Product Launch"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label htmlFor="group-bio-input">Description (Optional)</label>
                <input
                  id="group-bio-input"
                  type="text"
                  className="input-base"
                  placeholder="Purpose of this channel..."
                  value={groupBio}
                  onChange={(e) => setGroupBio(e.target.value)}
                />
              </div>

              <div className="members-select-header">
                <span>Select Members ({selectedMembers.length} selected)</span>
              </div>

              <div className="contacts-modal-list member-selection-list">
                {AVAILABLE_CONTACTS.map((c) => {
                  const isSelected = selectedMembers.some((m) => m.id === c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`contact-modal-item selectable ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleMember(c)}
                    >
                      <div className="avatar avatar-md" style={{ backgroundColor: c.avatarBg, color: '#FFFFFF' }}>
                        {c.initials}
                      </div>
                      <div className="contact-modal-info">
                        <span className="contact-modal-name">{c.name}</span>
                        <span className="contact-modal-role">{c.role}</span>
                      </div>
                      <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Check size={14} color="#FFFFFF" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="modal-footer" style={{ margin: '0 -20px -20px -20px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                >
                  Create Group
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
