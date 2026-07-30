import React, { ReactNode } from 'react';
import { useRole } from '../../hooks/useRole';
import { UserRole } from '../../types/auth';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { hasMinimumRole } = useRole();

  if (!hasMinimumRole(requiredRole)) {
    return (
      fallback || (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-800" id="role-guard-denied">
          <h4 className="font-semibold text-sm">Access Restricted</h4>
          <p className="text-xs mt-1">
            Your current account role does not have permission to view this resource. Requires {requiredRole} privileges.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
