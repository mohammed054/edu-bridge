const FEEDBACK_KEY = 'phase2_feedback_records';

const seedStudents = [
  { id: 's-001', name: 'Aisha Al Marri', className: 'Grade 11 Adv 3' },
  { id: 's-002', name: 'Omar Al Kaabi', className: 'Grade 11 Adv 3' },
  { id: 's-003', name: 'Mariam Al Suwaidi', className: 'Grade 11 Adv 3' },
  { id: 's-004', name: 'Khalid Al Mansoori', className: 'Grade 11 Adv 3' },
];

function read() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(data) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data));
}

export function getClasses() {
  return ['Grade 11 Adv 3'];
}

export function getStudentsByClass(className) {
  return seedStudents.filter((student) => student.className === className);
}

export function saveFeedback(record) {
  const all = read();
  const payload = {
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...record,
  };
  all.unshift(payload);
  write(all);
  return payload;
}

export function loadFeedbackByStudent(studentId) {
  return read().filter((item) => item.studentId === studentId);
}

export function loadFeedbackForViewer(viewerRole) {
  const all = read();
  if (viewerRole === 'student' || viewerRole === 'parent') {
    return all;
  }
  return all;
}

export function getFeedbackStats() {
  const all = read();
  const byStudent = all.reduce((acc, item) => {
    acc[item.studentId] = (acc[item.studentId] || 0) + 1;
    return acc;
  }, {});
  return {
    total: all.length,
    studentsWithFeedback: Object.keys(byStudent).length,
  };
}
