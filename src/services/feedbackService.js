const STORAGE_KEY = 'phase1_student_feedback';

function readFeedback() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeFeedback(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function saveFeedback({ studentId, note }) {
  const current = readFeedback();

  const nextStudentNotes = [
    ...(current[studentId] || []),
    {
      id: `${studentId}-${Date.now()}`,
      text: note,
      createdAt: new Date().toISOString(),
    },
  ];

  const next = {
    ...current,
    [studentId]: nextStudentNotes,
  };

  writeFeedback(next);
  return nextStudentNotes;
}

export async function generateFeedbackSuggestions(input) {
  const base = input.trim() || 'يرجى متابعة الطالب بشكل يومي';

  return [
    `الطالب أظهر تحسنًا ملحوظًا، ${base}.`,
    `ننصح بخطة دعم قصيرة خلال الأسبوع القادم، ${base}.`,
    `يرجى تعزيز المشاركة الصفية مع متابعة مستمرة، ${base}.`,
  ];
}
