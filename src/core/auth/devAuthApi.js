import { createDevJwt, decodeJwtPayload } from './jwt';

const DEV_USERS = [
  {
    identifier: 'stum@moe.sch.ae',
    role: 'student',
    profile: {
      id: 'dev-student-1',
      name: 'طالب تجريبي',
      email: 'stum@moe.sch.ae',
      role: 'student',
      classes: ['11A'],
    },
  },
  {
    identifier: 'tum@moe.sch.ae',
    role: 'teacher',
    profile: {
      id: 'dev-teacher-1',
      name: 'معلم تجريبي',
      email: 'tum@moe.sch.ae',
      role: 'teacher',
      subject: 'الرياضيات',
    },
  },
  {
    identifier: 'admin',
    role: 'admin',
    profile: {
      id: 'dev-admin-1',
      name: 'مدير النظام',
      username: 'admin',
      role: 'admin',
    },
  },
];

const normalizeIdentifier = (value = '') => String(value).trim().toLowerCase();

const pickUser = ({ identifier, portal }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const normalizedPortal = String(portal || '').trim().toLowerCase();

  const byIdentifier = DEV_USERS.find((entry) => normalizeIdentifier(entry.identifier) === normalizedIdentifier);
  if (!byIdentifier) {
    return null;
  }

  if (normalizedPortal && byIdentifier.role !== normalizedPortal) {
    throw new Error('الدور المحدد لا يطابق بيانات المستخدم.');
  }

  return byIdentifier;
};

export const loginWithMock = async ({ identifier, password, portal }) => {
  const user = pickUser({ identifier, portal });

  if (!user) {
    throw new Error('بيانات الدخول غير صحيحة.');
  }

  // Password is accepted as any non-empty value in mock mode for UI testing.
  if (!String(password || '').trim()) {
    throw new Error('يرجى إدخال كلمة المرور.');
  }

  return {
    token: createDevJwt({ role: user.role, subject: user.profile.id }),
    user: user.profile,
  };
};

export const getMockCurrentUser = async (token) => {
  const payload = decodeJwtPayload(token);
  const user = DEV_USERS.find((entry) => entry.profile.id === payload?.sub);

  if (!user) {
    throw new Error('انتهت الجلسة.');
  }

  return { user: user.profile };
};
