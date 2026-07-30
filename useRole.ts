import { useAuth } from './useAuth';
import { UserRole } from '../types/auth';

const ROLE_RANK: Record<UserRole, number> = {
  user: 1,
  agent: 2,
  manager: 3,
  admin: 4,
};

export function useRole() {
  const { profile } = useAuth();
  const currentRole: UserRole = profile?.role || 'user';

  const hasMinimumRole = (requiredRole: UserRole): boolean => {
    return ROLE_RANK[currentRole] >= ROLE_RANK[requiredRole];
  };

  const isAdmin = currentRole === 'admin';
  const isManager = currentRole === 'manager' || currentRole === 'admin';
  const isAgent = currentRole === 'agent' || currentRole === 'manager' || currentRole === 'admin';

  return {
    role: currentRole,
    isAdmin,
    isManager,
    isAgent,
    hasMinimumRole,
  };
}
