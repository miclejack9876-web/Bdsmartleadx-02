import { useState, useCallback } from 'react';
import { UserProfile } from '../types/auth';
import { UserPreferences } from '../types/user';
import { UserService } from '../services/userService';

export function useUser(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    emailNotifications: true,
    leadAlerts: true,
    language: 'en',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const prefs = await UserService.getUserPreferences(userId);
      setPreferences(prefs);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    if (!userId) return false;
    const success = await UserService.saveUserPreferences(userId, newPrefs);
    if (success) {
      setPreferences((prev) => ({ ...prev, ...newPrefs }));
    }
    return success;
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return false;
    return await UserService.updateProfile(userId, updates);
  }, [userId]);

  return {
    preferences,
    loading,
    loadPreferences,
    updatePreferences,
    updateProfile,
  };
}
