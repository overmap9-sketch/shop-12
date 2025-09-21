import { useState, useEffect, createContext, useContext } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

import { http } from '../shared/api/http';
import { Storage, STORAGE_KEYS } from '../shared/lib/storage';

export function useAdminAuthState() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await http.get('/auth/me');
      if (res?.user) {
        setUser({ id: res.user.id, email: res.user.email, name: res.user.firstName + ' ' + res.user.lastName, role: res.user.role || 'moderator' });
        Storage.set(STORAGE_KEYS.USER, res.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await http.post('/auth/login', { email, password });
      if (res?.token && res?.user) {
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, res.token);
        Storage.set(STORAGE_KEYS.USER, res.user);
        setUser({ id: res.user.id, email: res.user.email, name: res.user.firstName + ' ' + res.user.lastName, role: res.user.role || 'moderator' });
      } else {
        throw new Error('Invalid response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    Storage.remove(STORAGE_KEYS.USER);
    setUser(null);
  };

  const checkAuth = (): boolean => {
    return !!user;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  };
}

// Simple hook for components that just need to check if user is admin
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const token = localStorage.getItem('admin-token');
        const userData = localStorage.getItem('admin-user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
    
    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  return isAdmin;
}
