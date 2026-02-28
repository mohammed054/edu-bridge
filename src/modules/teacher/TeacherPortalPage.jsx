import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  confirmTeacherGradeImport,
  createTeacherAnnouncement,
  createTeacherHomework,
  deleteTeacherAnnouncement,
  deleteTeacherHomework,
  fetchStudentProfile,
  fetchTeacherDashboardInsights,
  fetchTeacherExams,
  generateTeacherFeedbackDraft,
  generateTeacherTermComment,
  previewTeacherGradeImport,
  updateTeacherAnnouncement,
  updateTeacherExamMark,
  updateTeacherHomework,
  updateTeacherHomeworkAssignment,
} from '../../api/api';
import { useAuth } from '../../core/auth/useAuth';
import { toUserMessage } from '../../utils/error';
import ActivityList from './components/ActivityList';
import ClassCard from './components/ClassCard';
import ClassWorkspace from './components/ClassWorkspace';
import EmptyState from './components/EmptyState';
import ModalComponent from './components/ModalComponent';
import QuickActions from './components/QuickActions';
import TeacherHeader from './components/TeacherHeader';
import {
  formatEnglishDate,
  formatEnglishDateTime,
  formatEnglishNumber,
  resolveAvatar,
} from './utils/format';
import './teacherPortal.css';

/* ─── Page IDs ─────────────────────────────────────────────── */
const PAGES = {
  dashboard: 'dashboard',
  classes:   'classes',
  snapshots: 'snapshots',
  analysis:  'analysis',
  actions:   'actions',
};

/* ─── Nav config ────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: PAGES.dashboard,
    label: 'لوحة التحكم',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
        <path d="M1 9.5V16a1 1 0 001 1h4.5v-4.5h5V17H16a1 1 0 001-1V9.5L9 2 1 9.5z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: PAGES.classes,
    label: 'الفصول الدراسية',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
        <rect x="1.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 4V2M12.5 4V2M1.5 8h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: PAGES.snapshots,
    label: 'متابعة الطلاب',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
        <circle cx="7" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 16c0-2.76 2.24-4.5 5-4.5s5 1.74 5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M12.5 7.5a2.5 2.5 0 010 5M14.5 16c0-1.8-.8-3.2-2-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: PAGES.analysis,
    label: 'تحليل الصف',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
        <path d="M2 14l3.5-4.5L8 12l4-6 2.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: PAGES.actions,
    label: 'إجراءات سريعة',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
        <path d="M9 1v3M9 14v3M1 9h3M14 9h3M3.22 3.22l2.12 2.12M12.66 12.66l2.12 2.12M3.22 14.78l2.12-2.12M12.66 5.34l2.12-2.12"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

/* ─── Risk badge ─────────────────────────────────────────────── */
function RiskBadge({ risk }) {
  const styles = {
    high:   { label: 'خطر',    bg: '#fee2e2', color: '#b91c1c' },
    medium: { label: 'متوسط', bg: '#fef3c7', color: '#92400e' },
    low:    { label: 'منخفض', bg: '#dcf5e9', color: '#146f3e' },
  };
  const s = styles[risk] || { label: risk || '—', bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
      borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

/* ─── Page section header ────────────────────────────────────── */
function SectionHeading({ title, subtitle }) {
  return (
    <div className="ht-section-heading">
      <h2 className="ht-section-title">{title}</h2>
      {subtitle && <p className="ht-section-subtitle">{subtitle}</p>}
    </div>
  );
}

/* ─── KPI stat card ──────────────────────────────────────────── */
function StatCard({ label, value, accent = '#2a4799', bg = '#f0f4fd', icon }) {
  return (
    <article className="ht-stat-card" style={{ '--accent': accent, '--bg': bg }}>
      <div className="ht-stat-icon" style={{ background: bg, color: accent }}>{icon}</div>
      <p className="ht-stat-value" style={{ color: accent }}>{value}</p>
      <p className="ht-stat-label">{label}</p>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────
   FORM DEFAULTS  (unchanged from original)
────────────────────────────────────────────────────────────── */
const DEFAULT_POST_FORM = { title: '', body: '', attachmentName: '' };
const DEFAULT_HOMEWORK_FORM = { title: '', description: '', dueDate: '', maxMarks: '100', attachmentName: '' };
const DEFAULT_GRADE_FORM = { studentId: '', examTitle: '', score: '', maxMarks: '100' };
const DEFAULT_ASSIGNMENT_FORM = { studentId: '', status: 'pending', score: '', teacherComment: '' };
const DEFAULT_GRADE_IMPORT_FORM = { examTitle: '', defaultMaxMarks: '100', sourceType: 'image', fileName: '', fileDataUrl: '', ocrText: '' };
const DEFAULT_AI_DRAFTS = { tone: 'neutral', loading: false, error: '', feedback: null, termComment: null };
const statusLabelMap = { pending: 'قيد الانتظار', submitted: 'مسلّم', graded: 'مكتمل' };

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الملف.'));
    reader.readAsDataURL(file);
  });

/* ══════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════ */
export default function TeacherPortalPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  /* ── State ── */
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  const [classes,       setClasses]       = useState([]);
  const [homework,      setHomework]      = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [subject,       setSubject]       = useState('');
  const [insights,      setInsights]      = useState({
    pendingResponses: 0, flaggedParents: 0, repeatedIncidents: 0,
    weeklySnapshots: [], classAnalysis: [],
  });

  /* page nav */
  const [activePage,      setActivePage]      = useState(PAGES.dashboard);
  const [activeClassName, setActiveClassName] = useState('');
  const [activeTab,       setActiveTab]       = useState('posts');
  const [showAllActivity, setShowAllActivity] = useState(false);

  /* modals */
  const [postModal,           setPostModal]           = useState({ open: false, mode: 'create', post: null });
  const [postForm,            setPostForm]            = useState(DEFAULT_POST_FORM);
  const [homeworkModal,       setHomeworkModal]       = useState({ open: false, mode: 'create', item: null });
  const [homeworkForm,        setHomeworkForm]        = useState(DEFAULT_HOMEWORK_FORM);
  const [gradeModal,          setGradeModal]          = useState({ open: false, row: null });
  const [gradeForm,           setGradeForm]           = useState(DEFAULT_GRADE_FORM);
  const [homeworkDetailModal, setHomeworkDetailModal] = useState({ open: false, item: null });
  const [assignmentForm,      setAssignmentForm]      = useState(DEFAULT_ASSIGNMENT_FORM);
  const [studentModal,        setStudentModal]        = useState({ open: false, student: null, profile: null, loading: false, error: '' });
  const [utilityModal,        setUtilityModal]        = useState({ open: false, title: '', kind: '' });
  const [gradeImportModal,    setGradeImportModal]    = useState({ open: false, stage: 'upload', loading: false, preview: null, rows: [] });
  const [gradeImportForm,     setGradeImportForm]     = useState(DEFAULT_GRADE_IMPORT_FORM);
  const [aiDrafts,            setAiDrafts]            = useState(DEFAULT_AI_DRAFTS);

  /* ── Data loading ── */
  const loadPortalData = async () => {
    try {
      setLoading(true); setError('');
      const [payload, insightsPayload] = await Promise.all([
        fetchTeacherExams(token),
        fetchTeacherDashboardInsights(token),
      ]);
      const nextClasses = payload.classes || [];
      setClasses(nextClasses);
      setHomework(payload.homework || []);
      setAnnouncements(payload.announcements || []);
      setSubject(payload.subjects?.[0] || user?.subjects?.[0] || user?.subject || '');
      setInsights({
        pendingResponses:  Number(insightsPayload?.pendingResponses  || 0),
        flaggedParents:    Number(insightsPayload?.flaggedParents    || 0),
        repeatedIncidents: Number(insightsPayload?.repeatedIncidents || 0),
        weeklySnapshots:   Array.isArray(insightsPayload?.weeklySnapshots) ? insightsPayload.weeklySnapshots : [],
        classAnalysis:     Array.isArray(insightsPayload?.classAnalysis)   ? insightsPayload.classAnalysis   : [],
      });
    } catch (e) {
      setError(toUserMessage(e, 'تعذر تحميل بيانات المعلم.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPortalData(); }, [token]); // eslint-disable-line

  useEffect(() => {
    if (!activeClassName) return;
    if (!classes.some((c) => c.name === activeClassName)) {
      setActiveClassName(''); setActiveTab('posts');
    }
  }, [classes, activeClassName]);

  /* ── Computed ── */
  const activeClass = useMemo(
    () => classes.find((c) => c.name === activeClassName) || null,
    [classes, activeClassName]
  );

  const teacherAvatar = useMemo(
    () => user?.profilePicture || user?.avatarUrl || resolveAvatar(user || {}),
    [user]
  );

  const allActivity = useMemo(() => {
    const a = announcements.map((i) => ({ id: `ann-${i.id}`,  className: i.className, type: 'إعلان', title: i.title, date: i.updatedAt || i.createdAt }));
    const h = homework.map((i)      => ({ id: `hw-${i.id}`,   className: i.className, type: 'واجب',  title: i.title, date: i.updatedAt || i.createdAt }));
    const g = classes.flatMap((cls) => (cls.students || []).flatMap((s) =>
      (s.examMarks || []).map((m) => ({
        id: `grade-${cls.name}-${s.id}-${m.subject}`,
        className: cls.name, type: 'تقييم',
        title: `${s.name} - ${m.examTitle || m.subject || 'تقييم'}`,
        date: m.updatedAt,
      }))
    ));
    return [...a, ...h, ...g].filter((i) => i.date).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [announcements, homework, classes]);

  const dashboardActivity  = useMemo(() => (showAllActivity ? allActivity : allActivity.slice(0, 8)), [allActivity, showAllActivity]);
  const classAnnouncements = useMemo(() => announcements.filter((i) => i.className === activeClassName), [announcements, activeClassName]);
  const classHomework      = useMemo(() => homework.filter((i) => i.className === activeClassName), [homework, activeClassName]);

  const classGrades = useMemo(() => {
    return (activeClass?.students || []).map((s) => {
      const mark = (s.examMarks || []).find((m) => String(m.subject || '').toLowerCase() === String(subject || '').toLowerCase());
      return {
        studentId: s.id, studentName: s.name,
        examTitle: mark?.examTitle || '',
        score:    mark?.rawScore == null ? (mark?.score ?? null) : Number(mark.rawScore),
        maxMarks: mark?.maxMarks == null ? (mark?.score == null ? null : 100) : Number(mark.maxMarks),
        updatedAt: mark?.updatedAt || null,
      };
    });
  }, [activeClass, subject]);

  const classStudents = useMemo(() => {
    return (activeClass?.students || []).map((s) => {
      const assignments = classHomework.flatMap((i) => i.assignments.filter((a) => a.studentId === s.id));
      let status = 'منتظم';
      if (assignments.some((a) => a.status === 'pending'))        status = 'متابعة';
      else if (assignments.some((a) => a.status === 'submitted')) status = 'بانتظار التقييم';
      else if (assignments.length && assignments.every((a) => a.status === 'graded')) status = 'مكتمل';
      return { id: s.id, name: s.name, email: s.email || '', avatarUrl: resolveAvatar(s), status };
    });
  }, [activeClass, classHomework]);

  const classSummary = useMemo(() => {
    const scored = classGrades.filter((r) => r.score != null);
    const averageGrade = scored.length
      ? scored.reduce((sum, r) => sum + (Number(r.score || 0) / (Number(r.maxMarks || 100) || 100)) * 100, 0) / scored.length : 0;
    return { studentCount: activeClass?.students?.length || 0, homeworkCount: classHomework.length, averageGrade, announcementCount: classAnnouncements.length };
  }, [activeClass, classHomework, classAnnouncements, classGrades]);

  const recentSubmissions = useMemo(() =>
    classHomework.flatMap((i) =>
      i.assignments.filter((a) => a.status === 'submitted' || a.status === 'graded')
        .map((a) => ({ id: `${i.id}-${a.studentId}`, studentName: a.studentName, homeworkTitle: i.title, status: a.status, updatedAt: a.updatedAt }))
    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8),
    [classHomework]
  );

  /* ── Helpers ── */
  const resetFeedback = () => { setError(''); setSuccess(''); };
  const handleLogout  = () => { logout(); navigate('/login', { replace: true }); };
  const openNotifications = () => setUtilityModal({ open: true, title: 'الإشعارات', kind: 'notifications' });
  const openSettings      = () => setUtilityModal({ open: true, title: 'الإعدادات',  kind: 'settings' });

  /* ── Post handlers ── */
  const openPostCreateModal = () => { resetFeedback(); setPostModal({ open: true, mode: 'create', post: null }); setPostForm(DEFAULT_POST_FORM); };
  const openPostEditModal   = (post) => { resetFeedback(); setPostModal({ open: true, mode: 'edit', post }); setPostForm({ title: post.title || '', body: post.body || '', attachmentName: post.attachmentName || '' }); };
  const savePost = async () => {
    if (!activeClassName) return;
    if (!postForm.title.trim()) { setError('عنوان الإعلان مطلوب.'); return; }
    try {
      setSubmitting(true); setError('');
      if (postModal.mode === 'edit' && postModal.post) {
        await updateTeacherAnnouncement(token, postModal.post.id, { title: postForm.title.trim(), body: postForm.body.trim(), attachmentName: postForm.attachmentName.trim() });
        setSuccess('تم تحديث الإعلان.');
      } else {
        await createTeacherAnnouncement(token, { className: activeClassName, subject, title: postForm.title.trim(), body: postForm.body.trim(), attachmentName: postForm.attachmentName.trim() });
        setSuccess('تم إنشاء الإعلان.');
      }
      setPostModal({ open: false, mode: 'create', post: null }); setPostForm(DEFAULT_POST_FORM); await loadPortalData();
    } catch (e) { setError(toUserMessage(e, 'تعذر حفظ الإعلان.')); } finally { setSubmitting(false); }
  };
  const handleDeletePost = async (post) => {
    if (!window.confirm('هل ترغب في حذف هذا الإعلان؟')) return;
    try { setSubmitting(true); setError(''); await deleteTeacherAnnouncement(token, post.id); setSuccess('تم حذف الإعلان.'); await loadPortalData(); }
    catch (e) { setError(toUserMessage(e, 'تعذر حذف الإعلان.')); } finally { setSubmitting(false); }
  };

  /* ── Homework handlers ── */
  const openHomeworkCreateModal = () => { resetFeedback(); setHomeworkModal({ open: true, mode: 'create', item: null }); setHomeworkForm(DEFAULT_HOMEWORK_FORM); };
  const openHomeworkEditModal   = (item) => { resetFeedback(); setHomeworkModal({ open: true, mode: 'edit', item }); setHomeworkForm({ title: item.title || '', description: item.description || '', dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '', maxMarks: String(item.maxMarks || 100), attachmentName: item.attachmentName || '' }); };
  const saveHomework = async () => {
    if (!activeClassName) return;
    const title = homeworkForm.title.trim(); const maxMarks = Number(homeworkForm.maxMarks);
    if (!title) { setError('عنوان الواجب مطلوب.'); return; }
    if (Number.isNaN(maxMarks) || maxMarks <= 0) { setError('الدرجة الكاملة غير صحيحة.'); return; }
    try {
      setSubmitting(true); setError('');
      const payload = { title, description: homeworkForm.description.trim(), dueDate: homeworkForm.dueDate || null, maxMarks, attachmentName: homeworkForm.attachmentName.trim() };
      if (homeworkModal.mode === 'edit' && homeworkModal.item) { await updateTeacherHomework(token, homeworkModal.item.id, payload); setSuccess('تم تحديث الواجب.'); }
      else { await createTeacherHomework(token, { className: activeClassName, subject, ...payload }); setSuccess('تم إنشاء الواجب.'); }
      setHomeworkModal({ open: false, mode: 'create', item: null }); setHomeworkForm(DEFAULT_HOMEWORK_FORM); await loadPortalData();
    } catch (e) { setError(toUserMessage(e, 'تعذر حفظ الواجب.')); } finally { setSubmitting(false); }
  };
  const handleDeleteHomework = async (item) => {
    if (!window.confirm('هل ترغب في حذف هذا الواجب؟')) return;
    try { setSubmitting(true); setError(''); await deleteTeacherHomework(token, item.id); setSuccess('تم حذف الواجب.'); await loadPortalData(); }
    catch (e) { setError(toUserMessage(e, 'تعذر حذف الواجب.')); } finally { setSubmitting(false); }
  };
  const openHomeworkDetail = (item) => {
    const first = item.assignments?.[0];
    setHomeworkDetailModal({ open: true, item });
    setAssignmentForm({ studentId: first?.studentId || '', status: first?.status || 'pending', score: first?.score == null ? '' : String(first.score), teacherComment: first?.teacherComment || '' });
  };
  const selectedHomeworkAssignment = useMemo(() => {
    const item = homeworkDetailModal.item;
    if (!item || !assignmentForm.studentId) return null;
    return item.assignments.find((a) => a.studentId === assignmentForm.studentId) || null;
  }, [homeworkDetailModal.item, assignmentForm.studentId]);
  const syncAssignmentForm = (studentId) => {
    const a = homeworkDetailModal.item?.assignments.find((e) => e.studentId === studentId);
    if (!a) return;
    setAssignmentForm({ studentId, status: a.status || 'pending', score: a.score == null ? '' : String(a.score), teacherComment: a.teacherComment || '' });
  };
  const saveAssignmentUpdate = async () => {
    const item = homeworkDetailModal.item;
    if (!item || !assignmentForm.studentId) return;
    const nextScore = assignmentForm.score === '' ? null : Number(assignmentForm.score);
    if (nextScore !== null && Number.isNaN(nextScore)) { setError('درجة الواجب غير صحيحة.'); return; }
    try {
      setSubmitting(true); setError('');
      await updateTeacherHomeworkAssignment(token, item.id, { studentId: assignmentForm.studentId, status: assignmentForm.status, score: nextScore, teacherComment: assignmentForm.teacherComment });
      setSuccess('تم تحديث تسليم الطالب.'); await loadPortalData();
      setHomeworkDetailModal({ open: false, item: null }); setAssignmentForm(DEFAULT_ASSIGNMENT_FORM);
    } catch (e) { setError(toUserMessage(e, 'تعذر تحديث تسليم الطالب.')); } finally { setSubmitting(false); }
  };

  /* ── Grade handlers ── */
  const openGradeModal = (row = null) => {
    resetFeedback();
    setGradeModal({ open: true, row });
    setGradeForm({ studentId: row?.studentId || activeClass?.students?.[0]?.id || '', examTitle: row?.examTitle || '', score: row?.score == null ? '' : String(row.score), maxMarks: row?.maxMarks == null ? '100' : String(row.maxMarks) });
  };
  const saveGrade = async () => {
    if (!gradeForm.studentId) { setError('اختيار الطالب مطلوب.'); return; }
    const score = Number(gradeForm.score); const maxMarks = Number(gradeForm.maxMarks);
    if (Number.isNaN(score) || Number.isNaN(maxMarks) || maxMarks <= 0) { setError('بيانات الدرجة غير صحيحة.'); return; }
    try {
      setSubmitting(true); setError('');
      await updateTeacherExamMark(token, { studentId: gradeForm.studentId, subject, examTitle: gradeForm.examTitle.trim() || 'تقييم', score, maxMarks });
      setSuccess('تم حفظ الدرجة.'); setGradeModal({ open: false, row: null }); setGradeForm(DEFAULT_GRADE_FORM); await loadPortalData();
    } catch (e) { setError(toUserMessage(e, 'تعذر حفظ الدرجة.')); } finally { setSubmitting(false); }
  };

  /* ── Student profile ── */
  const openStudentProfile = async (student) => {
    setAiDrafts(DEFAULT_AI_DRAFTS);
    setStudentModal({ open: true, student, profile: null, loading: true, error: '' });
    try {
      const payload = await fetchStudentProfile(token, student.id, { subject });
      setStudentModal({ open: true, student, profile: payload, loading: false, error: '' });
    } catch (e) {
      setStudentModal({ open: true, student, profile: null, loading: false, error: toUserMessage(e, 'تعذر تحميل ملف الطالب.') });
    }
  };

  /* ── Navigate to classes page and trigger an action ── */
  const openClassAndAction = (tab, action) => {
    const nextClass = activeClassName || classes[0]?.name || '';
    if (!nextClass) return;
    setActivePage(PAGES.classes);
    setActiveClassName(nextClass);
    setActiveTab(tab);
    if      (action === 'post')         openPostCreateModal();
    else if (action === 'homework')     openHomeworkCreateModal();
    else if (action === 'grade')        openGradeModal();
    else if (action === 'grade-import') openGradeImportModal(nextClass);
  };

  /* ── Grade import ── */
  const openGradeImportModal = (preferredClass = '') => {
    const nextClass = preferredClass || activeClassName || classes[0]?.name || '';
    if (!nextClass) { setError('لا يمكن بدء الاستيراد بدون فصل محدد.'); return; }
    setActiveClassName(nextClass);
    setGradeImportForm({ ...DEFAULT_GRADE_IMPORT_FORM, examTitle: gradeForm.examTitle || '' });
    setGradeImportModal({ open: true, stage: 'upload', loading: false, preview: null, rows: [] });
  };
  const closeGradeImportModal = () => {
    setGradeImportModal({ open: false, stage: 'upload', loading: false, preview: null, rows: [] });
    setGradeImportForm(DEFAULT_GRADE_IMPORT_FORM);
  };
  const handleGradeImportFileSelect = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const fileDataUrl = await readFileAsDataUrl(file); setGradeImportForm((s) => ({ ...s, fileName: file.name || '', fileDataUrl, sourceType: file.type?.includes('pdf') ? 'pdf' : 'image' })); }
    catch (e) { setError(toUserMessage(e, 'تعذر قراءة الملف.')); }
  };
  const runGradeImportPreview = async () => {
    if (!activeClassName) { setError('اختيار الفصل مطلوب.'); return; }
    if (!gradeImportForm.fileDataUrl && !gradeImportForm.ocrText.trim()) { setError('ارفع صورة/ملف أو أضف نص OCR قبل التحليل.'); return; }
    try {
      setGradeImportModal((s) => ({ ...s, loading: true })); setError('');
      const preview = await previewTeacherGradeImport(token, { className: activeClassName, subject, examTitle: gradeImportForm.examTitle.trim() || gradeForm.examTitle.trim() || 'Assessment', defaultMaxMarks: Number(gradeImportForm.defaultMaxMarks || 100), sourceType: gradeImportForm.sourceType, fileDataUrl: gradeImportForm.fileDataUrl, ocrText: gradeImportForm.ocrText.trim() });
      setGradeImportModal((s) => ({ ...s, loading: false, stage: 'preview', preview, rows: (preview?.detectedRows || []).map((r) => ({ ...r, skip: Boolean(r.skip), confirmOverwrite: Boolean(r.confirmOverwrite), examTitle: r.examTitle || gradeImportForm.examTitle.trim() || 'Assessment' })) }));
    } catch (e) { setGradeImportModal((s) => ({ ...s, loading: false })); setError(toUserMessage(e, 'تعذر تحليل كشف الدرجات.')); }
  };
  const updateGradeImportRow = (rowIndex, patch) =>
    setGradeImportModal((s) => ({ ...s, rows: s.rows.map((r) => (r.rowIndex === rowIndex ? { ...r, ...patch } : r)) }));
  const confirmGradeImport = async () => {
    if (!gradeImportModal.rows.length) { setError('لا توجد بيانات للاستيراد.'); return; }
    try {
      setGradeImportModal((s) => ({ ...s, loading: true })); setError('');
      const response = await confirmTeacherGradeImport(token, { className: activeClassName, subject, examTitle: gradeImportForm.examTitle.trim() || 'Assessment', confirmImport: true, rows: gradeImportModal.rows.map((r) => ({ rowIndex: r.rowIndex, sourceStudentName: r.sourceStudentName, matchedStudentId: r.matchedStudentId || '', score: r.score, maxMarks: r.maxMarks, examTitle: r.examTitle, skip: r.skip === true, confirmOverwrite: r.confirmOverwrite === true })) });
      setSuccess(`تم الاستيراد: ${formatEnglishNumber(response.importedCount)} سجل، تم التجاوز: ${formatEnglishNumber(response.skippedCount)}.`);
      closeGradeImportModal(); await loadPortalData();
    } catch (e) { setGradeImportModal((s) => ({ ...s, loading: false })); setError(toUserMessage(e, 'تعذر تنفيذ الاستيراد.')); }
  };

  /* ── AI drafts ── */
  const generateStudentAiFeedbackDraft = async () => {
    if (!studentModal.student) return;
    try {
      setAiDrafts((s) => ({ ...s, loading: true, error: '' }));
      const payload = await generateTeacherFeedbackDraft(token, studentModal.student.id, { subject, tone: aiDrafts.tone });
      setAiDrafts((s) => ({ ...s, loading: false, feedback: payload?.draft || null }));
    } catch (e) { setAiDrafts((s) => ({ ...s, loading: false, error: toUserMessage(e, 'تعذر توليد المسودة الذكية.') })); }
  };
  const generateStudentAiTermComment = async () => {
    if (!studentModal.student) return;
    try {
      setAiDrafts((s) => ({ ...s, loading: true, error: '' }));
      const payload = await generateTeacherTermComment(token, studentModal.student.id, { subject, tone: aiDrafts.tone, termLabel: 'Current Term' });
      setAiDrafts((s) => ({ ...s, loading: false, termComment: payload?.comment || null }));
    } catch (e) { setAiDrafts((s) => ({ ...s, loading: false, error: toUserMessage(e, 'تعذر توليد تعليق التقرير.') })); }
  };

  /* ── Page change ── */
  const handlePageChange = (page) => {
    if (page !== PAGES.classes) { setActiveClassName(''); setActiveTab('posts'); }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ════════════════════════════════════════════════════════════
     PAGE RENDERS
  ════════════════════════════════════════════════════════════ */

  /* ── Dashboard ── */
  const renderDashboard = () => (
    <div className="ht-page-body">
      <SectionHeading title="لوحة التحكم" subtitle="نظرة عامة فورية على نشاط الفصول" />

      <div className="ht-stats-row">
        <StatCard label="ردود معلّقة"              value={formatEnglishNumber(insights.pendingResponses)}  accent="#2a4799" bg="#f0f4fd" icon="📨" />
        <StatCard label="أولياء أمور بحاجة متابعة" value={formatEnglishNumber(insights.flaggedParents)}    accent="#92400e" bg="#fef3c7" icon="⚑" />
        <StatCard label="حوادث متكررة"              value={formatEnglishNumber(insights.repeatedIncidents)} accent="#b91c1c" bg="#fee2e2" icon="⚠" />
        <StatCard label="الفصول المُسندة"           value={formatEnglishNumber(classes.length)}             accent="#146f3e" bg="#dcf5e9" icon="🏫" />
      </div>

      <ActivityList items={dashboardActivity} onViewAll={() => setShowAllActivity((v) => !v)} />
    </div>
  );

  /* ── Classes ── */
  const renderClasses = () => {
    if (activeClass) {
      return (
        <div className="ht-page-body">
          <button
            type="button"
            onClick={() => { setActiveClassName(''); setActiveTab('posts'); }}
            className="ht-back-btn ht-interactive"
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M10 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            العودة إلى الفصول
          </button>

          <ClassWorkspace
            className={activeClass.name}
            studentCount={activeClass.students.length}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            posts={classAnnouncements}
            homework={classHomework}
            grades={classGrades}
            students={classStudents}
            summary={classSummary}
            recentSubmissions={recentSubmissions}
            onCreatePost={openPostCreateModal}
            onEditPost={openPostEditModal}
            onDeletePost={handleDeletePost}
            onCreateHomework={openHomeworkCreateModal}
            onEditHomework={openHomeworkEditModal}
            onDeleteHomework={handleDeleteHomework}
            onOpenHomeworkDetail={openHomeworkDetail}
            onAddGrade={() => openGradeModal()}
            onImportGrade={() => openGradeImportModal(activeClass.name)}
            onEditGrade={(row) => openGradeModal(row)}
            onViewStudent={(s) => openStudentProfile(s)}
          />
        </div>
      );
    }

    return (
      <div className="ht-page-body">
        <SectionHeading
          title="الفصول الدراسية"
          subtitle={classes.length ? `${formatEnglishNumber(classes.length)} فصل مُسنَد إليك — اختر فصلاً للبدء` : 'لا توجد فصول مُسندة حالياً'}
        />
        {!classes.length ? (
          <EmptyState message="لا توجد فصول مُسندة حالياً" />
        ) : (
          <div className="ht-class-grid">
            {classes.map((cls) => (
              <ClassCard
                key={cls.name}
                className={cls.name}
                studentCount={cls.students.length}
                onClick={() => { setActiveClassName(cls.name); setActiveTab('posts'); }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Weekly snapshots ── */
  const renderSnapshots = () => (
    <div className="ht-page-body">
      <SectionHeading
        title="متابعة الطلاب"
        subtitle={`الملخص الأسبوعي — ${formatEnglishNumber(insights.weeklySnapshots?.length || 0)} طالب`}
      />

      {!(insights.weeklySnapshots || []).length ? (
        <EmptyState message="لا توجد بيانات كافية لبناء الملخص الأسبوعي." />
      ) : (
        <div className="ht-snapshot-grid">
          {insights.weeklySnapshots.map((snap) => (
            <article key={`${snap.studentId}-${snap.className}`} className="ht-surface ht-snapshot-card">
              <div className="ht-snap-top">
                <div className="ht-snap-avatar">{(snap.studentName || '؟')[0]}</div>
                <div className="ht-snap-info">
                  <p className="ht-snap-name">{snap.studentName}</p>
                  <p className="ht-snap-class">{snap.className || '—'}</p>
                </div>
                <RiskBadge risk={snap.riskStatus} />
              </div>

              <div className="ht-snap-divider" />

              <dl className="ht-snap-dl">
                {snap.academicDirection && <>
                  <dt>الاتجاه الأكاديمي</dt>
                  <dd>{snap.academicDirection}</dd>
                </>}
                {snap.attendancePattern && <>
                  <dt>الحضور</dt>
                  <dd>{snap.attendancePattern}</dd>
                </>}
                {snap.behaviorNote && <>
                  <dt>السلوك</dt>
                  <dd>{snap.behaviorNote}</dd>
                </>}
                {snap.parentEngagementStatus && <>
                  <dt>ولي الأمر</dt>
                  <dd>{snap.parentEngagementStatus}</dd>
                </>}
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Class analysis ── */
  const renderAnalysis = () => (
    <div className="ht-page-body">
      <SectionHeading
        title="تحليل الصف الذكي"
        subtitle="تنبيهات واقتراحات مبنية على بيانات الفصول"
      />

      {!(insights.classAnalysis || []).length ? (
        <EmptyState message="لا توجد تنبيهات تحليلية هذا الأسبوع." />
      ) : (
        <div className="ht-analysis-list">
          {insights.classAnalysis.map((item, i) => (
            <article key={`${item.type}-${item.className}-${i}`} className="ht-surface ht-analysis-card">
              <div className="ht-analysis-bar" />
              <div className="ht-analysis-content">
                <div className="ht-analysis-tags">
                  {item.className && <span className="ht-tag ht-tag-class">{item.className}</span>}
                  {item.type      && <span className="ht-tag ht-tag-type">{item.type}</span>}
                </div>
                <p className="ht-analysis-message">{item.message}</p>
                {item.suggestion && (
                  <div className="ht-analysis-suggestion">
                    <span>💡</span>
                    <p>{item.suggestion}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Quick actions ── */
  const renderActions = () => (
    <div className="ht-page-body">
      <SectionHeading title="إجراءات سريعة" subtitle="اختصارات للمهام الشائعة في الفصول" />
      <QuickActions
        onPost={()         => openClassAndAction('posts',    'post')}
        onHomework={()     => openClassAndAction('homework', 'homework')}
        onGrade={()        => openClassAndAction('grades',   'grade')}
        onGradeImport={()  => openClassAndAction('grades',   'grade-import')}
        disabled={!classes.length}
      />
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     MAIN RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <main dir="rtl" className="ht-theme ht-app-root">
      <div className="ht-app-container">

        {/* ══ HEADER ══ */}
        <TeacherHeader
          teacherName={user?.name || ''}
          avatarUrl={teacherAvatar}
          subjectLabel={subject ? `المواد المكلف بها: ${subject}` : 'المواد المكلف بها'}
          onOpenNotifications={openNotifications}
          onOpenSettings={openSettings}
          onOpenSchedule={() => navigate('/teacher/schedule')}
          onLogout={handleLogout}
        />

        {/* ══ PAGE NAV BAR ══ */}
        <nav className="ht-page-nav" role="tablist" aria-label="صفحات البوابة">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activePage === id}
              onClick={() => handlePageChange(id)}
              className={`ht-nav-btn ht-interactive${activePage === id ? ' active' : ''}`}
            >
              <span className="ht-nav-btn-icon">{icon}</span>
              <span className="ht-nav-btn-label">{label}</span>
              {activePage === id && <span className="ht-nav-btn-indicator" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        {/* ══ BANNERS ══ */}
        {error   && <div className="ht-banner ht-banner-error">{error}</div>}
        {success && <div className="ht-banner ht-banner-success">{success}</div>}

        {/* ══ PAGE CONTENT ══ */}
        {loading ? (
          <div className="ht-loading-wrap">
            <div className="ht-loading-grid">
              {[200, 140, 300, 180, 260, 100].map((h, i) => (
                <div key={i} className="ht-loading-bone" style={{ height: h }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="ht-page-enter">
            {activePage === PAGES.dashboard && renderDashboard()}
            {activePage === PAGES.classes   && renderClasses()}
            {activePage === PAGES.snapshots && renderSnapshots()}
            {activePage === PAGES.analysis  && renderAnalysis()}
            {activePage === PAGES.actions   && renderActions()}
          </div>
        )}
      </div>

      {/* ══════════ MODALS (all logic unchanged) ══════════ */}

      {/* Post */}
      <ModalComponent open={postModal.open} onClose={() => setPostModal({ open: false, mode: 'create', post: null })} title={postModal.mode === 'edit' ? 'تعديل الإعلان' : 'نشر إعلان'} description="اكتب عنوان الإعلان وتفاصيله للفصل الحالي."
        footer={<><button type="button" onClick={() => setPostModal({ open: false, mode: 'create', post: null })} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]">إلغاء</button><button type="button" disabled={submitting} onClick={savePost} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60">{submitting ? 'جارٍ الحفظ...' : 'حفظ'}</button></>}>
        <div className="space-y-4">
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">العنوان</span><input type="text" value={postForm.title} onChange={(e) => setPostForm((s) => ({ ...s, title: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المحتوى</span><textarea value={postForm.body} onChange={(e) => setPostForm((s) => ({ ...s, body: e.target.value }))} className="min-h-[120px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[14px] leading-[1.8] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المرفق</span><input type="text" value={postForm.attachmentName} onChange={(e) => setPostForm((s) => ({ ...s, attachmentName: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
        </div>
      </ModalComponent>

      {/* Homework */}
      <ModalComponent open={homeworkModal.open} onClose={() => setHomeworkModal({ open: false, mode: 'create', item: null })} title={homeworkModal.mode === 'edit' ? 'تعديل الواجب' : 'إضافة واجب'} description="إدارة تفاصيل الواجب للفصل الحالي."
        footer={<><button type="button" onClick={() => setHomeworkModal({ open: false, mode: 'create', item: null })} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]">إلغاء</button><button type="button" disabled={submitting} onClick={saveHomework} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60">{submitting ? 'جارٍ الحفظ...' : 'حفظ'}</button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">عنوان الواجب</span><input type="text" value={homeworkForm.title} onChange={(e) => setHomeworkForm((s) => ({ ...s, title: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">تاريخ التسليم</span><input type="date" value={homeworkForm.dueDate} onChange={(e) => setHomeworkForm((s) => ({ ...s, dueDate: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">من</span><input type="number" min="1" value={homeworkForm.maxMarks} onChange={(e) => setHomeworkForm((s) => ({ ...s, maxMarks: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الوصف</span><textarea value={homeworkForm.description} onChange={(e) => setHomeworkForm((s) => ({ ...s, description: e.target.value }))} className="min-h-[100px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[14px] leading-[1.8] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المرفق</span><input type="text" value={homeworkForm.attachmentName} onChange={(e) => setHomeworkForm((s) => ({ ...s, attachmentName: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
        </div>
      </ModalComponent>

      {/* Grade */}
      <ModalComponent open={gradeModal.open} onClose={() => setGradeModal({ open: false, row: null })} title="إدخال درجات" description="إضافة أو تعديل تقييم الطالب."
        footer={<><button type="button" disabled={submitting} onClick={() => { setGradeModal({ open: false, row: null }); openGradeImportModal(activeClassName); }} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] disabled:opacity-60">استيراد بالذكاء الاصطناعي</button><button type="button" onClick={() => setGradeModal({ open: false, row: null })} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]">إلغاء</button><button type="button" disabled={submitting} onClick={saveGrade} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60">{submitting ? 'جارٍ الحفظ...' : 'حفظ'}</button></>}>
        <div className="space-y-4">
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الطالب</span><select value={gradeForm.studentId} onChange={(e) => setGradeForm((s) => ({ ...s, studentId: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"><option value="">اختر الطالب</option>{(activeClass?.students || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">التقييم</span><input type="text" value={gradeForm.examTitle} onChange={(e) => setGradeForm((s) => ({ ...s, examTitle: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الدرجة</span><input type="number" min="0" value={gradeForm.score} onChange={(e) => setGradeForm((s) => ({ ...s, score: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
            <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">من</span><input type="number" min="1" value={gradeForm.maxMarks} onChange={(e) => setGradeForm((s) => ({ ...s, maxMarks: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
          </div>
        </div>
      </ModalComponent>

      {/* Grade import */}
      <ModalComponent open={gradeImportModal.open} onClose={closeGradeImportModal} title="استيراد كشف درجات بالذكاء الاصطناعي" description="رفع صورة أو PDF أو نص OCR، ثم مراجعة النتائج وتأكيد الاستيراد يدوياً." size="xl"
        footer={<><button type="button" onClick={closeGradeImportModal} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]">إلغاء</button>{gradeImportModal.stage === 'upload' ? <button type="button" disabled={gradeImportModal.loading} onClick={runGradeImportPreview} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60">{gradeImportModal.loading ? 'جارٍ التحليل...' : 'تحليل'}</button> : <button type="button" disabled={gradeImportModal.loading} onClick={confirmGradeImport} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60">{gradeImportModal.loading ? 'جارٍ الاستيراد...' : 'تأكيد الاستيراد'}</button>}</>}>
        {gradeImportModal.stage === 'upload' ? (
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--ht-neutral-500)]">الفصل الحالي: {activeClassName || '-'} · المادة: {subject || '-'}</p>
            <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">ملف كشف الدرجات</span><input type="file" accept="image/*,application/pdf" onChange={handleGradeImportFileSelect} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] text-[var(--ht-neutral-700)]" />{gradeImportForm.fileName && <p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">{gradeImportForm.fileName}</p>}</label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">عنوان الاختبار</span><input type="text" value={gradeImportForm.examTitle} onChange={(e) => setGradeImportForm((s) => ({ ...s, examTitle: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none" /></label>
              <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الدرجة الكاملة الافتراضية</span><input type="number" min="1" value={gradeImportForm.defaultMaxMarks} onChange={(e) => setGradeImportForm((s) => ({ ...s, defaultMaxMarks: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none" /></label>
            </div>
            <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">نص OCR (اختياري)</span><textarea value={gradeImportForm.ocrText} onChange={(e) => setGradeImportForm((s) => ({ ...s, ocrText: e.target.value }))} className="min-h-[120px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none" placeholder="الصق نص OCR هنا إذا كان متوفراً." /></label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">{[['إجمالي الصفوف', gradeImportModal.preview?.summary?.totalRows], ['مطابقات ناجحة', gradeImportModal.preview?.summary?.matchedRows], ['أسماء غير معروفة', gradeImportModal.preview?.summary?.unrecognizedRows], ['صفوف تحتاج مراجعة', gradeImportModal.preview?.summary?.inconsistentRows]].map(([label, val]) => <article key={label} className="ht-soft-surface p-3"><p className="text-[11px] text-[var(--ht-neutral-500)]">{label}</p><p className="mt-1 text-[18px] font-semibold text-[var(--ht-neutral-900)]">{formatEnglishNumber(val || 0)}</p></article>)}</div>
            <div className="max-h-[420px] overflow-auto rounded-[4px] border border-[var(--ht-border-subtle)]">
              <table className="min-w-full border-collapse text-right">
                <thead className="bg-[var(--ht-bg-subtle)]"><tr>{['الاسم من الكشف','مطابقة الطالب','الدرجة','من','الاختبار','ملاحظات','تجاوز'].map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ht-neutral-500)]">{h}</th>)}</tr></thead>
                <tbody>{gradeImportModal.rows.map((row) => (
                  <tr key={row.rowIndex} className="border-t border-[var(--ht-border-subtle)]">
                    <td className="whitespace-nowrap px-3 py-2 text-[13px] text-[var(--ht-neutral-800)]">{row.sourceStudentName || `Row ${row.rowIndex + 1}`}</td>
                    <td className="px-3 py-2"><select value={row.matchedStudentId || ''} onChange={(e) => updateGradeImportRow(row.rowIndex, { matchedStudentId: e.target.value })} className="h-9 w-[210px] rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] text-[var(--ht-neutral-800)] outline-none"><option value="">Unrecognized</option>{(activeClass?.students || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></td>
                    <td className="px-3 py-2"><input type="number" value={row.score ?? ''} onChange={(e) => updateGradeImportRow(row.rowIndex, { score: e.target.value })} className="h-9 w-20 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] outline-none" /></td>
                    <td className="px-3 py-2"><input type="number" value={row.maxMarks ?? ''} onChange={(e) => updateGradeImportRow(row.rowIndex, { maxMarks: e.target.value })} className="h-9 w-20 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] outline-none" /></td>
                    <td className="px-3 py-2"><input type="text" value={row.examTitle || ''} onChange={(e) => updateGradeImportRow(row.rowIndex, { examTitle: e.target.value })} className="h-9 w-28 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] outline-none" /></td>
                    <td className="px-3 py-2 text-[11px] text-[var(--ht-neutral-500)]">{row.issues?.length ? row.issues.join(' / ') : '-'}{row.overwrite?.requiresOverwriteConfirmation ? <label className="mt-1 flex items-center gap-1 text-[11px] text-[var(--ht-danger-600)]"><input type="checkbox" checked={row.confirmOverwrite === true} onChange={(e) => updateGradeImportRow(row.rowIndex, { confirmOverwrite: e.target.checked })} /><span>تأكيد الاستبدال</span></label> : null}</td>
                    <td className="px-3 py-2 text-center"><input type="checkbox" checked={row.skip === true} onChange={(e) => updateGradeImportRow(row.rowIndex, { skip: e.target.checked })} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </ModalComponent>

      {/* Homework detail */}
      <ModalComponent open={homeworkDetailModal.open} onClose={() => setHomeworkDetailModal({ open: false, item: null })} title={homeworkDetailModal.item?.title || 'تفاصيل الواجب'} description="متابعة تسليمات الطلاب وتحديث الحالة." size="lg"
        footer={<><button type="button" onClick={() => setHomeworkDetailModal({ open: false, item: null })} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]">إغلاق</button><button type="button" disabled={submitting || !assignmentForm.studentId} onClick={saveAssignmentUpdate} className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60">{submitting ? 'جارٍ الحفظ...' : 'حفظ'}</button></>}>
        {homeworkDetailModal.item ? (
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--ht-neutral-500)]">التسليم: {formatEnglishDate(homeworkDetailModal.item.dueDate)}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الطالب</span><select value={assignmentForm.studentId} onChange={(e) => syncAssignmentForm(e.target.value)} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]">{(homeworkDetailModal.item.assignments || []).map((a) => <option key={a.studentId} value={a.studentId}>{a.studentName}</option>)}</select></label>
              <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الحالة</span><select value={assignmentForm.status} onChange={(e) => setAssignmentForm((s) => ({ ...s, status: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"><option value="pending">قيد الانتظار</option><option value="submitted">مسلّم</option><option value="graded">مكتمل</option></select></label>
              <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الدرجة</span><input type="number" min="0" max={homeworkDetailModal.item.maxMarks} value={assignmentForm.score} onChange={(e) => setAssignmentForm((s) => ({ ...s, score: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
              <label className="block"><span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">إضافة تعليق</span><input type="text" value={assignmentForm.teacherComment} onChange={(e) => setAssignmentForm((s) => ({ ...s, teacherComment: e.target.value }))} className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]" /></label>
            </div>
            <div className="ht-soft-surface p-4">
              <p className="text-[13px] text-[var(--ht-neutral-600)]">حالة التسليم الحالية: {statusLabelMap[selectedHomeworkAssignment?.status] || '-'}</p>
              <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">آخر تحديث: {formatEnglishDateTime(selectedHomeworkAssignment?.updatedAt)}</p>
              <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">عرض التسليم: {selectedHomeworkAssignment?.submissionAttachment || selectedHomeworkAssignment?.submissionText || 'لا يوجد تسليم'}</p>
            </div>
          </div>
        ) : null}
      </ModalComponent>

      {/* Student profile */}
      <ModalComponent open={studentModal.open} onClose={() => { setStudentModal({ open: false, student: null, profile: null, loading: false, error: '' }); setAiDrafts(DEFAULT_AI_DRAFTS); }} title={studentModal.student ? `ملف الطالب: ${studentModal.student.name}` : 'ملف الطالب'} description="نظرة عامة على الأداء والتسليمات الحديثة." size="lg">
        {studentModal.loading ? <p className="text-[14px] text-[var(--ht-neutral-500)]">جارٍ تحميل ملف الطالب...</p>
         : studentModal.error ? <p className="text-[14px] text-[var(--ht-danger-600)]">{studentModal.error}</p>
         : studentModal.profile ? (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2">
              {[['الاسم', studentModal.profile.student.name], ['البريد الإلكتروني', studentModal.profile.student.email || '-'], ['متوسط الدرجات', (() => { const marks = studentModal.profile.examMarks || []; if (!marks.length) return '0%'; const avg = marks.reduce((s, m) => s + (Number(m.rawScore ?? m.score ?? 0) / (Number(m.maxMarks || 100) || 100)) * 100, 0) / marks.length; return `${formatEnglishNumber(avg, 1)}%`; })()], ['آخر ملاحظة', studentModal.profile.feedbackReceived?.[0]?.content || '-']].map(([label, val]) => (
                <div key={label} className="ht-soft-surface p-4"><p className="text-[12px] text-[var(--ht-neutral-500)]">{label}</p><p className="mt-1 text-[16px] font-semibold text-[var(--ht-neutral-900)]">{val}</p></div>
              ))}
            </section>
            {studentModal.profile.weeklySnapshot && (
              <section className="ht-soft-surface p-4">
                <h4 className="text-[15px] font-semibold text-[var(--ht-neutral-900)]">AI Weekly Snapshot</h4>
                <p className="mt-2 text-[13px] text-[var(--ht-neutral-600)]">{studentModal.profile.weeklySnapshot.academicDirection} · {studentModal.profile.weeklySnapshot.riskStatus} risk</p>
                <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">{studentModal.profile.weeklySnapshot.attendancePattern}</p>
                <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">{studentModal.profile.weeklySnapshot.behaviorNote}</p>
                <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">Parent engagement: {studentModal.profile.weeklySnapshot.parentEngagementStatus}</p>
              </section>
            )}
            <section className="ht-soft-surface space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-semibold text-[var(--ht-neutral-900)]">AI Feedback Assistant</h4>
                <select value={aiDrafts.tone} onChange={(e) => setAiDrafts((s) => ({ ...s, tone: e.target.value }))} className="h-9 rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] text-[var(--ht-neutral-700)] outline-none"><option value="neutral">Neutral</option><option value="encouraging">Encouraging</option><option value="firm">Firm</option></select>
                <button type="button" disabled={aiDrafts.loading} onClick={generateStudentAiFeedbackDraft} className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] disabled:opacity-60">{aiDrafts.loading ? 'جارٍ التوليد...' : 'توليد ملخص للمعلم/ولي الأمر'}</button>
                <button type="button" disabled={aiDrafts.loading} onClick={generateStudentAiTermComment} className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] disabled:opacity-60">{aiDrafts.loading ? 'جارٍ التوليد...' : 'توليد تعليق التقرير'}</button>
              </div>
              {aiDrafts.error && <p className="text-[12px] text-[var(--ht-danger-600)]">{aiDrafts.error}</p>}
              {aiDrafts.feedback && (
                <div className="space-y-2">
                  <label className="block"><span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Teacher Internal Summary</span><textarea value={aiDrafts.feedback.teacherInternalSummary || ''} onChange={(e) => setAiDrafts((s) => ({ ...s, feedback: { ...s.feedback, teacherInternalSummary: e.target.value } }))} className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none" /></label>
                  <label className="block"><span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Parent Summary</span><textarea value={aiDrafts.feedback.parentSummary || ''} onChange={(e) => setAiDrafts((s) => ({ ...s, feedback: { ...s.feedback, parentSummary: e.target.value } }))} className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none" /></label>
                </div>
              )}
              {aiDrafts.termComment && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {[['Academic Comment','academicComment'],['Behavior Reflection','behaviorReflection'],['Attendance Note','attendanceNote'],['Improvement Recommendation','improvementRecommendation']].map(([label, key]) => (
                    <label key={key} className="block"><span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">{label}</span><textarea value={aiDrafts.termComment[key] || ''} onChange={(e) => setAiDrafts((s) => ({ ...s, termComment: { ...s.termComment, [key]: e.target.value } }))} className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none" /></label>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h4 className="mb-3 text-[16px] font-semibold text-[var(--ht-neutral-900)]">أحدث التسليمات</h4>
              <div className="space-y-2">{(studentModal.profile.homework || []).slice(0, 5).map((item) => <article key={item.id} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3"><p className="text-[14px] font-medium text-[var(--ht-neutral-800)]">{item.title}</p><p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">الحالة: {statusLabelMap[item.status] || item.status} · التاريخ: {formatEnglishDateTime(item.assignmentUpdatedAt)}</p></article>)}{!studentModal.profile.homework?.length && <p className="text-[13px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>}</div>
            </section>
            <section>
              <h4 className="mb-3 text-[16px] font-semibold text-[var(--ht-neutral-900)]">ملخص الدرجات</h4>
              <div className="space-y-2">{(studentModal.profile.examMarks || []).slice(0, 5).map((mark) => <article key={`${mark.subject}-${mark.updatedAt}`} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3"><p className="text-[14px] font-medium text-[var(--ht-neutral-800)]">{mark.examTitle || mark.subject}</p><p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">{formatEnglishNumber(mark.rawScore ?? mark.score, 2)} / {formatEnglishNumber(mark.maxMarks || 100, 2)}</p></article>)}{!studentModal.profile.examMarks?.length && <p className="text-[13px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>}</div>
            </section>
          </div>
        ) : <p className="text-[14px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>}
      </ModalComponent>

      {/* Utility */}
      <ModalComponent open={utilityModal.open} onClose={() => setUtilityModal({ open: false, title: '', kind: '' })} title={utilityModal.title}>
        {utilityModal.kind === 'notifications'
          ? <div className="space-y-2">{allActivity.slice(0, 8).map((item) => <article key={item.id} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3"><p className="text-[14px] font-medium text-[var(--ht-neutral-800)]">{item.title}</p><p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">{item.type} · {item.className} · {formatEnglishDateTime(item.date)}</p></article>)}{!allActivity.length && <p className="text-[14px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>}</div>
          : <p className="text-[14px] leading-[1.9] text-[var(--ht-neutral-600)]">لا يمكن للمعلم تعديل إعدادات النظام. هذه الصلاحية مخصصة للإدارة.</p>}
      </ModalComponent>

    </main>
  );
}
