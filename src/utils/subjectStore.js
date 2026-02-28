const STORAGE_KEY = 'hikmah_school_subject_store_v1';

const emptyStore = {
  homework: [],
  stars: [],
  exams: [],
  notes: [],
};

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage || window.sessionStorage;
};

const readStore = () => {
  const storage = getStorage();
  if (!storage) {
    return { ...emptyStore };
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...emptyStore };
    }
    const parsed = JSON.parse(raw);
    return {
      homework: Array.isArray(parsed.homework) ? parsed.homework : [],
      stars: Array.isArray(parsed.stars) ? parsed.stars : [],
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return { ...emptyStore };
  }
};

const writeStore = (nextStore) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
};

const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const byClassSubject = (record, className, subject) =>
  record.className === className && record.subject === subject;

export const listHomework = ({ className, subject, studentId } = {}) =>
  readStore()
    .homework.filter((item) => {
      if (className && item.className !== className) return false;
      if (subject && item.subject !== subject) return false;
      if (!studentId) return true;
      return (item.completedBy || []).some((entry) => entry.studentId === studentId && entry.done);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addHomework = ({ className, subject, title, dueDate, teacherId }) => {
  const store = readStore();
  const nextItem = {
    id: createId('hw'),
    className,
    subject,
    title: String(title || '').trim(),
    dueDate: dueDate || '',
    teacherId: teacherId || '',
    createdAt: new Date().toISOString(),
    completedBy: [],
  };
  store.homework.unshift(nextItem);
  writeStore(store);
  return nextItem;
};

export const setHomeworkCompletion = ({ homeworkId, studentId, done }) => {
  const store = readStore();
  store.homework = store.homework.map((item) => {
    if (item.id !== homeworkId) {
      return item;
    }
    const currentList = Array.isArray(item.completedBy) ? item.completedBy : [];
    const withoutStudent = currentList.filter((entry) => entry.studentId !== studentId);
    return {
      ...item,
      completedBy: [...withoutStudent, { studentId, done: Boolean(done), updatedAt: new Date().toISOString() }],
    };
  });
  writeStore(store);
};

export const listStars = ({ className, subject, studentId } = {}) =>
  readStore()
    .stars.filter((item) => {
      if (className && item.className !== className) return false;
      if (subject && item.subject !== subject) return false;
      if (studentId && item.studentId !== studentId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addStars = ({ className, subject, studentId, value, note, teacherId }) => {
  const store = readStore();
  const nextItem = {
    id: createId('star'),
    className,
    subject,
    studentId,
    value: Number(value || 0),
    note: String(note || '').trim(),
    teacherId: teacherId || '',
    createdAt: new Date().toISOString(),
  };
  store.stars.unshift(nextItem);
  writeStore(store);
  return nextItem;
};

export const listExams = ({ className, subject, studentId } = {}) =>
  readStore()
    .exams.filter((item) => {
      if (className && item.className !== className) return false;
      if (subject && item.subject !== subject) return false;
      if (studentId && item.studentId !== studentId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addExamRecord = ({ className, subject, studentId, title, score, fullMark, teacherId }) => {
  const store = readStore();
  const nextItem = {
    id: createId('exam'),
    className,
    subject,
    studentId,
    title: String(title || '').trim(),
    score: Number(score || 0),
    fullMark: Number(fullMark || 0),
    teacherId: teacherId || '',
    createdAt: new Date().toISOString(),
  };
  store.exams.unshift(nextItem);
  writeStore(store);
  return nextItem;
};

export const listNotes = ({ className, subject, studentId } = {}) =>
  readStore()
    .notes.filter((item) => {
      if (className && item.className !== className) return false;
      if (subject && item.subject !== subject) return false;
      if (studentId && item.studentId !== studentId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addNote = ({ className, subject, studentId, text, teacherId }) => {
  const store = readStore();
  const nextItem = {
    id: createId('note'),
    className,
    subject,
    studentId,
    text: String(text || '').trim(),
    teacherId: teacherId || '',
    createdAt: new Date().toISOString(),
  };
  store.notes.unshift(nextItem);
  writeStore(store);
  return nextItem;
};

export const buildClassAnalytics = ({ className, subject, students = [], examMarks = [] }) => {
  const studentIds = new Set(students.map((item) => item.id));

  const classExamRecords = listExams({ className, subject }).filter((item) => studentIds.has(item.studentId));
  const marks = examMarks
    .filter((item) => item.subject === subject)
    .map((item) => Number(item.score || 0))
    .filter((item) => !Number.isNaN(item));

  const homeworkRecords = readStore().homework.filter((item) => byClassSubject(item, className, subject));
  const totalHomeworkItems = homeworkRecords.length * Math.max(students.length, 1);
  const completedHomework = homeworkRecords.reduce((acc, item) => {
    const completedCount = (item.completedBy || []).filter((entry) => entry.done).length;
    return acc + completedCount;
  }, 0);

  const starsTotal = listStars({ className, subject })
    .filter((item) => studentIds.has(item.studentId))
    .reduce((acc, item) => acc + Number(item.value || 0), 0);

  const averageScore = marks.length
    ? marks.reduce((acc, value) => acc + value, 0) / marks.length
    : 0;

  const lowMarksCount = marks.filter((value) => value < 50).length;
  const alerts = [];
  if (lowMarksCount > 0) {
    alerts.push(`يوجد ${lowMarksCount} طالبًا تحت مستوى 50.`);
  }
  if (!homeworkRecords.length) {
    alerts.push('لا توجد واجبات مسجلة لهذا الصف.');
  }
  if (!classExamRecords.length) {
    alerts.push('لا توجد اختبارات مسجلة لهذا الصف.');
  }

  return {
    studentsCount: students.length,
    averageScore,
    highestScore: marks.length ? Math.max(...marks) : 0,
    lowestScore: marks.length ? Math.min(...marks) : 0,
    homeworkCompletionRate: totalHomeworkItems ? (completedHomework / totalHomeworkItems) * 100 : 0,
    starsTotal,
    alerts,
  };
};
