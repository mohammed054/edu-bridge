import { SESSION_STORAGE_KEY } from './constants';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

export const getStoredSession = () => {
  try {
    const raw = getStorage()?.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (session) => {
  getStorage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  getStorage()?.removeItem(SESSION_STORAGE_KEY);
};