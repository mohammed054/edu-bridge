import { createContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredSession,
  getCurrentUser,
  getStoredSession,
  login as loginRequest,
  setStoredSession,
} from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      const stored = getStoredSession();

      if (!stored?.token) {
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await getCurrentUser(stored.token);
        const next = {
          token: stored.token,
          user: me.user,
        };

        setStoredSession(next);
        if (mounted) {
          setSession(next);
        }
      } catch {
        clearStoredSession();
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({ role, identifier, password }) => {
    const payload = await loginRequest({ role, identifier, password });
    setStoredSession(payload);
    setSession(payload);
    return payload;
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
      isLoading,
      isAuthenticated: Boolean(session?.token && session?.user),
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
