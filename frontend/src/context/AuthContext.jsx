import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  userId: 'user_alex_01',
  username: 'alex_morgan',
  name: 'Alex Morgan',
  role: 'ADMIN',
  email: 'alex.morgan@pulsechat.io',
  avatar: '',
  initials: 'AM',
  statusMessage: 'Building the future of real-time communication ⚡',
  presence: 'online', // 'online' | 'busy' | 'away' | 'offline'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pulsechat_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // fallback
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('pulsechat_token') || 'demo-jwt-token-123');
  const [presence, setPresence] = useState('online');

  useEffect(() => {
    if (user) {
      localStorage.setItem('pulsechat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pulsechat_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('pulsechat_token', token);
    } else {
      localStorage.removeItem('pulsechat_token');
    }
  }, [token]);

  function loginUser(authData) {
    const { token: jwt, username, userId, role, name, email } = authData;
    const userData = {
      userId: userId || `user_${Date.now()}`,
      username: username || 'user',
      name: name || username || 'User',
      role: role || 'USER',
      email: email || `${username}@pulsechat.io`,
      initials: (name || username || 'U').slice(0, 2).toUpperCase(),
      statusMessage: 'Available',
      presence: 'online',
    };
    setToken(jwt || 'token_' + Date.now());
    setUser(userData);
  }

  function logoutUser() {
    setUser(DEFAULT_DEMO_USER);
  }

  function updateUserProfile(updates) {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  }

  function setUserPresence(newPresence) {
    setPresence(newPresence);
    setUser((prev) => ({
      ...prev,
      presence: newPresence,
    }));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true,
        presence,
        setUserPresence,
        updateUserProfile,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
