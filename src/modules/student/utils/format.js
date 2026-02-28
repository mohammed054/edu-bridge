const dateFormatter = new Intl.DateTimeFormat('ar-SA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ar-SA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (value) => {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFormatter.format(d);
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return dateTimeFormatter.format(d);
};

export const formatNumber = (value, maxFraction = 0) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  }).format(n);
};

// Backwards compat aliases
export const formatEnglishDate = formatDate;
export const formatEnglishDateTime = formatDateTime;
export const formatEnglishNumber = formatNumber;
