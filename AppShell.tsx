import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { useRole } from './useRole';
import { MainLayout } from './MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { AuthModal } from './AuthModal';
import { UserManagement } from './UserManagement';
import { GlobalJobFeed } from './GlobalJobFeed';
import { OverviewDashboard } from './OverviewDashboard';
import { SubmissionsReview } from './SubmissionsReview';
import { APP_ROUTES } from './routes';
import { validateEnvironment } from './env';
import { Database, Shield, Server, FolderTree, KeyRound, CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export function AppShell() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const { role } = useRole();
  const envValidation = validateEnvironment();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100" id="app-loading-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading BdSmartLeadX-02...</p>
      </div>
    );
  }

  // Strictly enforce unauthenticated Auth view without sidebar/navbar
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100" id="unauthenticated-auth-viewport">
        <AuthModal 
          defaultTab={currentPath === '/auth/signup' ? 'register' : 'signin'} 
          onSuccess={() => setCurrentPath('/overview')} 
        />
      </div>
    );
  }

  // Active path for authenticated state (redirect / or auth paths to /overview)
  const effectivePath = (currentPath === '/' || currentPath === '/auth/signin' || currentPath === '/auth/signup') ? '/overview' : currentPath;
  const activeRoute = APP_ROUTES[effectivePath] || APP_ROUTES['/overview'];

  const renderContent = () => {
    if (effectivePath === '/admin/users') {
      return (
        <RoleGuard requiredRole="admin">
          <UserManagement />
        </RoleGuard>
      );
    }

    if (effectivePath === '/feed' || effectivePath === '/offers') {
      return <GlobalJobFeed />;
    }

    if (effectivePath === '/submissions') {
      return <SubmissionsReview />;
    }

    if (effectivePath === '/admin/dashboard') {
      return (
        <RoleGuard requiredRole="admin">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">Admin Command Center</h2>
              <p className="text-xs text-slate-400">
                Manage users, approve pending registrations, and moderate campaigns across BdSmartLeadX-02.
              </p>
            </div>
            <UserManagement />
          </div>
        </RoleGuard>
      );
    }

    return <OverviewDashboard />;
  };

  return (
    <MainLayout
      title={activeRoute.title}
      subtitle={activeRoute.subtitle}
      currentPath={effectivePath}
      onNavigate={setCurrentPath}
    >
      <div className="space-y-6" id="architecture-overview-shell">
        {/* System & Auth Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase text-slate-400">Database Connection</h3>
              <p className="text-xs font-semibold text-slate-100 mt-0.5">Supabase Client Connected</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase text-slate-400">Admin Approval Engine</h3>
              <p className="text-xs font-semibold text-slate-100 mt-0.5">Strict Registration Protection Active</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase text-slate-400">Current User Status</h3>
              <p className="text-xs font-mono font-semibold text-amber-300 mt-0.5 uppercase">
                {profile ? `${profile.approvalStatus} (${profile.role})` : 'Authenticated User'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Route Content */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6" id="active-route-shell">
          {activeRoute.isProtected ? (
            <ProtectedRoute>
              {renderContent()}
            </ProtectedRoute>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </MainLayout>
  );
         }
