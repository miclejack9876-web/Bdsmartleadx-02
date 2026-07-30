import { UserProfile } from './auth';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  leadAlerts: boolean;
  language: string;
}

export interface UserSessionState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  isUpdatingProfile: boolean;
}
