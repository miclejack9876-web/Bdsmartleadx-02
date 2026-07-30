import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PendingApprovalNotice } from './PendingApprovalNotice';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  allowPending?: boolean;
}

export function ProtectedRoute({ children, fallback, allowPending = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" id="auth-loading-spinner">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto my-8" id="auth-unauthorized-message">
          <h3 className="text-lg font-bold text-slate-100">Authentication Required</h3>
          <p className="mt-2 text-xs text-slate-400">
            Please sign in or register to access BdSmartLeadX-02 platform features.
          </p>
        </div>
      )
    );
  }

  // Check if user is pending approval (admin role bypasses pending approval)
  const isPending = profile && profile.role !== 'admin' && (profile.approvalStatus === 'pending' || !profile.isApproved);

  if (isPending && !allowPending) {
    return <PendingApprovalNotice />;
  }

  return <>{children}</>;
}
