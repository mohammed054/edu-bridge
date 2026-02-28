export const FEEDBACK_CATEGORIES = [
  { key: 'academic', label: 'أكاديمي' },
  { key: 'moral', label: 'سلوكي' },
  { key: 'idfk', label: 'أخرى' },
];

export const FEEDBACK_LABELS = FEEDBACK_CATEGORIES.reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

export const FEEDBACK_CATEGORY_LABEL_BY_KEY = FEEDBACK_LABELS;
