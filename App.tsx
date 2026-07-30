import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { AdminProvider } from './context/AdminContext';
import { AppShell } from './app/AppShell';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AdminProvider>
          <AppShell />
        </AdminProvider>
      </UserProvider>
    </AuthProvider>
  );
}
