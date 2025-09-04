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

export function useAdminAuthState() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('admin-token');
      const userData = localStorage.getItem('admin-user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation (in real app, this would be server-side)
      if (email === 'admin@example.com' && password === 'admin123') {
        const mockUser: AdminUser = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        };
        
        // Store token and user data
        localStorage.setItem('admin-token', 'mock-admin-token-' + Date.now());
        localStorage.setItem('admin-user', JSON.stringify(mockUser));
        
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    setUser(null);
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('admin-token');
    return !!token && !!user;
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
