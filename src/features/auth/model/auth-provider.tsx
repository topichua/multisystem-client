import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { configureApiClientAuth } from '@/api/api-client';

import { AuthContext } from './auth-context';
import { tokenStorage } from './token-storage';

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(tokenStorage.getAccessToken()));

  const login = useCallback((token: string) => {
    tokenStorage.setAccessToken(token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearAccessToken();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    return configureApiClientAuth({
      getAccessToken: tokenStorage.getAccessToken,
      onUnauthorized: logout,
    });
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
