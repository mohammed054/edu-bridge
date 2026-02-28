const AR_DATE_LOCALE = 'ar-AE-u-nu-latn';

export const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(AR_DATE_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

export const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(AR_DATE_LOCALE, {
    dateStyle: 'medium',
  }).format(parsed);
};

export const formatNumber = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat(AR_DATE_LOCALE, {
    maximumFractionDigits: 2,
  }).format(number);
};

export const resolveAvatar = (user) => {
  if (user?.profilePicture) {
    return user.profilePicture;
  }
  if (user?.avatarUrl) {
    return user.avatarUrl;
  }
  const seed = encodeURIComponent(user?.name || user?.email || user?.username || 'student');
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
};
