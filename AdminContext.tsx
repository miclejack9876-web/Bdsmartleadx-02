import React, { createContext, ReactNode } from 'react';
import { useAdmin } from './useAdmin';

export const AdminContext = createContext<ReturnType<typeof useAdmin> | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const adminMethods = useAdmin();

  return (
    <AdminContext.Provider value={adminMethods}>
      {children}
    </AdminContext.Provider>
  );
}
