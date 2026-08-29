import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Pin,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Play,
  Pause,
  Reply,
  Edit2,
  Trash2,
  Copy,
  Info,
  Check,
  CheckCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  File as FileIcon,
  Square,
} from 'lucide-react';
import './ActiveChat.css';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🚀', '👏', '🙏', '💯', '✨', '👀', '💡', '✅', '🍕'];

export default function ActiveChat({ onBack, onOpenDetails }) {
  const {
    activeChat,
    activeChatId,
    activeMessages,
    sendMessage,
    reactToMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    clearChat,
    toggleMute,
    togglePinConversation,
    startCall,
    typingUsers,
    isDetailsOpen,
    toggleDetails,
    setLightboxImage,
    addToast,
    isSearchInChatOpen,
    setIsSearchInChatOpen,
    searchInChatQuery,
    setSearchInChatQuery,
  } = useChat();

  const { user } = useAuth();

  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [stagedAttachments, setStagedAttachments] = useState([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const moreMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const recordTimerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, typingUsers[activeChatId]]);

  // Focus input when changing chat
  useEffect(() => {
    setReplyingTo(null);
    setStagedAttachments([]);
    setEditingMessageId(null);
    setIsEmojiPickerOpen(false);
    setIsRecordingVoice(false);
    textareaRef.current?.focus();
  }, [activeChatId]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setIsEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Filter messages for in-chat search
  const searchMatches = useMemo(() => {
    if (!searchInChatQuery.trim()) return [];
    return activeMessages
      .map((m, idx) => ({ id: m.id, idx }))
      .filter((item) => {
        const msg = activeMessages[item.idx];
        return msg.text?.toLowerCase().includes(searchInChatQuery.toLowerCase());
      });
  }, [activeMessages, searchInChatQuery]);

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  };

  const handleNextSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (searchMatchIndex + 1) % searchMatches.length;
    setSearchMatchIndex(nextIdx);
    scrollToMessage(searchMatches[nextIdx].id);
  };

  const handlePrevSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setSearchMatchIndex(prevIdx);
    scrollToMessage(searchMatches[prevIdx].id);
  };

  // Find pinned message object
  const pinnedMessage = useMemo(() => {
    if (!activeChat?.pinnedMessageId) return null;
    return activeMessages.find((m) => m.id === activeChat.pinnedMessageId) || null;
  }, [activeChat, activeMessages]);

  // Handle Submit
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && stagedAttachments.length === 0 && !isRecordingVoice) return;

    sendMessage(activeChatId, {
      text: messageText,
      attachments: stagedAttachments,
      replyTo: replyingTo,
    });

    setMessageText('');
    setStagedAttachments([]);
    setReplyingTo(null);
    setIsEmojiPickerOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle File Upload Staging
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map((file) => {
      const isImg = file.type.startsWith('image/');
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      return {
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: isImg ? 'image' : 'file',
        name: file.name,
        size: sizeStr,
        url: isImg ? URL.createObjectURL(file) : '',
        ext: file.name.split('.').pop() || 'file',
      };
    });

    setStagedAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const newAttachments = files.map((file) => {
        const isImg = file.type.startsWith('image/');
        const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
        return {
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          type: isImg ? 'image' : 'file',
          name: file.name,
          size: sizeStr,
          url: isImg ? URL.createObjectURL(file) : '',
          ext: file.name.split('.').pop() || 'file',
        };
      });
      setStagedAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  // Handle Voice Recording Send
  const handleSendVoiceNote = () => {
    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    sendMessage(activeChatId, {
      text: '',
      voiceNote: {
        duration: durationStr,
        seconds: recordingSeconds,
      },
      replyTo: replyingTo,
    });
    setIsRecordingVoice(false);
    setReplyingTo(null);
  };

  // Copy text helper
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Message copied to clipboard', { type: 'success' });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeChat) {
    return null;
  }

  const typingList = typingUsers[activeChatId] || [];

  return (
    <div
      className={`active-chat-container ${isDraggingOver ? 'dragging-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & drop overlay */}
      {isDraggingOver && (
        <div className="drag-overlay">
          <Paperclip size={48} color="var(--primary)" />
          <p>Drop files here to send</p>
        </div>
      )}

      {/* 1. Chat Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <button
            type="button"
            className="btn-icon mobile-back-btn"
            onClick={onBack}
            aria-label="Back to conversations list"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            type="button"
            className="chat-header-profile"
            onClick={toggleDetails}
            aria-label="View conversation details"
          >
            <div
              className="avatar avatar-md"
              style={{
                backgroundColor: activeChat.avatarBg || 'var(--primary-light)',
                color: activeChat.avatarBg ? '#FFFFFF' : 'var(--primary)',
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

            <div className="chat-header-info">
              <h2 className="chat-header-name">{activeChat.name}</h2>
              <span className="chat-header-status">
                {activeChat.type === 'group' ? (
                  activeChat.lastSeen
                ) : activeChat.status === 'online' ? (
                  <span className="online-label">
                    <span className="online-dot" /> Online
                  </span>
                ) : (
                  activeChat.lastSeen || 'Offline'
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Header Actions */}
        <div className="chat-header-actions">
          <button
            type="button"
            className={`btn-icon ${isSearchInChatOpen ? 'active' : ''}`}
            onClick={() => {
              setIsSearchInChatOpen((prev) => !prev);
              if (!isSearchInChatOpen) setSearchInChatQuery('');
            }}
            aria-label="Search within conversation"
            title="Search messages"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => startCall('audio', activeChat)}
            aria-label={`Voice call ${activeChat.name}`}
            title="Voice call"
          >
            <Phone size={18} />
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => startCall('video', activeChat)}
            aria-label={`Video call ${activeChat.name}`}
            title="Video call"
          >
            <Video size={18} />
          </button>

          <button
            type="button"
            className={`btn-icon ${isDetailsOpen ? 'active' : ''}`}
            onClick={toggleDetails}
            aria-label="Conversation details"
            title="Toggle Details Panel"
          >
            <Info size={18} />
          </button>

          {/* More Dropdown */}
          <div className="more-menu-wrapper" ref={moreMenuRef}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              aria-label="More conversation options"
              aria-expanded={isMoreMenuOpen}
            >
              <MoreVertical size={18} />
            </button>

            {isMoreMenuOpen && (
              <div className="popover-menu chat-more-popover" role="menu">
                <button
                  type="button"
                  className="popover-item"
                  onClick={() => {
                    togglePinConversation(activeChatId);
                    setIsMoreMenuOpen(false);
                  }}
                >
                  <Pin size={16} />
                  <span>{activeChat.isPinned ? 'Unpin Conversation' : 'Pin Conversation'}</span>
                </button>

                <button
                  type="button"
                  className="popover-item"
                  onClick={() => {
                    toggleMute(activeChatId);
                    setIsMoreMenuOpen(false);
                  }}
                >
                  {activeChat.isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>{activeChat.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="popover-item danger"
                  onClick={() => {
                    clearChat(activeChatId);
                    setIsMoreMenuOpen(false);
                  }}
                >
                  <Trash2 size={16} />
                  <span>Clear Chat History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. In-Chat Search Bar */}
      {isSearchInChatOpen && (
        <div className="in-chat-search-bar" role="search" aria-label="Message search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input-base in-chat-search-input"
            placeholder="Search in this conversation..."
            value={searchInChatQuery}
            onChange={(e) => setSearchInChatQuery(e.target.value)}
            autoFocus
          />
          {searchInChatQuery && (
            <span className="search-match-count">
              {searchMatches.length > 0
                ? `${searchMatchIndex + 1} of ${searchMatches.length}`
                : 'No matches'}
            </span>
          )}
          {searchMatches.length > 0 && (
            <>
              <button
                type="button"
                className="btn-icon btn-sm"
                onClick={handlePrevSearchMatch}
                aria-label="Previous match"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="btn-icon btn-sm"
                onClick={handleNextSearchMatch}
                aria-label="Next match"
              >
                <ChevronDown size={16} />
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-icon btn-sm"
            onClick={() => {
              setIsSearchInChatOpen(false);
              setSearchInChatQuery('');
            }}
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Pinned Message Banner */}
      {pinnedMessage && (
        <div className="pinned-message-banner" role="region" aria-label="Pinned message">
          <div className="pinned-banner-content" onClick={() => scrollToMessage(pinnedMessage.id)}>
            <Pin size={14} className="pinned-banner-icon" />
            <div className="pinned-banner-text">
              <span className="pinned-banner-sender">Pinned Message:</span>
              <span className="pinned-banner-snippet">{pinnedMessage.text || 'Attachment'}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon btn-sm"
            onClick={() => pinMessage(activeChatId, pinnedMessage.id)}
            aria-label="Unpin message"
            title="Unpin message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4. Messages Stream */}
      <div className="messages-viewport" role="log" aria-label="Message history">
        {activeMessages.length === 0 ? (
          <div className="chat-messages-empty">
            <div className="avatar avatar-xl" style={{ backgroundColor: activeChat.avatarBg || 'var(--primary-light)', color: '#FFFFFF' }}>
              {activeChat.initials || '💬'}
            </div>
            <h3>{activeChat.name}</h3>
            <p className="empty-subtext">This is the start of your encrypted conversation with {activeChat.name}.</p>
          </div>
        ) : (
          activeMessages.map((msg, index) => {
            const isMine = msg.senderId === user?.userId;
            const isHighlighted = msg.id === highlightedMsgId;
            const isEditing = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`message-row ${isMine ? 'mine' : 'theirs'} ${isHighlighted ? 'highlighted' : ''}`}
              >
                {/* Received message avatar in group chats */}
                {!isMine && activeChat.type === 'group' && (
                  <div className="avatar avatar-xs group-msg-avatar" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {msg.senderName?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                )}

                <div className="message-content-wrapper">
                  {/* Sender name for group chats */}
                  {!isMine && activeChat.type === 'group' && (
                    <span className="group-sender-name">{msg.senderName}</span>
                  )}

                  {/* Message Bubble */}
                  <div className={`message-bubble ${isMine ? 'bubble-sent' : 'bubble-received'}`}>
                    {/* Reply quote preview */}
                    {msg.replyTo && (
                      <div className="message-reply-quote" onClick={() => scrollToMessage(msg.replyTo.id)}>
                        <div className="reply-quote-bar" />
                        <div className="reply-quote-content">
                          <span className="reply-quote-author">{msg.replyTo.senderName}</span>
                          <span className="reply-quote-text">{msg.replyTo.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Inline Editing Mode */}
                    {isEditing ? (
                      <div className="inline-edit-box">
                        <textarea
                          className="inline-edit-input"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          autoFocus
                          rows={2}
                        />
                        <div className="inline-edit-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingMessageId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              editMessage(activeChatId, msg.id, editingText);
                              setEditingMessageId(null);
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="message-attachments">
                            {msg.attachments.map((att) =>
                              att.type === 'image' ? (
                                <div
                                  key={att.id}
                                  className="attachment-image-wrap"
                                  onClick={() => setLightboxImage(att.url)}
                                >
                                  <img src={att.url} alt={att.name || 'Attachment'} loading="lazy" />
                                  <div className="attachment-image-hover">
                                    <Maximize2 size={16} />
                                  </div>
                                </div>
                              ) : (
                                <div key={att.id} className="attachment-file-card">
                                  <div className="file-icon-badge">
                                    <FileText size={20} color="var(--primary)" />
                                  </div>
                                  <div className="file-card-info">
                                    <span className="file-card-name">{att.name}</span>
                                    <span className="file-card-size">{att.size || 'Document'}</span>
                                  </div>
                                  <a
                                    href={att.url || '#'}
                                    download={att.name}
                                    className="btn-icon btn-sm file-download-btn"
                                    aria-label={`Download ${att.name}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToast(`Downloading ${att.name}...`, { type: 'info' });
                                    }}
                                  >
                                    <Download size={14} />
                                  </a>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Voice Note Player */}
                        {msg.voiceNote && (
                          <div className="voice-message-player">
                            <button
                              type="button"
                              className="voice-play-btn"
                              onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                              aria-label={playingAudioId === msg.id ? 'Pause voice note' : 'Play voice note'}
                            >
                              {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <div className="voice-waveform-track">
                              <div className={`voice-waveform ${playingAudioId === msg.id ? 'playing' : ''}`}>
                                {[35, 60, 45, 80, 50, 90, 70, 40, 85, 65, 55, 75, 45, 60, 30].map((h, i) => (
                                  <span key={i} style={{ height: `${h}%` }} />
                                ))}
                              </div>
                            </div>
                            <span className="voice-duration">{msg.voiceNote.duration || '0:14'}</span>
                          </div>
                        )}

                        {/* Text Content */}
                        {msg.text && <div className="message-text">{msg.text}</div>}

                        {/* Message Meta Info */}
                        <div className="message-meta-row">
                          {msg.isEdited && <span className="edited-indicator">(edited)</span>}
                          <span className="message-timestamp">{formatTime(msg.timestamp)}</span>
                          {isMine && (
                            <span className="message-status-tick">
                              {msg.status === 'read' ? (
                                <CheckCheck size={14} color="#FFFFFF" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck size={14} style={{ opacity: 0.8 }} />
                              ) : (
                                <Check size={14} style={{ opacity: 0.7 }} />
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    {/* Reactions Bar on Bubble */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="bubble-reactions-bar">
                        {msg.reactions.map((r, i) => {
                          const hasReacted = r.users?.includes(user?.userId || 'user_alex_01');
                          return (
                            <button
                              key={i}
                              type="button"
                              className={`reaction-pill ${hasReacted ? 'active' : ''}`}
                              onClick={() => reactToMessage(activeChatId, msg.id, r.emoji)}
                              aria-label={`Reaction ${r.emoji} count ${r.count}`}
                            >
                              <span>{r.emoji}</span>
                              <span className="reaction-count">{r.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hover Action Bar */}
                  <div className="message-hover-actions">
                    <div className="quick-reactions">
                      {['👍', '❤️', '😂', '🔥', '🚀'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          className="quick-react-btn"
                          onClick={() => reactToMessage(activeChatId, msg.id, em)}
                          aria-label={`React with ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>

                    <div className="hover-action-divider" />

                    <button
                      type="button"
                      className="btn-icon btn-sm"
                      onClick={() => setReplyingTo(msg)}
                      aria-label="Reply to message"
                      title="Reply"
                    >
                      <Reply size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn-icon btn-sm"
                      onClick={() => handleCopyText(msg.text || '')}
                      aria-label="Copy message text"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn-icon btn-sm"
                      onClick={() => pinMessage(activeChatId, msg.id)}
                      aria-label={msg.isPinned ? 'Unpin message' : 'Pin message'}
                      title="Pin message"
                    >
                      <Pin size={14} />
                    </button>

                    {isMine && (
                      <button
                        type="button"
                        className="btn-icon btn-sm"
                        onClick={() => {
                          setEditingMessageId(msg.id);
                          setEditingText(msg.text || '');
                        }}
                        aria-label="Edit message"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn-icon btn-sm text-danger"
                      onClick={() => deleteMessage(activeChatId, msg.id)}
                      aria-label="Delete message"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {typingList.length > 0 && (
          <div className="typing-indicator-row animate-fadeIn">
            <div className="avatar avatar-xs" style={{ backgroundColor: activeChat.avatarBg || 'var(--primary-light)', color: '#FFFFFF' }}>
              {activeChat.initials || 'RS'}
            </div>
            <div className="typing-indicator-bubble">
              <span className="typing-text">{typingList[0]} is typing</span>
              <div className="typing-dots-anim">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Message Composer */}
      <footer className="message-composer-container">
        {/* Reply Preview Bar */}
        {replyingTo && (
          <div className="composer-reply-bar">
            <div className="reply-bar-accent" />
            <div className="reply-bar-text">
              <span className="reply-bar-sender">Replying to {replyingTo.senderName}</span>
              <span className="reply-bar-snippet">{replyingTo.text || 'Attachment'}</span>
            </div>
            <button
              type="button"
              className="btn-icon btn-sm"
              onClick={() => setReplyingTo(null)}
              aria-label="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Staged Attachments Preview */}
        {stagedAttachments.length > 0 && (
          <div className="staged-attachments-bar">
            {stagedAttachments.map((att, i) => (
              <div key={att.id || i} className="staged-file-card">
                {att.type === 'image' ? (
                  <img src={att.url} alt="Staged upload" className="staged-img-thumb" />
                ) : (
                  <FileIcon size={20} color="var(--primary)" />
                )}
                <div className="staged-file-info">
                  <span className="staged-file-name">{att.name}</span>
                  <span className="staged-file-size">{att.size}</span>
                </div>
                <button
                  type="button"
                  className="btn-icon btn-sm staged-remove-btn"
                  onClick={() => setStagedAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Composer Row */}
        <div className="composer-row">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />

          {/* Attachment Button */}
          <button
            type="button"
            className="btn-icon composer-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add attachment"
            title="Attach file or photo"
          >
            <Paperclip size={20} />
          </button>

          {/* Voice Recording Mode UI */}
          {isRecordingVoice ? (
            <div className="voice-recording-bar">
              <div className="recording-live-indicator">
                <span className="recording-pulse-dot" />
                <span className="recording-timer">
                  0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                </span>
              </div>

              <div className="recording-waveform-anim">
                {[40, 70, 90, 60, 80, 50, 95, 75, 45, 65, 85].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>

              <button
                type="button"
                className="btn-icon btn-sm text-danger"
                onClick={() => setIsRecordingVoice(false)}
                aria-label="Cancel recording"
                title="Cancel voice recording"
              >
                <Trash2 size={16} />
              </button>

              <button
                type="button"
                className="btn-icon-primary btn-sm voice-send-btn"
                onClick={handleSendVoiceNote}
                aria-label="Send voice message"
                title="Send voice note"
              >
                <Send size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* Text Area */}
              <textarea
                ref={textareaRef}
                className="composer-textarea"
                placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                aria-label="Type a message"
              />

              {/* Emoji Picker Popover */}
              <div className="emoji-picker-container" ref={emojiPickerRef}>
                <button
                  type="button"
                  className={`btn-icon composer-icon-btn ${isEmojiPickerOpen ? 'active' : ''}`}
                  onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                  aria-label="Insert emoji"
                  title="Emoji picker"
                >
                  <Smile size={20} />
                </button>

                {isEmojiPickerOpen && (
                  <div className="popover-menu emoji-grid-popover" role="dialog" aria-label="Emoji selector">
                    <div className="emoji-grid">
                      {EMOJI_LIST.map((em) => (
                        <button
                          key={em}
                          type="button"
                          className="emoji-choice-btn"
                          onClick={() => {
                            setMessageText((prev) => prev + em);
                            textareaRef.current?.focus();
                          }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Message Recorder Trigger */}
              <button
                type="button"
                className="btn-icon composer-icon-btn"
                onClick={() => setIsRecordingVoice(true)}
                aria-label="Record voice note"
                title="Record voice message"
              >
                <Mic size={20} />
              </button>

              {/* Send Button */}
              <button
                type="button"
                className="btn-icon-primary composer-send-btn"
                onClick={handleSendMessage}
                disabled={!messageText.trim() && stagedAttachments.length === 0}
                aria-label="Send message"
                title="Send (Enter)"
              >
                <Send size={18} />
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
