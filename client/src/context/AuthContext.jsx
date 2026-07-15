import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'skillswap_auth';

function readStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return session?.token ? session : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const saveSession = useCallback((nextSession) => {
    const normalized = { token: nextSession.token || nextSession.accessToken, user: nextSession.user || null };
    setSession(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }, []);

  const logout = useCallback(() => {
    setSession({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUser = useCallback((user) => saveSession({ token: session.token, user }), [saveSession, session.token]);

  const refreshSession = useCallback(async () => {
    const response = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      logout();
      return null;
    }

    const refreshed = await response.json();
    return saveSession(refreshed.data || refreshed);
  }, [logout, saveSession]);

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const request = (token) => fetch(url, {
      ...options,
      credentials: 'include',
      headers: { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    let response = await request(session.token);
    if (response.status !== 401) return response;

    const refreshed = await refreshSession();
    if (!refreshed?.token) return response;
    response = await request(refreshed.token);
    if (response.status === 401) logout();
    return response;
  }, [logout, refreshSession, session.token]);

  const value = useMemo(() => ({
    token: session.token,
    user: session.user,
    isAuthenticated: Boolean(session.token),
    login: saveSession,
    updateUser,
    logout,
    refreshSession,
    authenticatedFetch,
  }), [authenticatedFetch, logout, refreshSession, saveSession, session, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
