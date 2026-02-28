const decodeBase64Url = (value) => {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

  try {
    const decoded = atob(padded);
    const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

export const decodeJwtPayload = (token) => {
  const parts = String(token || '').split('.');
  if (parts.length < 2) {
    return null;
  }

  const json = decodeBase64Url(parts[1]);
  if (!json) {
    return null;
  }

  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isJwtExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  const expiresAtMs = Number(payload.exp) * 1000;
  if (!Number.isFinite(expiresAtMs)) {
    return false;
  }

  return Date.now() >= expiresAtMs;
};

export const getTokenRemainingMs = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return Number.POSITIVE_INFINITY;
  }

  const remainingMs = Number(payload.exp) * 1000 - Date.now();
  return Number.isFinite(remainingMs) ? remainingMs : 0;
};

export const createDevJwt = ({ role, subject, expiresInSeconds = 60 * 60 * 2 }) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: subject,
    role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const toUrlBase64 = (value) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${toUrlBase64(header)}.${toUrlBase64(payload)}.dev-signature`;
};