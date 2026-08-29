import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import TopHeader from '../components/chat/TopHeader';
import Sidebar from '../components/chat/Sidebar';
import ActiveChat from '../components/chat/ActiveChat';
import EmptyChatState from '../components/chat/EmptyChatState';
import DetailsPanel from '../components/chat/DetailsPanel';
import ToastContainer from '../components/ui/ToastContainer';
import NewChatModal from '../components/modals/NewChatModal';
import CallModal from '../components/modals/CallModal';
import ImageLightboxModal from '../components/modals/ImageLightboxModal';
import SettingsModal from '../components/modals/SettingsModal';
import './ChatAppMain.css';

export default function ChatAppMain() {
  const {
    activeChatId,
    selectChat,
    isDetailsOpen,
    setIsDetailsOpen,
    activeCall,
    lightboxImage,
  } = useChat();

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('general');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDetailsOpen, setIsDetailsOpen]);

  // Keyboard shortcut listener (Ctrl+N, Cmd+N)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewChatModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSettings = (tab = 'general') => {
    setSettingsInitialTab(tab);
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="chat-app-root">
      {/* 1. Global SaaS Top Header */}
      <TopHeader
        onOpenSettings={handleOpenSettings}
        onOpenNewChat={() => setIsNewChatModalOpen(true)}
      />

      {/* 2. Main Three-Section Layout */}
      <main className="chat-app-layout" role="main">
        {/* On mobile: show Sidebar only if no activeChat, or if user navigated back */}
        {(!isMobile || !activeChatId) && (
          <Sidebar onOpenNewChat={() => setIsNewChatModalOpen(true)} />
        )}

        {/* Center Section: Active Chat or Empty State */}
        {(!isMobile || !!activeChatId) && (
          <div className="chat-main-section">
            {activeChatId ? (
              <ActiveChat
                onBack={() => selectChat(null)}
                onOpenDetails={() => setIsDetailsOpen(true)}
              />
            ) : (
              <EmptyChatState onOpenNewChat={() => setIsNewChatModalOpen(true)} />
            )}
          </div>
        )}

        {/* Right Section: Details Panel (Collapsible) */}
        {activeChatId && isDetailsOpen && (
          <DetailsPanel onClose={() => setIsDetailsOpen(false)} />
        )}
      </main>

      {/* 3. Global Modals & Overlays */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {activeCall && <CallModal />}
      {lightboxImage && <ImageLightboxModal />}

      {/* 4. Global Toast System */}
      <ToastContainer />
    </div>
  );
}
