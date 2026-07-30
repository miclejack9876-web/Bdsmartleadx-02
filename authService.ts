import { getSupabaseClient } from './client';
import { SignInCredentials, SignUpCredentials, UserProfile, AuthResponse } from './auth';

export class AuthService {
  private static client = getSupabaseClient();

  static async signIn({ email, password }: SignInCredentials): Promise<AuthResponse> {
    if (!password) {
      throw new Error('Password is required for sign in.');
    }

    const { data, error } = await AuthService.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  }

  static async signUp({ email, password, fullName }: SignUpCredentials): Promise<AuthResponse> {
    if (!password) {
      throw new Error('Password is required for sign up.');
    }

    const { data, error } = await AuthService.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    if (data.user) {
      // Upsert profile record explicitly with pending status
      const { error: profileError } = await AuthService.client
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName || null,
          role: 'user',
          approval_status: 'pending',
          is_approved: false,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn('[BdSmartLeadX-02] Profile upsert warning on signup:', profileError.message);
      }
    }

    return { user: data.user, session: data.session, error: null };
  }

  static async signOut(): Promise<{ error: Error | null }> {
    const { error } = await AuthService.client.auth.signOut();
    return { error };
  }

  static async getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await AuthService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Attempt to fetch user auth metadata to fallback create profile
      const { data: userData } = await AuthService.client.auth.getUser();
      if (userData?.user && userData.user.id === userId) {
        const fallbackEmail = userData.user.email || '';
        const fallbackName = userData.user.user_metadata?.full_name || null;
        
        const { data: newProfile, error: createError } = await AuthService.client
          .from('profiles')
          .insert({
            id: userId,
            email: fallbackEmail,
            full_name: fallbackName,
            role: 'user',
            approval_status: 'pending',
            is_approved: false,
            is_active: true,
          })
          .select()
          .single();

        if (!createError && newProfile) {
          return {
            id: newProfile.id,
            email: newProfile.email,
            fullName: newProfile.full_name || null,
            avatarUrl: newProfile.avatar_url || null,
            role: newProfile.role || 'user',
            department: newProfile.department || null,
            isActive: newProfile.is_active ?? true,
            approvalStatus: (newProfile.approval_status as any) || 'pending',
            isApproved: newProfile.is_approved ?? false,
            createdAt: newProfile.created_at,
            updatedAt: newProfile.updated_at,
          };
        }
      }
      return null;
    }

    const approvalStatus = (data.approval_status as any) || (data.is_approved ? 'approved' : 'pending');
    const isApproved = data.is_approved ?? (approvalStatus === 'approved');

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || null,
      avatarUrl: data.avatar_url || null,
      role: data.role || 'user',
      department: data.department || null,
      isActive: data.is_active ?? true,
      approvalStatus,
      isApproved,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await AuthService.client.auth.resetPasswordForEmail(email);
    return { error };
  }
        }
