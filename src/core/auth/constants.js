export const SESSION_STORAGE_KEY = 'edu_bridge_auth_session';
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const AUTH_MODE = 'api';

export const ROLE_HOME = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};
