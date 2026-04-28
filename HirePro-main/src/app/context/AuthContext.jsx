import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { loginUser } from '../lib/api';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);
const AUTH_STORAGE_KEY = 'hirepro-auth';
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

function parseTokenExpiration(token) {
  try {
    if (!token || !token.includes('.')) {
      return null;
    }

    const [payload] = token.split('.');
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    const decoded = JSON.parse(window.atob(paddedPayload));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const expiryTimeoutRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);

  const clearSessionTimers = () => {
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  };

  const logout = (options = {}) => {
    clearSessionTimers();
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);

    if (options.reason === 'expired') {
      toast.info('Session expired. Please sign in again.');
    }

    if (options.reason === 'inactive') {
      toast.info('Logged out after inactivity. Please sign in again.');
    }
  };

  const startInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = window.setTimeout(() => {
      logout({ reason: 'inactive' });
    }, INACTIVITY_LIMIT_MS);
  };

  const attachSessionTimers = (activeToken) => {
    clearSessionTimers();

    const expirationTime = parseTokenExpiration(activeToken);
    if (!expirationTime) {
      logout();
      return;
    }

    const msUntilExpiration = expirationTime - Date.now();
    if (msUntilExpiration <= 0) {
      logout({ reason: 'expired' });
      return;
    }

    expiryTimeoutRef.current = window.setTimeout(() => {
      logout({ reason: 'expired' });
    }, msUntilExpiration);

    startInactivityTimer();
  };

  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) {
      return;
    }

    try {
      const parsed = JSON.parse(savedAuth);
      if (!parsed.user || !parsed.token) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      const expirationTime = parseTokenExpiration(parsed.token);
      if (!expirationTime || expirationTime <= Date.now()) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      setUser(parsed.user);
      setToken(parsed.token);
      attachSessionTimers(parsed.token);
    } catch (error) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!user || !token) {
      return undefined;
    }

    const events = ['click', 'keydown', 'mousemove', 'scroll'];
    const handleActivity = () => startInactivityTimer();

    events.forEach((eventName) => window.addEventListener(eventName, handleActivity));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
    };
  }, [user, token]);

  useEffect(() => () => clearSessionTimers(), []);

  const login = async ({ email, password, role }) => {
    const response = await loginUser({ email, password });
    if (role && response.user.role !== role) {
      throw new Error(`This account is registered as ${response.user.role}.`);
    }

    const authState = { user: response.user, token: response.token };
    setUser(response.user);
    setToken(response.token);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    attachSessionTimers(response.token);
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
