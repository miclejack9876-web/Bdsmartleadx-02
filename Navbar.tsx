import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, User, LogOut, Search, Bell } from 'lucide-react';

export function Navbar() {
  const { profile, isAuthenticated, signOut } = useAuth();

  return (
    <nav className="h-16 bg-slate-900 text-slate-100 border-b border-slate-800 px-6 flex items-center justify-between" id="app-navbar">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm" id="brand-logo">
          LX
        </div>
        <div>
          <span className="font-semibold text-base tracking-wide text-white">BdSmartLeadX-02</span>
          <span className="ml-2 text-[10px] font-mono uppercase bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/50">
            Enterprise
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated && (
          <>
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400">
              <Search className="w-3.5 h-3.5 mr-2" />
              <span>Search leads, logs...</span>
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors relative" id="navbar-notifications-btn">
              <Bell className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center space-x-3" id="user-profile-badge">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-medium text-slate-200">{profile?.fullName || profile?.email || 'User'}</p>
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">{profile?.role || 'user'}</p>
              </div>

              <button
                onClick={() => signOut()}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                title="Sign Out"
                id="navbar-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
