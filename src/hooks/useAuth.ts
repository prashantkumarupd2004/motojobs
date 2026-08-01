'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  phone?: string;
  profileImage?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  // The session itself lives in an httpOnly cookie; `user` here is only a
  // display cache and must never be trusted for authorisation.
  const login = useCallback((userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'CANDIDATE') router.push('/candidate/dashboard');
    else if (userData.role === 'RECRUITER') router.push('/recruiter/dashboard');
    else if (userData.role === 'ADMIN') router.push('/admin/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { user, loading, login, logout, updateUser };
}
