import { ApiError } from '../api/api.js';

const isCorruptedArabic = (text) => /\?{2,}/.test(String(text || ''));

export const toUserMessage = (error, fallback = 'حدث خطأ غير متوقع.') => {
  if (!error) {
    return fallback;
  }

  if (error instanceof ApiError) {
    if (error.message && !isCorruptedArabic(error.message)) {
      return error.message;
    }

    if (error.status === 401) {
      return 'بيانات الدخول غير صحيحة.';
    }
    if (error.status === 403) {
      return 'ليست لديك صلاحية للوصول.';
    }
    if (error.status === 400) {
      return 'البيانات المدخلة غير صحيحة.';
    }

    return fallback;
  }

  return fallback;
};
