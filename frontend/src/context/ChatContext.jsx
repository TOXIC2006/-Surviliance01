import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { playSentSound, playReceivedSound } from '../utils/sound';

const ChatContext = createContext(null);

const INITIAL_CONVERSATIONS = [
  {
    id: 'c1',
    type: 'direct',
    name: 'Rahul Sharma',
    handle: '@rahul_sharma',
    avatar: '',
    initials: 'RS',
    avatarBg: '#6366F1',
    status: 'online',
    lastSeen: 'Active now',
    role: 'Product Lead',
    bio: 'Building next-generation developer tooling and real-time collaboration apps @ Pulse.',
    email: 'rahul.sharma@pulsechat.io',
    phone: '+1 (555) 234-5678',
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    pinnedMessageId: 'm1_4',
    lastMessage: {
      text: 'Hey, are you coming to the sprint planning session?',
      timestamp: Date.now() - 2 * 60 * 1000,
      sender: 'Rahul Sharma',
      senderId: 'user_rahul',
      status: 'delivered',
    },
  },
  {
    id: 'c2',
    type: 'direct',
    name: 'Priya Singh',
    handle: '@priya_design',
    avatar: '',
    initials: 'PS',
    avatarBg: '#EC4899',
    status: 'online',
    lastSeen: 'Active now',
    role: 'Senior UI/UX Designer',
    bio: 'Crafting minimalist SaaS experiences. Passionate about typography, tokens, and WCAG AA.',
    email: 'priya.singh@pulsechat.io',
    phone: '+1 (555) 876-5432',
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    pinnedMessageId: null,
    lastMessage: {
      text: 'See you tomorrow! 🎨',
      timestamp: Date.now() - 12 * 60 * 1000,
      sender: 'Priya Singh',
      senderId: 'user_priya',
      status: 'read',
    },
  },
  {
    id: 'c3',
    type: 'direct',
    name: 'Aman Kumar',
    handle: '@aman_backend',
    avatar: '',
    initials: 'AK',
    avatarBg: '#10B981',
    status: 'offline',
    lastSeen: 'Last seen 1 hr ago',
    role: 'Staff Backend Engineer',
    bio: 'Distributed systems, WebSockets clustering, Redis streams, Kafka pipelines.',
    email: 'aman.kumar@pulsechat.io',
    phone: '+1 (555) 345-6789',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    pinnedMessageId: null,
    lastMessage: {
      text: 'Thanks 👍',
      timestamp: Date.now() - 60 * 60 * 1000,
      sender: 'Aman Kumar',
      senderId: 'user_aman',
      status: 'read',
    },
  },
  {
    id: 'c4',
    type: 'group',
    name: 'Tech Squad 🚀',
    handle: '@tech_squad',
    avatar: '',
    initials: 'TS',
    avatarBg: '#8B5CF6',
    status: 'online',
    lastSeen: '6 members • 4 online',
    role: 'Engineering Team',
    bio: 'Core development squad for the real-time SaaS platform & microservices architecture.',
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    pinnedMessageId: 'm4_1',
    members: [
      { id: 'user_alex_01', name: 'Alex Morgan (You)', role: 'Admin', status: 'online', initials: 'AM' },
      { id: 'user_rahul', name: 'Rahul Sharma', role: 'Product Lead', status: 'online', initials: 'RS' },
      { id: 'user_priya', name: 'Priya Singh', role: 'Lead Designer', status: 'online', initials: 'PS' },
      { id: 'user_aman', name: 'Aman Kumar', role: 'Member', status: 'offline', initials: 'AK' },
      { id: 'user_sarah', name: 'Sarah Chen', role: 'Architect', status: 'away', initials: 'SC' },
      { id: 'user_secbot', name: 'Security Bot', role: 'Integration', status: 'online', initials: 'SB' },
    ],
    lastMessage: {
      text: 'Sarah: We just deployed the new WebSocket clustering patch to staging.',
      timestamp: Date.now() - 25 * 60 * 1000,
      sender: 'Sarah Chen',
      senderId: 'user_sarah',
      status: 'read',
    },
  },
  {
    id: 'c5',
    type: 'group',
    name: 'Design Review 🎨',
    handle: '@design_review',
    avatar: '',
    initials: 'DR',
    avatarBg: '#F59E0B',
    status: 'online',
    lastSeen: '3 members • 2 online',
    role: 'Product Design',
    bio: 'Reviewing component design systems, accessibility guidelines, and interaction specs.',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    pinnedMessageId: null,
    members: [
      { id: 'user_alex_01', name: 'Alex Morgan (You)', role: 'Admin', status: 'online', initials: 'AM' },
      { id: 'user_priya', name: 'Priya Singh', role: 'Lead Designer', status: 'online', initials: 'PS' },
      { id: 'user_sarah', name: 'Sarah Chen', role: 'Member', status: 'away', initials: 'SC' },
    ],
    lastMessage: {
      text: 'Priya: Check out the new Indigo color palette contrast tokens!',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      sender: 'Priya Singh',
      senderId: 'user_priya',
      status: 'read',
    },
  },
  {
    id: 'c6',
    type: 'direct',
    name: 'Sarah Chen',
    handle: '@sarah_chen',
    avatar: '',
    initials: 'SC',
    avatarBg: '#06B6D4',
    status: 'away',
    lastSeen: 'Active 25m ago',
    role: 'Frontend Architect',
    bio: 'React 19, WebRTC, high-performance rendering & state synchronisation.',
    email: 'sarah.chen@pulsechat.io',
    phone: '+1 (555) 901-2345',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    pinnedMessageId: null,
    lastMessage: {
      text: 'The client approved the proposal! 🎉',
      timestamp: Date.now() - 4 * 60 * 60 * 1000,
      sender: 'Sarah Chen',
      senderId: 'user_sarah',
      status: 'read',
    },
  },
  {
    id: 'c7',
    type: 'bot',
    name: 'Surveillance Hub 🛡️',
    handle: '@security_hub',
    avatar: '',
    initials: 'SH',
    avatarBg: '#475569',
    status: 'online',
    lastSeen: 'Automated Bot System',
    role: 'Device Monitor',
    bio: 'Real-time IoT surveillance feed, doorbell alert notifications, and QR scan events.',
    email: 'alerts@pulsechat.io',
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    pinnedMessageId: null,
    lastMessage: {
      text: 'Front Door Camera detected motion at 07:15 AM.',
      timestamp: Date.now() - 8 * 60 * 60 * 1000,
      sender: 'Surveillance Hub',
      senderId: 'bot_surveillance',
      status: 'read',
    },
  },
];

const INITIAL_MESSAGES = {
  c1: [
    {
      id: 'm1_1',
      chatId: 'c1',
      senderId: 'user_rahul',
      senderName: 'Rahul Sharma',
      text: 'Hey Alex! Do you have a moment to review the revised WebSocket connection protocol?',
      timestamp: Date.now() - 35 * 60 * 1000,
      status: 'read',
      reactions: [{ emoji: '👍', count: 1, users: ['user_alex_01'] }],
    },
    {
      id: 'm1_2',
      chatId: 'c1',
      senderId: 'user_alex_01',
      senderName: 'Alex Morgan',
      text: "Hey Rahul! Yes, I just looked through the STOMP heartbeat configuration. Everything looks rock solid for high concurrency. 🚀",
      timestamp: Date.now() - 25 * 60 * 1000,
      status: 'read',
      replyTo: {
        id: 'm1_1',
        senderName: 'Rahul Sharma',
        text: 'Hey Alex! Do you have a moment to review the revised WebSocket connection protocol?',
      },
    },
    {
      id: 'm1_3',
      chatId: 'c1',
      senderId: 'user_rahul',
      senderName: 'Rahul Sharma',
      text: 'Awesome! We are scheduling the final demo with leadership this Thursday.',
      timestamp: Date.now() - 15 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm1_4',
      chatId: 'c1',
      senderId: 'user_rahul',
      senderName: 'Rahul Sharma',
      text: 'Hey, are you coming?',
      timestamp: Date.now() - 2 * 60 * 1000,
      status: 'delivered',
      isPinned: true,
      reactions: [{ emoji: '🔥', count: 2, users: ['user_rahul', 'user_alex_01'] }],
    },
  ],
  c2: [
    {
      id: 'm2_1',
      chatId: 'c2',
      senderId: 'user_priya',
      senderName: 'Priya Singh',
      text: 'Hi Alex! I just finished the design tokens for the Indigo + Slate theme. Take a look at the component spec.',
      timestamp: Date.now() - 90 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm2_2',
      chatId: 'c2',
      senderId: 'user_priya',
      senderName: 'Priya Singh',
      text: 'Here is the exported design tokens schema and the UI preview screenshot.',
      timestamp: Date.now() - 85 * 60 * 1000,
      status: 'read',
      attachments: [
        {
          id: 'att_2_1',
          type: 'image',
          name: 'indigo-slate-design-system.png',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80',
          size: '1.4 MB',
        },
        {
          id: 'att_2_2',
          type: 'file',
          name: 'tokens-v2.json',
          size: '34 KB',
          ext: 'json',
        },
      ],
    },
    {
      id: 'm2_3',
      chatId: 'c2',
      senderId: 'user_alex_01',
      senderName: 'Alex Morgan',
      text: 'These look gorgeous! The contrast ratios and 18px rounded bubbles feel very refined and fast.',
      timestamp: Date.now() - 40 * 60 * 1000,
      status: 'read',
      reactions: [{ emoji: '❤️', count: 1, users: ['user_priya'] }],
    },
    {
      id: 'm2_4',
      chatId: 'c2',
      senderId: 'user_priya',
      senderName: 'Priya Singh',
      text: 'See you tomorrow! 🎨',
      timestamp: Date.now() - 12 * 60 * 1000,
      status: 'read',
    },
  ],
  c3: [
    {
      id: 'm3_1',
      chatId: 'c3',
      senderId: 'user_aman',
      senderName: 'Aman Kumar',
      text: 'Alex, I pushed the Redis pub/sub adapter to staging. Could you run the WebSocket benchmark test?',
      timestamp: Date.now() - 120 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm3_2',
      chatId: 'c3',
      senderId: 'user_alex_01',
      senderName: 'Alex Morgan',
      text: 'Running it now! Latency is staying under 14ms across 10,000 simulated connections.',
      timestamp: Date.now() - 90 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm3_3',
      chatId: 'c3',
      senderId: 'user_aman',
      senderName: 'Aman Kumar',
      text: 'Thanks 👍',
      timestamp: Date.now() - 60 * 60 * 1000,
      status: 'read',
      reactions: [{ emoji: '🚀', count: 1, users: ['user_alex_01'] }],
    },
  ],
  c4: [
    {
      id: 'm4_1',
      chatId: 'c4',
      senderId: 'user_rahul',
      senderName: 'Rahul Sharma',
      text: '📌 Sprint Demo is this Thursday at 4 PM EST. Please ensure your PRs are merged and tested before noon.',
      timestamp: Date.now() - 180 * 60 * 1000,
      status: 'read',
      isPinned: true,
      reactions: [{ emoji: '👍', count: 4, users: ['user_rahul', 'user_priya', 'user_aman', 'user_alex_01'] }],
    },
    {
      id: 'm4_2',
      chatId: 'c4',
      senderId: 'user_priya',
      senderName: 'Priya Singh',
      text: 'The complete dark mode token palette and responsive layouts are ready for review: https://github.com/org/pulsechat',
      timestamp: Date.now() - 140 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm4_3',
      chatId: 'c4',
      senderId: 'user_alex_01',
      senderName: 'Alex Morgan',
      text: 'I just finished integrating the audio voice notes and WebRTC call modal components. Looking super sharp!',
      timestamp: Date.now() - 80 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm4_4',
      chatId: 'c4',
      senderId: 'user_sarah',
      senderName: 'Sarah Chen',
      text: 'We just deployed the new WebSocket clustering patch to staging. Zero packet drops so far.',
      timestamp: Date.now() - 25 * 60 * 1000,
      status: 'read',
      reactions: [{ emoji: '🎉', count: 3, users: ['user_rahul', 'user_aman', 'user_alex_01'] }],
    },
  ],
  c5: [
    {
      id: 'm5_1',
      chatId: 'c5',
      senderId: 'user_priya',
      senderName: 'Priya Singh',
      text: 'Priya: Check out the new Indigo color palette contrast tokens!',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      status: 'read',
      attachments: [
        {
          id: 'att_5_1',
          type: 'image',
          name: 'color-palette-tokens.png',
          url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&auto=format&fit=crop&q=80',
          size: '2.1 MB',
        },
      ],
    },
  ],
  c6: [
    {
      id: 'm6_1',
      chatId: 'c6',
      senderId: 'user_sarah',
      senderName: 'Sarah Chen',
      text: 'The client approved the proposal! 🎉 We are launching the pilot next week.',
      timestamp: Date.now() - 4 * 60 * 60 * 1000,
      status: 'read',
      reactions: [{ emoji: '🔥', count: 2, users: ['user_sarah', 'user_alex_01'] }],
    },
  ],
  c7: [
    {
      id: 'm7_1',
      chatId: 'c7',
      senderId: 'bot_surveillance',
      senderName: 'Surveillance Hub',
      text: '🛡️ Surveillance System Online. All 3 devices (Front Door Camera, Living Room Hub, Garage Sensor) connected via WebSockets.',
      timestamp: Date.now() - 10 * 60 * 60 * 1000,
      status: 'read',
    },
    {
      id: 'm7_2',
      chatId: 'c7',
      senderId: 'bot_surveillance',
      senderName: 'Surveillance Hub',
      text: 'Front Door Camera detected motion at 07:15 AM. Snapshot captured.',
      timestamp: Date.now() - 8 * 60 * 60 * 1000,
      status: 'read',
      attachments: [
        {
          id: 'att_7_1',
          type: 'image',
          name: 'front_door_motion.jpg',
          url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=900&auto=format&fit=crop&q=80',
          size: '980 KB',
        },
      ],
    },
  ],
};

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('pulsechat_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('pulsechat_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_MESSAGES;
  });

  const [activeChatId, setActiveChatId] = useState('c1');
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [deletedBuffer, setDeletedBuffer] = useState(null);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');
  const [isSearchInChatOpen, setIsSearchInChatOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pulsechat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('pulsechat_messages', JSON.stringify(messages));
  }, [messages]);

  // Toast helper
  const addToast = useCallback((message, options = {}) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newToast = {
      id,
      message,
      type: options.type || 'info', // 'info' | 'success' | 'warning' | 'error'
      actionText: options.actionText,
      onAction: options.onAction,
      duration: options.duration || 4000,
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Active conversation object
  const activeChat = conversations.find((c) => c.id === activeChatId) || null;
  const activeMessages = (activeChatId && messages[activeChatId]) || [];

  // Mark conversation as read when selected
  const markAsRead = useCallback((chatId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  }, []);

  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId);
    markAsRead(chatId);
    setSearchInChatQuery('');
    setIsSearchInChatOpen(false);
  }, [markAsRead]);

  // Send message
  const sendMessage = useCallback((chatId, { text, attachments = [], replyTo = null, voiceNote = null }) => {
    if (!text?.trim() && (!attachments || attachments.length === 0) && !voiceNote) return;

    const newMsgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newMsg = {
      id: newMsgId,
      chatId,
      senderId: user?.userId || 'user_alex_01',
      senderName: user?.name || user?.username || 'Alex Morgan',
      text: text?.trim() || '',
      attachments: attachments || [],
      voiceNote: voiceNote || null,
      replyTo: replyTo || null,
      timestamp: Date.now(),
      status: 'sent',
      reactions: [],
    };

    if (soundEnabled) {
      playSentSound();
    }

    // Append to messages
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Update conversation snippet
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: {
              text: voiceNote ? '🎤 Voice message' : attachments.length > 0 ? (attachments[0].type === 'image' ? '📷 Photo' : '📎 Attachment') : newMsg.text,
              timestamp: newMsg.timestamp,
              sender: newMsg.senderName,
              senderId: newMsg.senderId,
              status: 'sent',
            },
          };
        }
        return c;
      })
    );

    // Transition sent -> delivered
    setTimeout(() => {
      setMessages((prev) => {
        const chatMsgs = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMsgs.map((m) => (m.id === newMsgId ? { ...m, status: 'delivered' } : m)),
        };
      });
    }, 600);

    // Simulate smart reply if 1-to-1 or group chat
    triggerSimulationReply(chatId, newMsg.text);
  }, [user, soundEnabled]);

  // Simulation Bot / Person Auto-reply
  const triggerSimulationReply = (chatId, userText) => {
    const conv = conversations.find((c) => c.id === chatId);
    if (!conv) return;

    // Simulate typing delay
    setTimeout(() => {
      const responderName = conv.type === 'group' ? (conv.members?.find((m) => m.id !== 'user_alex_01')?.name || 'Rahul Sharma') : conv.name;
      const responderId = conv.type === 'group' ? 'user_rahul' : (conv.id === 'c1' ? 'user_rahul' : conv.id === 'c2' ? 'user_priya' : conv.id === 'c3' ? 'user_aman' : conv.id === 'c6' ? 'user_sarah' : 'bot_surveillance');

      setTypingUsers((prev) => ({
        ...prev,
        [chatId]: [responderName],
      }));

      setTimeout(() => {
        // Clear typing
        setTypingUsers((prev) => {
          const copy = { ...prev };
          delete copy[chatId];
          return copy;
        });

        // Generate response text
        let replyText = 'Thanks for the update! Looking into this right now.';
        const lower = (userText || '').toLowerCase();
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          replyText = `Hey ${user?.name?.split(' ')[0] || 'Alex'}! Hope your day is going great. Let me know if you need any help.`;
        } else if (lower.includes('coming') || lower.includes('meeting') || lower.includes('planning')) {
          replyText = 'Yes, I will be joining in 5 minutes! Pulling up the roadmap slides.';
        } else if (lower.includes('design') || lower.includes('token') || lower.includes('ui') || lower.includes('color')) {
          replyText = 'The Indigo + Slate tokens look very clean with 6366F1 accents and 18px radii. WCAG AA contrast is spot on!';
        } else if (lower.includes('bug') || lower.includes('pr') || lower.includes('code') || lower.includes('test')) {
          replyText = 'Checking the PR right now! All CI unit tests and lint checks are passing cleanly. 👍';
        } else if (lower.includes('call') || lower.includes('voice') || lower.includes('video')) {
          replyText = 'I am available for a quick voice or video sync whenever you are ready!';
        } else if (conv.id === 'c7') {
          replyText = `[Automated Log] Motion check passed. All 3 surveillance zones are secure at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        } else {
          const sampleReplies = [
            'Sounds great! I will update the project board accordingly.',
            'Understood. Let me know if anything changes!',
            'Got it. I have synced the latest commit.',
            'Perfect! Looking forward to reviewing the final output.',
          ];
          replyText = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
        }

        const replyMsgId = 'msg_reply_' + Date.now();
        const replyMsg = {
          id: replyMsgId,
          chatId,
          senderId: responderId,
          senderName: responderName,
          text: replyText,
          timestamp: Date.now(),
          status: 'read',
          reactions: [],
        };

        if (soundEnabled) {
          playReceivedSound();
        }

        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), replyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === chatId) {
              const isCurrent = activeChatId === chatId;
              return {
                ...c,
                unreadCount: isCurrent ? 0 : (c.unreadCount || 0) + 1,
                lastMessage: {
                  text: replyText,
                  timestamp: replyMsg.timestamp,
                  sender: responderName,
                  senderId: responderId,
                  status: 'read',
                },
              };
            }
            return c;
          })
        );
      }, 2200);
    }, 1000);
  };

  // React to message
  const reactToMessage = useCallback((chatId, messageId, emoji) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      const updated = chatMsgs.map((m) => {
        if (m.id !== messageId) return m;

        const reactions = [...(m.reactions || [])];
        const existing = reactions.find((r) => r.emoji === emoji);
        const myUserId = user?.userId || 'user_alex_01';

        if (existing) {
          const hasReacted = existing.users.includes(myUserId);
          if (hasReacted) {
            // Remove reaction
            const newUsers = existing.users.filter((u) => u !== myUserId);
            if (newUsers.length === 0) {
              return {
                ...m,
                reactions: reactions.filter((r) => r.emoji !== emoji),
              };
            }
            return {
              ...m,
              reactions: reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
              ),
            };
          } else {
            // Add reaction
            const newUsers = [...existing.users, myUserId];
            return {
              ...m,
              reactions: reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
              ),
            };
          }
        } else {
          // Add new emoji reaction
          return {
            ...m,
            reactions: [...reactions, { emoji, count: 1, users: [myUserId] }],
          };
        }
      });

      return {
        ...prev,
        [chatId]: updated,
      };
    });
  }, [user]);

  // Edit message
  const editMessage = useCallback((chatId, messageId, newText) => {
    if (!newText?.trim()) return;

    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) =>
          m.id === messageId ? { ...m, text: newText.trim(), isEdited: true, editedAt: Date.now() } : m
        ),
      };
    });

    addToast('Message updated', { type: 'success' });
  }, [addToast]);

  // Delete message with Undo buffer
  const deleteMessage = useCallback((chatId, messageId) => {
    const chatMsgs = messages[chatId] || [];
    const targetMsg = chatMsgs.find((m) => m.id === messageId);
    if (!targetMsg) return;

    // Save for undo
    setDeletedBuffer({ chatId, message: targetMsg, index: chatMsgs.indexOf(targetMsg) });

    setMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter((m) => m.id !== messageId),
    }));

    addToast('Message deleted', {
      type: 'info',
      actionText: 'Undo',
      duration: 5000,
      onAction: () => {
        undoDeleteMessage();
      },
    });
  }, [messages, addToast]);

  const undoDeleteMessage = useCallback(() => {
    if (!deletedBuffer) return;
    const { chatId, message, index } = deletedBuffer;

    setMessages((prev) => {
      const chatMsgs = [...(prev[chatId] || [])];
      chatMsgs.splice(index, 0, message);
      return {
        ...prev,
        [chatId]: chatMsgs,
      };
    });

    setDeletedBuffer(null);
    addToast('Message restored', { type: 'success' });
  }, [deletedBuffer, addToast]);

  // Pin message
  const pinMessage = useCallback((chatId, messageId) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        ),
      };
    });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const isCurrentlyPinned = c.pinnedMessageId === messageId;
          return {
            ...c,
            pinnedMessageId: isCurrentlyPinned ? null : messageId,
          };
        }
        return c;
      })
    );

    addToast('Pinned message updated', { type: 'info' });
  }, [addToast]);

  // Clear chat
  const clearChat = useCallback((chatId) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [],
    }));

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: {
              text: 'Conversation cleared',
              timestamp: Date.now(),
              sender: 'System',
              senderId: 'sys',
              status: 'read',
            },
            unreadCount: 0,
            pinnedMessageId: null,
          };
        }
        return c;
      })
    );

    addToast('Chat history cleared', { type: 'info' });
  }, [addToast]);

  // Toggle mute
  const toggleMute = useCallback((chatId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const nextMuted = !c.isMuted;
          addToast(nextMuted ? 'Notifications muted' : 'Notifications unmuted', { type: 'info' });
          return { ...c, isMuted: nextMuted };
        }
        return c;
      })
    );
  }, [addToast]);

  // Toggle pin conversation
  const togglePinConversation = useCallback((chatId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const nextPinned = !c.isPinned;
          addToast(nextPinned ? 'Conversation pinned' : 'Conversation unpinned', { type: 'info' });
          return { ...c, isPinned: nextPinned };
        }
        return c;
      })
    );
  }, [addToast]);

  // Create new chat / group
  const createNewChat = useCallback(({ name, type = 'direct', members = [], avatar = '', initials = '', bio = '' }) => {
    const newChatId = 'c_' + Date.now();
    const initialsFormatted = initials || name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    const newConv = {
      id: newChatId,
      type,
      name,
      handle: `@${name.toLowerCase().replace(/\s+/g, '_')}`,
      avatar,
      initials: initialsFormatted,
      avatarBg: '#6366F1',
      status: 'online',
      lastSeen: type === 'group' ? `${members.length + 1} members` : 'Active now',
      role: type === 'group' ? 'Custom Group' : 'Contact',
      bio: bio || (type === 'group' ? 'New group collaboration channel.' : 'PulseChat user.'),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      pinnedMessageId: null,
      members: type === 'group' ? [
        { id: user?.userId || 'user_alex_01', name: `${user?.name || 'Alex Morgan'} (You)`, role: 'Admin', status: 'online', initials: 'AM' },
        ...members.map((m) => ({ id: m.id || `m_${Math.random()}`, name: m.name, role: 'Member', status: 'online', initials: m.initials || 'U' })),
      ] : undefined,
      lastMessage: {
        text: 'Started a new conversation',
        timestamp: Date.now(),
        sender: user?.name || 'You',
        senderId: user?.userId || 'user_alex_01',
        status: 'read',
      },
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newChatId]: [
        {
          id: 'msg_init_' + Date.now(),
          chatId: newChatId,
          senderId: user?.userId || 'user_alex_01',
          senderName: user?.name || 'Alex Morgan',
          text: `👋 Started conversation in ${name}.`,
          timestamp: Date.now(),
          status: 'read',
        },
      ],
    }));

    setActiveChatId(newChatId);
    addToast(`Conversation created: ${name}`, { type: 'success' });
    return newChatId;
  }, [user, addToast]);

  // Call actions
  const startCall = useCallback((type, contact) => {
    setActiveCall({
      type, // 'audio' | 'video'
      contact: contact || activeChat,
      status: 'ringing', // 'ringing' | 'connected' | 'ended'
      duration: 0,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
    });
  }, [activeChat]);

  const endCall = useCallback(() => {
    setActiveCall(null);
    addToast('Call ended', { type: 'info' });
  }, [addToast]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        setConversations,
        messages,
        activeChatId,
        activeChat,
        activeMessages,
        isDetailsOpen,
        setIsDetailsOpen,
        toggleDetails: () => setIsDetailsOpen((prev) => !prev),
        selectChat,
        markAsRead,
        sendMessage,
        reactToMessage,
        editMessage,
        deleteMessage,
        undoDeleteMessage,
        pinMessage,
        clearChat,
        toggleMute,
        togglePinConversation,
        createNewChat,
        typingUsers,
        soundEnabled,
        setSoundEnabled,
        toggleSound: () => setSoundEnabled((prev) => !prev),
        toasts,
        addToast,
        removeToast,
        activeCall,
        setActiveCall,
        startCall,
        endCall,
        lightboxImage,
        setLightboxImage,
        searchInChatQuery,
        setSearchInChatQuery,
        isSearchInChatOpen,
        setIsSearchInChatOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
