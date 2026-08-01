'use client';
import { useState, useEffect, useCallback } from 'react';

interface ProfileData {
  id?: string;
  headline?: string;
  summary?: string;
  location?: string;
  experience?: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isOpenToWork?: boolean;
  profileScore?: number;
  user?: { name: string; email: string; phone?: string; profileImage?: string };
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/candidate/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data || {});
      } else {
        setError('Failed to load profile');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    const res = await fetch('/api/candidate/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    setProfile(data.data);
    return data.data;
  }, []);

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
}
