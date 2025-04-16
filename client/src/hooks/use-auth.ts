import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  tenantId: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: false,
  error: null
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch current user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        return await res.json();
      } catch (error) {
        // If 401, user is not logged in, which is normal
        if (error instanceof Response && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string, password: string }) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      if (!res.ok) {
        throw new Error('Giriş başarısız oldu');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Refresh user data after login
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      navigate('/dashboard');
      toast({
        title: "Giriş Başarılı",
        description: "Adisyon sistemine hoş geldiniz.",
      });
    },
    onError: (error) => {
      toast({
        title: "Giriş Hatası",
        description: error instanceof Error ? error.message : 'Giriş başarısız oldu',
        variant: "destructive",
      });
      setError(error instanceof Error ? error.message : 'Giriş işlemi başarısız oldu');
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout');
      if (!res.ok) {
        throw new Error('Çıkış başarısız oldu');
      }
    },
    onSuccess: () => {
      // Refresh user data after logout
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      navigate('/');
      toast({
        title: "Çıkış Yapıldı",
        description: "Adisyon sisteminden çıkış yapıldı.",
      });
    },
    onError: (error) => {
      toast({
        title: "Çıkış Hatası",
        description: error instanceof Error ? error.message : 'Çıkış başarısız oldu',
        variant: "destructive",
      });
    }
  });

  const login = async (username: string, password: string) => {
    loginMutation.mutate({ username, password });
  };

  const logout = async () => {
    logoutMutation.mutate();
  };

  // Using a different syntax to avoid JSX parsing in TS file
  return React.createElement(AuthContext.Provider, 
    { 
      value: { 
        isAuthenticated: !!user, 
        user: user || null, 
        login, 
        logout, 
        isLoading, 
        error 
      } 
    }, 
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Default export for direct import
export default function useAuthentication() {
  return useContext(AuthContext);
}
