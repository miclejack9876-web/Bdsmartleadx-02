import { getSupabaseClient } from '../supabaseClient';
import { UserProfile } from './auth';
import { UserPreferences } from './user';

export class UserService {
  private static client = getSupabaseClient();

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.department !== undefined) payload.department = updates.department;

    const { error } = await UserService.client
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) {
      console.error('[BdSmartLeadX-02] Update user profile error:', error.message);
      return false;
    }

    return true;
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data } = await UserService.client
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return {
        theme: 'system',
        emailNotifications: true,
        leadAlerts: true,
        language: 'en',
      };
    }

    return {
      theme: data.theme || 'system',
      emailNotifications: data.email_notifications ?? true,
      leadAlerts: data.lead_alerts ?? true,
      language: data.language || 'en',
    };
  }

  static async saveUserPreferences(userId: string, prefs: Partial<UserPreferences>): Promise<boolean> {
    const { error } = await UserService.client.from('user_preferences').upsert({
      user_id: userId,
      theme: prefs.theme,
      email_notifications: prefs.emailNotifications,
      lead_alerts: prefs.leadAlerts,
      language: prefs.language,
    });

    if (error) {
      console.error('[BdSmartLeadX-02] Save user preferences error:', error.message);
      return false;
    }

    return true;
  }
      }
