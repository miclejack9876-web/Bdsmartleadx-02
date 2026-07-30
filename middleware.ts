import { getSupabaseClient } from './client';
import { UserRole } from '../../types/auth';

export async function updateSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[BdSmartLeadX-02] Session update error:', error.message);
    return null;
  }

  return data.session;
}

export async function checkUserPermissions(requiredRole?: UserRole): Promise<{
  isAuthorized: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  role: UserRole | null;
  userId: string | null;
}> {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { isAuthorized: false, isApproved: false, approvalStatus: 'pending', role: null, userId: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, approval_status, is_approved')
    .eq('id', user.id)
    .single();

  const userRole: UserRole = profile?.role || 'user';
  const approvalStatus = (profile?.approval_status as any) || (profile?.is_approved ? 'approved' : 'pending');
  const isApproved = userRole === 'admin' || (profile?.is_approved ?? (approvalStatus === 'approved'));

  if (!requiredRole) {
    return { isAuthorized: true, isApproved, approvalStatus, role: userRole, userId: user.id };
  }

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    agent: 2,
    manager: 3,
    admin: 4,
  };

  const isRoleAuthorized = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  // An admin is always authorized; non-admins must be approved to access features
  const isAuthorized = userRole === 'admin' ? isRoleAuthorized : (isRoleAuthorized && isApproved);

  return { isAuthorized, isApproved, approvalStatus, role: userRole, userId: user.id };
}
