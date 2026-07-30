import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'agent' | 'user';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  department?: string | null;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  email: string;
  password?: string;
  fullName?: string;
}

export interface AuthResponse {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  error: Error | null;
}
