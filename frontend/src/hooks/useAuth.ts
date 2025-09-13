import { useState, useEffect } from 'react';
import api from '../utils/api';
import { getToken, setToken, removeToken } from '../utils/auth';
import { User } from '../utils/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, login, logout, loading };
};
