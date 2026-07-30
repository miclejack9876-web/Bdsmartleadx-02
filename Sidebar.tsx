import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  PlusCircle, 
  FileSpreadsheet, 
  Wallet, 
  Settings, 
  ShieldAlert 
} from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const pathname = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/overview');
  const isAdmin = pathname?.startsWith('/admin');

  // ইউজার প্যানেলের মেনু লিস্ট
  const userNavigation = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard },
    { name: 'Global Job Feed', href: '/feed', icon: Globe },
    { name: 'Post & Manage Offers', href: '/offers', icon: PlusCircle },
    { name: 'Submissions', href: '/submissions', icon: FileSpreadsheet },
    { name: 'Surfing Balance', href: '/profile', icon: Wallet },
    { name: 'Account Settings', href: '/settings', icon: Settings },
  ];

  // অ্যাডমিন প্যানেলের মেনু লিস্ট
  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: ShieldAlert },
    { name: 'Offer Moderation', href: '/admin/offers', icon: Globe },
    { name: 'Back to User Panel', href: '/overview', icon: Wallet },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', href);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-64 border-r border-slate-800" id="app-sidebar">
      {/* লোগো ও ব্র্যান্ডিং */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-cyan-400">BdSmartLeadX-02</h1>
          <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
            {isAdmin ? 'ADMIN PANEL' : 'USER PANEL'}
          </span>
        </div>
      </div>

      {/* নেভিগেশন লিংকস */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={(e) => handleNavigation(e, item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* ফুটার বা স্ট্যাটাস */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Sign-up to Sign-up Exchange Platform
      </div>
    </div>
  );
}

export default Sidebar;
