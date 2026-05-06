import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/identities/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data = await response.json();

      if (!data?.success || !data?.identity) {
        setUser(null);
        return null;
      }

      setUser(data.identity);
      return data.identity;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/identities/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await refreshUser();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    refreshUser,
    logout,
  }), [user, isLoading, refreshUser, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
