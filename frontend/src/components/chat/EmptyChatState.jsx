import { MessageSquare, Plus, Users, Shield } from 'lucide-react';
import './EmptyChatState.css';

export default function EmptyChatState({ onOpenNewChat }) {
  return (
    <div className="empty-chat-view" role="main" aria-label="No conversation selected">
      <div className="empty-chat-card">
        <div className="empty-chat-icon-wrap">
          <MessageSquare size={36} color="var(--primary)" />
        </div>

        <h2 className="empty-chat-title">Your messages</h2>
        <p className="empty-chat-desc">
          Select a conversation from the sidebar to start chatting, or create a new direct message or group channel.
        </p>

        <div className="empty-chat-actions">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onOpenNewChat}
            aria-label="Create new conversation"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="empty-chat-hints">
          <div className="hint-item">
            <span className="hint-kbd">Ctrl</span> + <span className="hint-kbd">N</span>
            <span className="hint-text">New conversation</span>
          </div>
          <div className="hint-item">
            <span className="hint-kbd">Enter</span>
            <span className="hint-text">Send message</span>
          </div>
        </div>
      </div>
    </div>
  );
}
