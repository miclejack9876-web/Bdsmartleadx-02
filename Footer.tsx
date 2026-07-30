import React from 'react';

export function Footer() {
  return (
    <footer className="py-4 px-8 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2" id="app-footer">
      <div className="flex items-center space-x-2">
        <span>© 2026 BdSmartLeadX-02 Architecture</span>
        <span className="text-slate-700">•</span>
        <span className="text-indigo-400 font-mono text-[11px]">Supabase Native</span>
      </div>
      <div className="flex items-center space-x-4 text-[11px]">
        <span className="hover:text-slate-300 transition-colors cursor-pointer">Security Protocol</span>
        <span className="hover:text-slate-300 transition-colors cursor-pointer">RLS Policies</span>
        <span className="hover:text-slate-300 transition-colors cursor-pointer">Vercel Deployment</span>
      </div>
    </footer>
  );
}
