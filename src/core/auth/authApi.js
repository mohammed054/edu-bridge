import { API_BASE_URL, AUTH_MODE } from './constants';
import { getMockCurrentUser, loginWithMock } from './devAuthApi';

export class AuthApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'AuthApiError';
    this.status = Number(status);
  }
}

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    throw new AuthApiError(payload.message || 'تعذر تنفيذ الطلب.', response.status);
  }

  return payload;
};

export const loginRequest = async ({ identifier, password, portal }) => {
  if (AUTH_MODE === 'mock') {
    return loginWithMock({ identifier, password, portal });
  }

  return request('/auth/login', {
    method: 'POST',
    body: {
      identifier: String(identifier || '').trim().toLowerCase(),
      password: String(password || ''),
      portal: String(portal || '').trim().toLowerCase(),
    },
  });
};

export const getCurrentUserRequest = async (token) => {
  if (AUTH_MODE === 'mock') {
    return getMockCurrentUser(token);
  }

  return request('/auth/me', {
    token,
  });
};

export const logoutRequest = async (token) => {
  if (AUTH_MODE === 'mock') {
    return { success: true };
  }

  return request('/auth/logout', {
    method: 'POST',
    token,
  });
};
