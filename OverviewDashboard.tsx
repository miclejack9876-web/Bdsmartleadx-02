import React from 'react';
import { useAuth } from './useAuth';
import { Wallet, Globe, FileCheck, CheckCircle2, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';

export function OverviewDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6" id="overview-dashboard-view">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Account Approved
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {profile?.id.slice(0, 8)}...</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {profile?.fullName || profile?.email}!</h2>
          <p className="text-xs text-slate-400 mt-1">
            BdSmartLeadX-02 Sign-up to Sign-up Exchange Operating Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-right">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Surfing Balance</p>
            <p className="text-xl font-bold text-emerald-400">$24.50</p>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Offers Posted</p>
            <h3 className="text-xl font-bold text-white mt-1">3 Campaigns</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 18 submissions today
            </p>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Conversions</p>
            <h3 className="text-xl font-bold text-white mt-1">42 Tasks</h3>
            <p className="text-[11px] text-slate-400 mt-1">100% approval rate</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wallet Earnings</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-1">$158.20 Total</h3>
            <p className="text-[11px] text-slate-400 mt-1">Ready for instant payout</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
              }
