const SESSION_KEY = 'phase2_edubridge_session';
const TEACHER_DOMAIN = '@private.moe.gov.ae';

function resolveRole(identifier, roleHint) {
  const value = identifier.trim().toLowerCase();
  const hint = roleHint?.trim().toLowerCase();

  if (value === 'admin') return 'admin';
  if (value === 'staff') return 'staff';
  if (value.endsWith(TEACHER_DOMAIN)) return 'teacher';
  if (hint === 'student' || value === 'student') return 'student';
  if (hint === 'parent' || value === 'parent') return 'parent';

  return null;
}

export function createSession({ identifier, password, roleHint }) {
  const cleanIdentifier = identifier?.trim() || '';
  const cleanPassword = password?.trim() || '';

  if (!cleanIdentifier || !cleanPassword) {
    throw new Error('Please enter both username/email and password.');
  }

  const role = resolveRole(cleanIdentifier, roleHint);
  if (!role) {
    throw new Error('Unauthorized login. Use admin, staff, teacher email, student, or parent.');
  }

  const session = {
    token: btoa(`${cleanIdentifier}-${Date.now()}`),
    role,
    identifier: cleanIdentifier,
    displayName: cleanIdentifier,
    avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(cleanIdentifier)}`,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
