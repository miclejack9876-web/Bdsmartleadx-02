import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, RefreshCw, LogOut, Clock, CheckCircle, Mail, AlertTriangle } from 'lucide-react';

export function PendingApprovalNotice() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      await refreshProfile();
      setRefreshMessage('Account status checked!');
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (err) {
      setRefreshMessage('Error checking status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100" id="pending-approval-card">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon & Status Badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border-2 border-slate-900">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Status: Pending Admin Activation
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Your account is pending admin approval.
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-lg">
            Please wait for activation. An administrator must review and approve your account before you gain full access to the Global Job Feed, Offers, and platform features.
          </p>
        </div>

        {/* User Info Details Box */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-left space-y-3 mt-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Account Email
            </span>
            <span className="font-mono font-medium text-slate-200">{profile?.email || user?.email || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
            <span className="text-slate-400">Full Name</span>
            <span className="font-medium text-slate-200">{profile?.fullName || 'Not provided'}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
            <span className="text-slate-400">Role Request</span>
            <span className="font-mono uppercase text-indigo-400 font-semibold">{profile?.role || 'user'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Approval Status</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-800">
              {profile?.approvalStatus || 'pending'}
            </span>
          </div>
        </div>

        {/* Informational Box */}
        <div className="w-full bg-cyan-950/20 border border-cyan-800/40 rounded-lg p-3 text-left text-xs text-cyan-200 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-cyan-300">What happens next?</p>
            <p className="mt-0.5 text-slate-300 text-[11px]">
              Once an admin logs into the Admin Panel and clicks <strong>"Approve"</strong>, your account will be activated immediately and you can refresh this page to begin using the platform.
            </p>
          </div>
        </div>

        {refreshMessage && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/50">
            {refreshMessage}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950 disabled:opacity-50 cursor-pointer"
            id="refresh-approval-status-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Status...' : 'Check Approval Status'}</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
            id="pending-notice-logout-btn"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
