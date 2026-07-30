import React, { createContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';

type UserContextType = ReturnType<typeof useUser>;

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userMethods = useUser(user?.id);

  return (
    <UserContext.Provider value={userMethods}>
      {children}
    </UserContext.Provider>
  );
}
