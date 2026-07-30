import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function MainLayout({ children, title, subtitle, currentPath, onNavigate }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased" id="main-app-container">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 p-8 max-w-7xl w-full mx-auto" id="main-content-viewport">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
