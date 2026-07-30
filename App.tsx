import React from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { AdminProvider } from './AdminContext';
import { AppShell } from './AppShell';

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
