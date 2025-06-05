import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('app_user');
    console.log('User logged out, navigating to /login');
    navigate('/login');
    setLoading(false);
  }, [navigate]);

  const login = async (username, password) => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return { success: false, message: 'Supabase client not initialized.' };
    }

    try {
      const { data, error } = await supabase
        .from('users_app')
        .select('id, username, password_hash, role')
        .eq('username', username)
        .single();

      if (error || !data) {
        setLoading(false);
        return { success: false, message: 'Username atau password salah.' };
      }
      
      // PERHATIAN: Perbandingan password teks biasa. SANGAT TIDAK AMAN UNTUK PRODUKSI.
      // Ini hanya untuk demonstrasi karena batasan lingkungan.
      // Dalam aplikasi nyata, gunakan Supabase Auth atau hashing yang aman di backend.
      if (data.password_hash === password) {
        const userData = {
          id: data.id,
          username: data.username,
          role: data.role,
        };
        setUser(userData);
        localStorage.setItem('app_user', JSON.stringify(userData));
        setLoading(false);
        return { success: true, user: userData };
      } else {
        setLoading(false);
        return { success: false, message: 'Username atau password salah.' };
      }
    } catch (e) {
      console.error('Login error:', e);
      setLoading(false);
      return { success: false, message: 'Terjadi kesalahan saat login.' };
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('app_user');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;