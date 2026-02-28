export function buildLocalFeedbackMessage({ studentName, tags = [], notes = '' }) {
  const tagText = tags.length ? tags.join('، ') : 'ملاحظات عامة';
  const notesText = notes?.trim() ? ` ملاحظة إضافية: ${notes.trim()}` : '';
  return `تم إنشاء رسالة تغذية راجعة للطالب/ة ${studentName} ضمن الفئات ${tagText}.${notesText}`.trim();
}

export function buildAIPrompt({ studentName, tags = [], notes = '', audience = 'family' }) {
  const audienceLabel = audience === 'teacher' ? 'المعلم/ة وولي الأمر' : 'ولي الأمر';

  return [
    `اكتب رسالة عربية تربوية مختصرة موجهة إلى ${audienceLabel}.`,
    `اسم الطالب: ${studentName}`,
    `فئات الملاحظات: ${tags.join('، ') || 'لا يوجد'}`,
    `ملاحظات إضافية: ${notes?.trim() || 'لا يوجد'}`,
    'الناتج: فقرتان قصيرتان بلغة واضحة ومهنية.',
  ].join('\n');
}
