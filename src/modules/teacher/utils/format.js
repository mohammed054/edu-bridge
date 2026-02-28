const dateFormatter = new Intl.DateTimeFormat('en-GB-u-nu-latn', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB-u-nu-latn', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export const formatEnglishDate = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
};

export const formatEnglishDateTime = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateTimeFormatter.format(date);
};

export const formatEnglishNumber = (value, maximumFractionDigits = 0) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(numberValue);
};

export const resolveAvatar = (person = {}) => {
  const seed = person.profilePicture || person.avatarUrl || person.name || person.email || person.id || 'user';
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(seed)}`;
};
