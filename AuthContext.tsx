import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase/client';
import { AuthService } from '../services/authService';
import { UserProfile, SignInCredentials, SignUpCredentials } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = getSupabaseClient();

  const fetchProfile = async (userId: string) => {
    try {
      const userProfile = await AuthService.getCurrentUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error('[BdSmartLeadX-02] Fetch user profile error:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error('[BdSmartLeadX-02] Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (credentials: SignInCredentials) => {
    setIsLoading(true);
    try {
      const res = await AuthService.signIn(credentials);
      if (res.error) throw res.error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    try {
      const res = await AuthService.signUp(credentials);
      if (res.error) throw res.error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
