import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUserRequest, loginRequest, logoutRequest } from './authApi';
import { AUTH_MODE } from './constants';
import { decodeJwtPayload, getTokenRemainingMs, isJwtExpired } from './jwt';
import { clearStoredSession, getStoredSession, setStoredSession } from './storage';

const AuthContext = createContext(null);

const readRole = (session) => {
  if (session?.user?.role) {
    return String(session.user.role).toLowerCase();
  }

  const payload = decodeJwtPayload(session?.token);
  return payload?.role ? String(payload.role).toLowerCase() : null;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    const token = session?.token || getStoredSession()?.token;
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // Ignore logout API failures and clear local session regardless.
      }
    }

    clearStoredSession();
    setSession(null);
  }, [session?.token]);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const stored = getStoredSession();

      if (stored?.authMode && stored.authMode !== AUTH_MODE) {
        clearStoredSession();
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      if (!stored?.token || isJwtExpired(stored.token)) {
        clearStoredSession();
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await getCurrentUserRequest(stored.token);
        const nextSession = {
          token: stored.token,
          user: me.user,
          authMode: AUTH_MODE,
        };

        setStoredSession(nextSession);
        if (isMounted) {
          setSession(nextSession);
        }
      } catch {
        clearStoredSession();
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.token) {
      return undefined;
    }

    const remainingMs = getTokenRemainingMs(session.token);
    if (!Number.isFinite(remainingMs)) {
      return undefined;
    }

    if (remainingMs <= 0) {
      void logout();
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      void logout();
    }, remainingMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [session?.token, logout]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleSessionExpired = () => {
      void logout();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [logout]);

  const login = useCallback(async ({ identifier, password, portal }) => {
    const payload = await loginRequest({ identifier, password, portal });

    if (!payload?.token || !payload?.user || isJwtExpired(payload.token)) {
      throw new Error('Unable to create a valid session.');
    }

    const nextSession = {
      token: payload.token,
      user: payload.user,
      authMode: AUTH_MODE,
    };

    setStoredSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const value = useMemo(() => {
    const role = readRole(session);

    return {
      session,
      token: session?.token || null,
      user: session?.user || null,
      role,
      isLoading,
      isAuthenticated: Boolean(session?.token && session?.user && role),
      isAdmin: role === 'admin',
      login,
      logout,
    };
  }, [session, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
