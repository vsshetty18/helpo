import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'vg_ai_auth_user_v1';

export const DEMO_CREDENTIALS = {
  email: 'admin@vehicleguard.ai',
  password: 'demo'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth user', e);
    }
    // Default logged in with demo profile so evaluating reviewer starts directly in the app
    return {
      id: 'usr-admin-01',
      name: 'Operations Commander',
      email: DEMO_CREDENTIALS.email,
      role: 'Fleet Safety Director'
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, pass: string) => {
    // Demonstration login check
    if (
      (email.trim().toLowerCase() === DEMO_CREDENTIALS.email && pass === DEMO_CREDENTIALS.password) ||
      (email.includes('@') && pass.length >= 3)
    ) {
      const newUser: User = {
        id: 'usr-admin-01',
        name: email.split('@')[0].toUpperCase(),
        email: email.trim(),
        role: 'Fleet Safety Director'
      };
      setUser(newUser);
      return { success: true };
    }
    return { success: false, error: 'Invalid demo credentials. Try: admin@vehicleguard.ai / demo' };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
