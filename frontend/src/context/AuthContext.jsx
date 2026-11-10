import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  changePasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfileRequest,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const currentUser = await loginUser(credentials);
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback(async (payload) => {
    const currentUser = await registerUser(payload);
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await updateProfileRequest(payload);
    setUser(updated);
    return updated;
  }, []);

  const changePassword = useCallback((payload) => changePasswordRequest(payload), []);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      refreshUser,
    }),
    [user, loading, login, register, logout, updateProfile, changePassword, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
