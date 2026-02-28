
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

const DEFAULT_POST_FORM = {
  title: '',
  body: '',
  attachmentName: '',
};

const DEFAULT_HOMEWORK_FORM = {
  title: '',
  description: '',
  dueDate: '',
  maxMarks: '100',
  attachmentName: '',
};

const DEFAULT_GRADE_FORM = {
  studentId: '',
  examTitle: '',
  score: '',
  maxMarks: '100',
};

const DEFAULT_ASSIGNMENT_FORM = {
  studentId: '',
  status: 'pending',
  score: '',
  teacherComment: '',
};

const DEFAULT_GRADE_IMPORT_FORM = {
  examTitle: '',
  defaultMaxMarks: '100',
  sourceType: 'image',
  fileName: '',
  fileDataUrl: '',
  ocrText: '',
};

const DEFAULT_AI_DRAFTS = {
  tone: 'neutral',
  loading: false,
  error: '',
  feedback: null,
  termComment: null,
};

const statusLabelMap = {
  pending: 'قيد الانتظار',
  submitted: 'مسلّم',
  graded: 'مكتمل',
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الملف.'));
    reader.readAsDataURL(file);
  });

export default function TeacherPortalPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [classes, setClasses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [subject, setSubject] = useState('');
  const [insights, setInsights] = useState({
    pendingResponses: 0,
    flaggedParents: 0,
    repeatedIncidents: 0,
    weeklySnapshots: [],
    classAnalysis: [],
  });

  const [activeClassName, setActiveClassName] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [showAllActivity, setShowAllActivity] = useState(false);

  const [postModal, setPostModal] = useState({ open: false, mode: 'create', post: null });
  const [postForm, setPostForm] = useState(DEFAULT_POST_FORM);

  const [homeworkModal, setHomeworkModal] = useState({ open: false, mode: 'create', item: null });
  const [homeworkForm, setHomeworkForm] = useState(DEFAULT_HOMEWORK_FORM);

  const [gradeModal, setGradeModal] = useState({ open: false, row: null });
  const [gradeForm, setGradeForm] = useState(DEFAULT_GRADE_FORM);

  const [homeworkDetailModal, setHomeworkDetailModal] = useState({ open: false, item: null });
  const [assignmentForm, setAssignmentForm] = useState(DEFAULT_ASSIGNMENT_FORM);

  const [studentModal, setStudentModal] = useState({
    open: false,
    student: null,
    profile: null,
    loading: false,
    error: '',
  });
  const [utilityModal, setUtilityModal] = useState({
    open: false,
    title: '',
    kind: '',
  });

  const [gradeImportModal, setGradeImportModal] = useState({
    open: false,
    stage: 'upload',
    loading: false,
    preview: null,
    rows: [],
  });
  const [gradeImportForm, setGradeImportForm] = useState(DEFAULT_GRADE_IMPORT_FORM);
  const [aiDrafts, setAiDrafts] = useState(DEFAULT_AI_DRAFTS);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      setError('');
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
        pendingResponses: Number(insightsPayload?.pendingResponses || 0),
        flaggedParents: Number(insightsPayload?.flaggedParents || 0),
        repeatedIncidents: Number(insightsPayload?.repeatedIncidents || 0),
        weeklySnapshots: Array.isArray(insightsPayload?.weeklySnapshots)
          ? insightsPayload.weeklySnapshots
          : [],
        classAnalysis: Array.isArray(insightsPayload?.classAnalysis)
          ? insightsPayload.classAnalysis
          : [],
      });
    } catch (loadError) {
      setError(toUserMessage(loadError, 'تعذر تحميل بيانات المعلم.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!activeClassName) {
      return;
    }

    const hasClass = classes.some((classItem) => classItem.name === activeClassName);
    if (!hasClass) {
      setActiveClassName('');
      setActiveTab('posts');
    }
  }, [classes, activeClassName]);

  const activeClass = useMemo(
    () => classes.find((classItem) => classItem.name === activeClassName) || null,
    [classes, activeClassName]
  );

  const teacherAvatar = useMemo(() => {
    return user?.profilePicture || user?.avatarUrl || resolveAvatar(user || {});
  }, [user]);

  const allActivity = useMemo(() => {
    const announcementItems = announcements.map((item) => ({
      id: `announcement-${item.id}`,
      className: item.className,
      type: 'إعلان',
      title: item.title,
      date: item.updatedAt || item.createdAt,
    }));

    const homeworkItems = homework.map((item) => ({
      id: `homework-${item.id}`,
      className: item.className,
      type: 'واجب',
      title: item.title,
      date: item.updatedAt || item.createdAt,
    }));

    const gradeItems = classes.flatMap((classItem) =>
      (classItem.students || []).flatMap((student) =>
        (student.examMarks || []).map((mark) => ({
          id: `grade-${classItem.name}-${student.id}-${mark.subject}`,
          className: classItem.name,
          type: 'تقييم',
          title: `${student.name} - ${mark.examTitle || mark.subject || 'تقييم'}`,
          date: mark.updatedAt,
        }))
      )
    );

    return [...announcementItems, ...homeworkItems, ...gradeItems]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [announcements, homework, classes]);

  const dashboardActivity = useMemo(
    () => (showAllActivity ? allActivity : allActivity.slice(0, 8)),
    [allActivity, showAllActivity]
  );

  const classAnnouncements = useMemo(
    () => announcements.filter((item) => item.className === activeClassName),
    [announcements, activeClassName]
  );

  const classHomework = useMemo(
    () => homework.filter((item) => item.className === activeClassName),
    [homework, activeClassName]
  );

  const classGrades = useMemo(() => {
    const students = activeClass?.students || [];
    return students.map((student) => {
      const mark = (student.examMarks || []).find(
        (item) => String(item.subject || '').toLowerCase() === String(subject || '').toLowerCase()
      );

      return {
        studentId: student.id,
        studentName: student.name,
        examTitle: mark?.examTitle || '',
        score:
          mark?.rawScore === null || mark?.rawScore === undefined
            ? mark?.score ?? null
            : Number(mark.rawScore),
        maxMarks:
          mark?.maxMarks === null || mark?.maxMarks === undefined
            ? mark?.score === null || mark?.score === undefined
              ? null
              : 100
            : Number(mark.maxMarks),
        updatedAt: mark?.updatedAt || null,
      };
    });
  }, [activeClass, subject]);

  const classStudents = useMemo(() => {
    const students = activeClass?.students || [];
    return students.map((student) => {
      const assignments = classHomework.flatMap((item) =>
        item.assignments.filter((assignment) => assignment.studentId === student.id)
      );

      const hasPending = assignments.some((assignment) => assignment.status === 'pending');
      const hasSubmitted = assignments.some((assignment) => assignment.status === 'submitted');

      let status = 'منتظم';
      if (hasPending) {
        status = 'متابعة';
      } else if (hasSubmitted) {
        status = 'بانتظار التقييم';
      } else if (assignments.length && assignments.every((assignment) => assignment.status === 'graded')) {
        status = 'مكتمل';
      }

      return {
        id: student.id,
        name: student.name,
        email: student.email || '',
        avatarUrl: resolveAvatar(student),
        status,
      };
    });
  }, [activeClass, classHomework]);

  const classSummary = useMemo(() => {
    const scoredRows = classGrades.filter((row) => row.score !== null && row.score !== undefined);
    const averageGrade = scoredRows.length
      ? scoredRows.reduce((sum, row) => {
          const score = Number(row.score || 0);
          const maxMarks = Number(row.maxMarks || 100) || 100;
          return sum + (score / maxMarks) * 100;
        }, 0) / scoredRows.length
      : 0;

    return {
      studentCount: activeClass?.students?.length || 0,
      homeworkCount: classHomework.length,
      averageGrade,
      announcementCount: classAnnouncements.length,
    };
  }, [activeClass, classHomework, classAnnouncements, classGrades]);

  const recentSubmissions = useMemo(() => {
    return classHomework
      .flatMap((item) =>
        item.assignments
          .filter((assignment) => assignment.status === 'submitted' || assignment.status === 'graded')
          .map((assignment) => ({
            id: `${item.id}-${assignment.studentId}`,
            studentName: assignment.studentName,
            homeworkTitle: item.title,
            status: assignment.status,
            updatedAt: assignment.updatedAt,
          }))
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8);
  }, [classHomework]);

  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openNotifications = () => {
    setUtilityModal({
      open: true,
      title: 'الإشعارات',
      kind: 'notifications',
    });
  };

  const openSettings = () => {
    setUtilityModal({
      open: true,
      title: 'الإعدادات',
      kind: 'settings',
    });
  };

  const openPostCreateModal = () => {
    resetFeedback();
    setPostModal({ open: true, mode: 'create', post: null });
    setPostForm(DEFAULT_POST_FORM);
  };

  const openPostEditModal = (post) => {
    resetFeedback();
    setPostModal({ open: true, mode: 'edit', post });
    setPostForm({
      title: post.title || '',
      body: post.body || '',
      attachmentName: post.attachmentName || '',
    });
  };

  const savePost = async () => {
    if (!activeClassName) {
      return;
    }

    if (!postForm.title.trim()) {
      setError('عنوان الإعلان مطلوب.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (postModal.mode === 'edit' && postModal.post) {
        await updateTeacherAnnouncement(token, postModal.post.id, {
          title: postForm.title.trim(),
          body: postForm.body.trim(),
          attachmentName: postForm.attachmentName.trim(),
        });
        setSuccess('تم تحديث الإعلان.');
      } else {
        await createTeacherAnnouncement(token, {
          className: activeClassName,
          subject,
          title: postForm.title.trim(),
          body: postForm.body.trim(),
          attachmentName: postForm.attachmentName.trim(),
        });
        setSuccess('تم إنشاء الإعلان.');
      }

      setPostModal({ open: false, mode: 'create', post: null });
      setPostForm(DEFAULT_POST_FORM);
      await loadPortalData();
    } catch (saveError) {
      setError(toUserMessage(saveError, 'تعذر حفظ الإعلان.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (post) => {
    const confirmed = window.confirm('هل ترغب في حذف هذا الإعلان؟');
    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await deleteTeacherAnnouncement(token, post.id);
      setSuccess('تم حذف الإعلان.');
      await loadPortalData();
    } catch (deleteError) {
      setError(toUserMessage(deleteError, 'تعذر حذف الإعلان.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openHomeworkCreateModal = () => {
    resetFeedback();
    setHomeworkModal({ open: true, mode: 'create', item: null });
    setHomeworkForm(DEFAULT_HOMEWORK_FORM);
  };

  const openHomeworkEditModal = (item) => {
    resetFeedback();
    setHomeworkModal({ open: true, mode: 'edit', item });
    setHomeworkForm({
      title: item.title || '',
      description: item.description || '',
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '',
      maxMarks: String(item.maxMarks || 100),
      attachmentName: item.attachmentName || '',
    });
  };

  const saveHomework = async () => {
    if (!activeClassName) {
      return;
    }

    const title = homeworkForm.title.trim();
    const maxMarks = Number(homeworkForm.maxMarks);

    if (!title) {
      setError('عنوان الواجب مطلوب.');
      return;
    }

    if (Number.isNaN(maxMarks) || maxMarks <= 0) {
      setError('الدرجة الكاملة غير صحيحة.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        title,
        description: homeworkForm.description.trim(),
        dueDate: homeworkForm.dueDate || null,
        maxMarks,
        attachmentName: homeworkForm.attachmentName.trim(),
      };

      if (homeworkModal.mode === 'edit' && homeworkModal.item) {
        await updateTeacherHomework(token, homeworkModal.item.id, payload);
        setSuccess('تم تحديث الواجب.');
      } else {
        await createTeacherHomework(token, {
          className: activeClassName,
          subject,
          ...payload,
        });
        setSuccess('تم إنشاء الواجب.');
      }

      setHomeworkModal({ open: false, mode: 'create', item: null });
      setHomeworkForm(DEFAULT_HOMEWORK_FORM);
      await loadPortalData();
    } catch (saveError) {
      setError(toUserMessage(saveError, 'تعذر حفظ الواجب.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHomework = async (item) => {
    const confirmed = window.confirm('هل ترغب في حذف هذا الواجب؟');
    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await deleteTeacherHomework(token, item.id);
      setSuccess('تم حذف الواجب.');
      await loadPortalData();
    } catch (deleteError) {
      setError(toUserMessage(deleteError, 'تعذر حذف الواجب.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openHomeworkDetail = (item) => {
    const firstAssignment = item.assignments?.[0];
    setHomeworkDetailModal({ open: true, item });
    setAssignmentForm({
      studentId: firstAssignment?.studentId || '',
      status: firstAssignment?.status || 'pending',
      score:
        firstAssignment?.score === null || firstAssignment?.score === undefined
          ? ''
          : String(firstAssignment.score),
      teacherComment: firstAssignment?.teacherComment || '',
    });
  };

  const selectedHomeworkAssignment = useMemo(() => {
    const item = homeworkDetailModal.item;
    if (!item || !assignmentForm.studentId) {
      return null;
    }

    return item.assignments.find((assignment) => assignment.studentId === assignmentForm.studentId) || null;
  }, [homeworkDetailModal.item, assignmentForm.studentId]);

  const syncAssignmentForm = (studentId) => {
    const item = homeworkDetailModal.item;
    if (!item) {
      return;
    }

    const assignment = item.assignments.find((entry) => entry.studentId === studentId);
    if (!assignment) {
      return;
    }

    setAssignmentForm({
      studentId,
      status: assignment.status || 'pending',
      score: assignment.score === null || assignment.score === undefined ? '' : String(assignment.score),
      teacherComment: assignment.teacherComment || '',
    });
  };

  const saveAssignmentUpdate = async () => {
    const item = homeworkDetailModal.item;
    if (!item || !assignmentForm.studentId) {
      return;
    }

    const nextScore = assignmentForm.score === '' ? null : Number(assignmentForm.score);
    if (nextScore !== null && Number.isNaN(nextScore)) {
      setError('درجة الواجب غير صحيحة.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await updateTeacherHomeworkAssignment(token, item.id, {
        studentId: assignmentForm.studentId,
        status: assignmentForm.status,
        score: nextScore,
        teacherComment: assignmentForm.teacherComment,
      });
      setSuccess('تم تحديث تسليم الطالب.');
      await loadPortalData();
      setHomeworkDetailModal({ open: false, item: null });
      setAssignmentForm(DEFAULT_ASSIGNMENT_FORM);
    } catch (updateError) {
      setError(toUserMessage(updateError, 'تعذر تحديث تسليم الطالب.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openGradeModal = (row = null) => {
    resetFeedback();
    const defaultStudentId = row?.studentId || activeClass?.students?.[0]?.id || '';
    setGradeModal({ open: true, row });
    setGradeForm({
      studentId: defaultStudentId,
      examTitle: row?.examTitle || '',
      score:
        row?.score === null || row?.score === undefined
          ? ''
          : String(row.score),
      maxMarks:
        row?.maxMarks === null || row?.maxMarks === undefined
          ? '100'
          : String(row.maxMarks),
    });
  };

  const saveGrade = async () => {
    if (!gradeForm.studentId) {
      setError('اختيار الطالب مطلوب.');
      return;
    }

    const score = Number(gradeForm.score);
    const maxMarks = Number(gradeForm.maxMarks);

    if (Number.isNaN(score) || Number.isNaN(maxMarks) || maxMarks <= 0) {
      setError('بيانات الدرجة غير صحيحة.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await updateTeacherExamMark(token, {
        studentId: gradeForm.studentId,
        subject,
        examTitle: gradeForm.examTitle.trim() || 'تقييم',
        score,
        maxMarks,
      });
      setSuccess('تم حفظ الدرجة.');
      setGradeModal({ open: false, row: null });
      setGradeForm(DEFAULT_GRADE_FORM);
      await loadPortalData();
    } catch (saveError) {
      setError(toUserMessage(saveError, 'تعذر حفظ الدرجة.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openStudentProfile = async (student) => {
    setAiDrafts(DEFAULT_AI_DRAFTS);
    setStudentModal({
      open: true,
      student,
      profile: null,
      loading: true,
      error: '',
    });

    try {
      const payload = await fetchStudentProfile(token, student.id, { subject });
      setStudentModal({
        open: true,
        student,
        profile: payload,
        loading: false,
        error: '',
      });
    } catch (profileError) {
      setStudentModal({
        open: true,
        student,
        profile: null,
        loading: false,
        error: toUserMessage(profileError, 'تعذر تحميل ملف الطالب.'),
      });
    }
  };

  const openClassAndAction = (tab, action) => {
    const nextClass = activeClassName || classes[0]?.name || '';
    if (!nextClass) {
      return;
    }

    setActiveClassName(nextClass);
    setActiveTab(tab);

    if (action === 'post') {
      openPostCreateModal();
    } else if (action === 'homework') {
      openHomeworkCreateModal();
    } else if (action === 'grade') {
      openGradeModal();
    } else if (action === 'grade-import') {
      openGradeImportModal(nextClass);
    }
  };

  const openGradeImportModal = (preferredClassName = '') => {
    const nextClass = preferredClassName || activeClassName || classes[0]?.name || '';
    if (!nextClass) {
      setError('لا يمكن بدء الاستيراد بدون فصل محدد.');
      return;
    }

    setActiveClassName(nextClass);
    setGradeImportForm({
      ...DEFAULT_GRADE_IMPORT_FORM,
      examTitle: gradeForm.examTitle || '',
    });
    setGradeImportModal({
      open: true,
      stage: 'upload',
      loading: false,
      preview: null,
      rows: [],
    });
  };

  const closeGradeImportModal = () => {
    setGradeImportModal({
      open: false,
      stage: 'upload',
      loading: false,
      preview: null,
      rows: [],
    });
    setGradeImportForm(DEFAULT_GRADE_IMPORT_FORM);
  };

  const handleGradeImportFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileDataUrl = await readFileAsDataUrl(file);
      setGradeImportForm((state) => ({
        ...state,
        fileName: file.name || '',
        fileDataUrl,
        sourceType: file.type?.includes('pdf') ? 'pdf' : 'image',
      }));
    } catch (fileError) {
      setError(toUserMessage(fileError, 'تعذر قراءة الملف.'));
    }
  };

  const runGradeImportPreview = async () => {
    if (!activeClassName) {
      setError('اختيار الفصل مطلوب.');
      return;
    }

    if (!gradeImportForm.fileDataUrl && !gradeImportForm.ocrText.trim()) {
      setError('ارفع صورة/ملف أو أضف نص OCR قبل التحليل.');
      return;
    }

    try {
      setGradeImportModal((state) => ({ ...state, loading: true }));
      setError('');

      const preview = await previewTeacherGradeImport(token, {
        className: activeClassName,
        subject,
        examTitle: gradeImportForm.examTitle.trim() || gradeForm.examTitle.trim() || 'Assessment',
        defaultMaxMarks: Number(gradeImportForm.defaultMaxMarks || 100),
        sourceType: gradeImportForm.sourceType,
        fileDataUrl: gradeImportForm.fileDataUrl,
        ocrText: gradeImportForm.ocrText.trim(),
      });

      setGradeImportModal((state) => ({
        ...state,
        loading: false,
        stage: 'preview',
        preview,
        rows: (preview?.detectedRows || []).map((row) => ({
          ...row,
          skip: Boolean(row.skip),
          confirmOverwrite: Boolean(row.confirmOverwrite),
          examTitle: row.examTitle || gradeImportForm.examTitle.trim() || 'Assessment',
        })),
      }));
    } catch (previewError) {
      setGradeImportModal((state) => ({ ...state, loading: false }));
      setError(toUserMessage(previewError, 'تعذر تحليل كشف الدرجات.'));
    }
  };

  const updateGradeImportRow = (rowIndex, patch) => {
    setGradeImportModal((state) => ({
      ...state,
      rows: state.rows.map((row) => (row.rowIndex === rowIndex ? { ...row, ...patch } : row)),
    }));
  };

  const confirmGradeImport = async () => {
    if (!gradeImportModal.rows.length) {
      setError('لا توجد بيانات للاستيراد.');
      return;
    }

    try {
      setGradeImportModal((state) => ({ ...state, loading: true }));
      setError('');

      const response = await confirmTeacherGradeImport(token, {
        className: activeClassName,
        subject,
        examTitle: gradeImportForm.examTitle.trim() || 'Assessment',
        confirmImport: true,
        rows: gradeImportModal.rows.map((row) => ({
          rowIndex: row.rowIndex,
          sourceStudentName: row.sourceStudentName,
          matchedStudentId: row.matchedStudentId || '',
          score: row.score,
          maxMarks: row.maxMarks,
          examTitle: row.examTitle,
          skip: row.skip === true,
          confirmOverwrite: row.confirmOverwrite === true,
        })),
      });

      setSuccess(
        `تم الاستيراد: ${formatEnglishNumber(response.importedCount)} سجل، تم التجاوز: ${formatEnglishNumber(
          response.skippedCount
        )}.`
      );
      closeGradeImportModal();
      await loadPortalData();
    } catch (importError) {
      setGradeImportModal((state) => ({ ...state, loading: false }));
      setError(toUserMessage(importError, 'تعذر تنفيذ الاستيراد.'));
    }
  };

  const generateStudentAiFeedbackDraft = async () => {
    if (!studentModal.student) {
      return;
    }

    try {
      setAiDrafts((state) => ({ ...state, loading: true, error: '' }));
      const payload = await generateTeacherFeedbackDraft(token, studentModal.student.id, {
        subject,
        tone: aiDrafts.tone,
      });
      setAiDrafts((state) => ({
        ...state,
        loading: false,
        feedback: payload?.draft || null,
      }));
    } catch (draftError) {
      setAiDrafts((state) => ({
        ...state,
        loading: false,
        error: toUserMessage(draftError, 'تعذر توليد المسودة الذكية.'),
      }));
    }
  };

  const generateStudentAiTermComment = async () => {
    if (!studentModal.student) {
      return;
    }

    try {
      setAiDrafts((state) => ({ ...state, loading: true, error: '' }));
      const payload = await generateTeacherTermComment(token, studentModal.student.id, {
        subject,
        tone: aiDrafts.tone,
        termLabel: 'Current Term',
      });
      setAiDrafts((state) => ({
        ...state,
        loading: false,
        termComment: payload?.comment || null,
      }));
    } catch (commentError) {
      setAiDrafts((state) => ({
        ...state,
        loading: false,
        error: toUserMessage(commentError, 'تعذر توليد تعليق التقرير.'),
      }));
    }
  };

  const renderLandingSections = () => (
    <div className="space-y-10">
      <section className="grid gap-3 sm:grid-cols-3">
        <article className="ht-surface p-4">
          <p className="text-[12px] text-[var(--ht-neutral-500)]">Pending responses</p>
          <p className="mt-2 text-[24px] font-semibold text-[var(--ht-neutral-900)]">
            {formatEnglishNumber(insights.pendingResponses)}
          </p>
        </article>
        <article className="ht-surface p-4">
          <p className="text-[12px] text-[var(--ht-neutral-500)]">Flagged parents</p>
          <p className="mt-2 text-[24px] font-semibold text-[var(--ht-neutral-900)]">
            {formatEnglishNumber(insights.flaggedParents)}
          </p>
        </article>
        <article className="ht-surface p-4">
          <p className="text-[12px] text-[var(--ht-neutral-500)]">Repeated incidents</p>
          <p className="mt-2 text-[24px] font-semibold text-[var(--ht-neutral-900)]">
            {formatEnglishNumber(insights.repeatedIncidents)}
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[24px] font-semibold text-[var(--ht-neutral-900)]">الفصول الدراسية</h2>
          <span className="text-[13px] text-[var(--ht-neutral-500)]">{formatEnglishNumber(classes.length)} فصول</span>
        </div>

        {!classes.length ? (
          <EmptyState message="لا توجد بيانات حالياً" />
        ) : (
          <div className="ht-scroll overflow-x-auto pb-2">
            <div className="grid min-w-[320px] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.name}
                  className={classItem.name}
                  studentCount={classItem.students.length}
                  onClick={() => {
                    setActiveClassName(classItem.name);
                    setActiveTab('posts');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="ht-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">الملخص الأسبوعي للطلاب</h2>
          <span className="text-[13px] text-[var(--ht-neutral-500)]">
            {formatEnglishNumber(insights.weeklySnapshots?.length || 0)} طالب
          </span>
        </div>
        {(insights.weeklySnapshots || []).length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {(insights.weeklySnapshots || []).slice(0, 8).map((snapshot) => (
              <article
                key={`${snapshot.studentId}-${snapshot.className}`}
                className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3"
              >
                <p className="text-[14px] font-semibold text-[var(--ht-neutral-900)]">{snapshot.studentName}</p>
                <p className="mt-1 text-[12px] text-[var(--ht-neutral-600)]">
                  {snapshot.className || '-'} · {snapshot.academicDirection} · {snapshot.riskStatus} risk
                </p>
                <p className="mt-2 text-[12px] text-[var(--ht-neutral-600)]">{snapshot.attendancePattern}</p>
                <p className="mt-1 text-[12px] text-[var(--ht-neutral-600)]">{snapshot.behaviorNote}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="لا توجد بيانات كافية لبناء الملخص الأسبوعي." />
        )}
      </section>

      <section className="ht-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">تحليل الصف الذكي</h2>
          <span className="text-[13px] text-[var(--ht-neutral-500)]">اقتراحات فقط</span>
        </div>
        {(insights.classAnalysis || []).length ? (
          <div className="space-y-2">
            {(insights.classAnalysis || []).slice(0, 6).map((item, index) => (
              <article key={`${item.type}-${item.className}-${index}`} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3">
                <p className="text-[13px] text-[var(--ht-neutral-800)]">{item.message}</p>
                <p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">{item.suggestion}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="لا توجد تنبيهات تحليلية هذا الأسبوع." />
        )}
      </section>

      <ActivityList
        items={dashboardActivity}
        onViewAll={() => setShowAllActivity((value) => !value)}
      />

      <QuickActions
        onPost={() => openClassAndAction('posts', 'post')}
        onHomework={() => openClassAndAction('homework', 'homework')}
        onGrade={() => openClassAndAction('grades', 'grade')}
        onGradeImport={() => openClassAndAction('grades', 'grade-import')}
        disabled={!classes.length}
      />
    </div>
  );

  return (
    <main dir="rtl" className="ht-theme min-h-screen bg-[var(--ht-bg-base)]">
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-12">
        <TeacherHeader
          teacherName={user?.name || ''}
          avatarUrl={teacherAvatar}
          subjectLabel={subject ? `المواد المكلف بها: ${subject}` : 'المواد المكلف بها'}
          onOpenNotifications={openNotifications}
          onOpenSettings={openSettings}
          onOpenSchedule={() => navigate('/teacher/schedule')}
          onLogout={handleLogout}
        />

        {error ? (
          <div className="mb-6 rounded-[6px] border border-[var(--ht-danger-100)] bg-[var(--ht-danger-100)] px-4 py-3 text-[13px] text-[var(--ht-danger-600)]">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-6 rounded-[6px] border border-[var(--ht-success-100)] bg-[var(--ht-success-100)] px-4 py-3 text-[13px] text-[var(--ht-success-600)]">
            {success}
          </div>
        ) : null}

        {loading ? (
          <section className="ht-surface p-8">
            <p className="text-[14px] text-[var(--ht-neutral-500)]">جارٍ تحميل البيانات...</p>
          </section>
        ) : activeClass ? (
          <section className="space-y-6">
            <button
              type="button"
              onClick={() => {
                setActiveClassName('');
                setActiveTab('posts');
              }}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
            >
              رجوع إلى لوحة المعلم
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
              onViewStudent={(student) => openStudentProfile(student)}
            />
          </section>
        ) : (
          renderLandingSections()
        )}
      </div>

      <ModalComponent
        open={postModal.open}
        onClose={() => setPostModal({ open: false, mode: 'create', post: null })}
        title={postModal.mode === 'edit' ? 'تعديل الإعلان' : 'نشر إعلان'}
        description="اكتب عنوان الإعلان وتفاصيله للفصل الحالي."
        footer={
          <>
            <button
              type="button"
              onClick={() => setPostModal({ open: false, mode: 'create', post: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={savePost}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">العنوان</span>
            <input
              type="text"
              value={postForm.title}
              onChange={(event) => setPostForm((state) => ({ ...state, title: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المحتوى</span>
            <textarea
              value={postForm.body}
              onChange={(event) => setPostForm((state) => ({ ...state, body: event.target.value }))}
              className="min-h-[120px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[14px] leading-[1.8] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المرفق</span>
            <input
              type="text"
              value={postForm.attachmentName}
              onChange={(event) => setPostForm((state) => ({ ...state, attachmentName: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
        </div>
      </ModalComponent>

      <ModalComponent
        open={homeworkModal.open}
        onClose={() => setHomeworkModal({ open: false, mode: 'create', item: null })}
        title={homeworkModal.mode === 'edit' ? 'تعديل الواجب' : 'إضافة واجب'}
        description="إدارة تفاصيل الواجب للفصل الحالي."
        footer={
          <>
            <button
              type="button"
              onClick={() => setHomeworkModal({ open: false, mode: 'create', item: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={saveHomework}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">عنوان الواجب</span>
            <input
              type="text"
              value={homeworkForm.title}
              onChange={(event) => setHomeworkForm((state) => ({ ...state, title: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">تاريخ التسليم</span>
            <input
              type="date"
              value={homeworkForm.dueDate}
              onChange={(event) => setHomeworkForm((state) => ({ ...state, dueDate: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">من</span>
            <input
              type="number"
              min="1"
              value={homeworkForm.maxMarks}
              onChange={(event) => setHomeworkForm((state) => ({ ...state, maxMarks: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الوصف</span>
            <textarea
              value={homeworkForm.description}
              onChange={(event) => setHomeworkForm((state) => ({ ...state, description: event.target.value }))}
              className="min-h-[100px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[14px] leading-[1.8] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المرفق</span>
            <input
              type="text"
              value={homeworkForm.attachmentName}
              onChange={(event) => setHomeworkForm((state) => ({ ...state, attachmentName: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
        </div>
      </ModalComponent>

      <ModalComponent
        open={gradeModal.open}
        onClose={() => setGradeModal({ open: false, row: null })}
        title="إدخال درجات"
        description="إضافة أو تعديل تقييم الطالب."
        footer={
          <>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setGradeModal({ open: false, row: null });
                openGradeImportModal(activeClassName);
              }}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] disabled:opacity-60"
            >
              استيراد بالذكاء الاصطناعي
            </button>
            <button
              type="button"
              onClick={() => setGradeModal({ open: false, row: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={saveGrade}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الطالب</span>
            <select
              value={gradeForm.studentId}
              onChange={(event) => setGradeForm((state) => ({ ...state, studentId: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            >
              <option value="">اختر الطالب</option>
              {(activeClass?.students || []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">التقييم</span>
            <input
              type="text"
              value={gradeForm.examTitle}
              onChange={(event) => setGradeForm((state) => ({ ...state, examTitle: event.target.value }))}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الدرجة</span>
              <input
                type="number"
                min="0"
                value={gradeForm.score}
                onChange={(event) => setGradeForm((state) => ({ ...state, score: event.target.value }))}
                className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">من</span>
              <input
                type="number"
                min="1"
                value={gradeForm.maxMarks}
                onChange={(event) => setGradeForm((state) => ({ ...state, maxMarks: event.target.value }))}
                className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
              />
            </label>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        open={gradeImportModal.open}
        onClose={closeGradeImportModal}
        title="استيراد كشف درجات بالذكاء الاصطناعي"
        description="رفع صورة أو PDF أو نص OCR، ثم مراجعة النتائج وتأكيد الاستيراد يدوياً."
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeGradeImportModal}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]"
            >
              إلغاء
            </button>
            {gradeImportModal.stage === 'upload' ? (
              <button
                type="button"
                disabled={gradeImportModal.loading}
                onClick={runGradeImportPreview}
                className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60"
              >
                {gradeImportModal.loading ? 'جارٍ التحليل...' : 'تحليل'}
              </button>
            ) : (
              <button
                type="button"
                disabled={gradeImportModal.loading}
                onClick={confirmGradeImport}
                className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60"
              >
                {gradeImportModal.loading ? 'جارٍ الاستيراد...' : 'تأكيد الاستيراد'}
              </button>
            )}
          </>
        }
      >
        {gradeImportModal.stage === 'upload' ? (
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--ht-neutral-500)]">
              الفصل الحالي: {activeClassName || '-'} · المادة: {subject || '-'}
            </p>

            <label className="block">
              <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">ملف كشف الدرجات</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleGradeImportFileSelect}
                className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] text-[var(--ht-neutral-700)]"
              />
              {gradeImportForm.fileName ? (
                <p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">{gradeImportForm.fileName}</p>
              ) : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">عنوان الاختبار</span>
                <input
                  type="text"
                  value={gradeImportForm.examTitle}
                  onChange={(event) =>
                    setGradeImportForm((state) => ({ ...state, examTitle: event.target.value }))
                  }
                  className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الدرجة الكاملة الافتراضية</span>
                <input
                  type="number"
                  min="1"
                  value={gradeImportForm.defaultMaxMarks}
                  onChange={(event) =>
                    setGradeImportForm((state) => ({ ...state, defaultMaxMarks: event.target.value }))
                  }
                  className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">
                نص OCR (اختياري - مفيد في حالة PDF)
              </span>
              <textarea
                value={gradeImportForm.ocrText}
                onChange={(event) =>
                  setGradeImportForm((state) => ({ ...state, ocrText: event.target.value }))
                }
                className="min-h-[120px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                placeholder="الصق نص OCR هنا إذا كان متوفراً."
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <article className="ht-soft-surface p-3">
                <p className="text-[11px] text-[var(--ht-neutral-500)]">إجمالي الصفوف</p>
                <p className="mt-1 text-[18px] font-semibold text-[var(--ht-neutral-900)]">
                  {formatEnglishNumber(gradeImportModal.preview?.summary?.totalRows || 0)}
                </p>
              </article>
              <article className="ht-soft-surface p-3">
                <p className="text-[11px] text-[var(--ht-neutral-500)]">مطابقات ناجحة</p>
                <p className="mt-1 text-[18px] font-semibold text-[var(--ht-neutral-900)]">
                  {formatEnglishNumber(gradeImportModal.preview?.summary?.matchedRows || 0)}
                </p>
              </article>
              <article className="ht-soft-surface p-3">
                <p className="text-[11px] text-[var(--ht-neutral-500)]">أسماء غير معروفة</p>
                <p className="mt-1 text-[18px] font-semibold text-[var(--ht-neutral-900)]">
                  {formatEnglishNumber(gradeImportModal.preview?.summary?.unrecognizedRows || 0)}
                </p>
              </article>
              <article className="ht-soft-surface p-3">
                <p className="text-[11px] text-[var(--ht-neutral-500)]">صفوف تحتاج مراجعة</p>
                <p className="mt-1 text-[18px] font-semibold text-[var(--ht-neutral-900)]">
                  {formatEnglishNumber(gradeImportModal.preview?.summary?.inconsistentRows || 0)}
                </p>
              </article>
            </div>

            <div className="max-h-[420px] overflow-auto rounded-[4px] border border-[var(--ht-border-subtle)]">
              <table className="min-w-full border-collapse text-right">
                <thead className="bg-[var(--ht-bg-subtle)]">
                  <tr>
                    {['الاسم من الكشف', 'مطابقة الطالب', 'الدرجة', 'من', 'الاختبار', 'ملاحظات', 'تجاوز'].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ht-neutral-500)]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gradeImportModal.rows.map((row) => (
                    <tr key={row.rowIndex} className="border-t border-[var(--ht-border-subtle)]">
                      <td className="whitespace-nowrap px-3 py-2 text-[13px] text-[var(--ht-neutral-800)]">
                        {row.sourceStudentName || `Row ${row.rowIndex + 1}`}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.matchedStudentId || ''}
                          onChange={(event) =>
                            updateGradeImportRow(row.rowIndex, {
                              matchedStudentId: event.target.value,
                            })
                          }
                          className="h-9 w-[210px] rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] text-[var(--ht-neutral-800)] outline-none"
                        >
                          <option value="">Unrecognized Name</option>
                          {(activeClass?.students || []).map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.score ?? ''}
                          onChange={(event) => updateGradeImportRow(row.rowIndex, { score: event.target.value })}
                          className="h-9 w-20 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] text-[var(--ht-neutral-800)] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.maxMarks ?? ''}
                          onChange={(event) =>
                            updateGradeImportRow(row.rowIndex, { maxMarks: event.target.value })
                          }
                          className="h-9 w-20 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] text-[var(--ht-neutral-800)] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.examTitle || ''}
                          onChange={(event) =>
                            updateGradeImportRow(row.rowIndex, { examTitle: event.target.value })
                          }
                          className="h-9 w-28 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px] text-[var(--ht-neutral-800)] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[var(--ht-neutral-500)]">
                        {row.issues?.length ? row.issues.join(' / ') : '-'}
                        {row.overwrite?.requiresOverwriteConfirmation ? (
                          <label className="mt-1 flex items-center gap-1 text-[11px] text-[var(--ht-danger-600)]">
                            <input
                              type="checkbox"
                              checked={row.confirmOverwrite === true}
                              onChange={(event) =>
                                updateGradeImportRow(row.rowIndex, {
                                  confirmOverwrite: event.target.checked,
                                })
                              }
                            />
                            <span>تأكيد الاستبدال</span>
                          </label>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={row.skip === true}
                          onChange={(event) => updateGradeImportRow(row.rowIndex, { skip: event.target.checked })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ModalComponent>

      <ModalComponent
        open={homeworkDetailModal.open}
        onClose={() => setHomeworkDetailModal({ open: false, item: null })}
        title={homeworkDetailModal.item?.title || 'تفاصيل الواجب'}
        description="متابعة تسليمات الطلاب وتحديث الحالة."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setHomeworkDetailModal({ open: false, item: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98]"
            >
              إغلاق
            </button>
            <button
              type="button"
              disabled={submitting || !assignmentForm.studentId}
              onClick={saveAssignmentUpdate}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white hover:bg-[var(--ht-primary-700)] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        }
      >
        {homeworkDetailModal.item ? (
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--ht-neutral-500)]">
              التسليم: {formatEnglishDate(homeworkDetailModal.item.dueDate)}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الطالب</span>
                <select
                  value={assignmentForm.studentId}
                  onChange={(event) => syncAssignmentForm(event.target.value)}
                  className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
                >
                  {(homeworkDetailModal.item.assignments || []).map((assignment) => (
                    <option key={assignment.studentId} value={assignment.studentId}>
                      {assignment.studentName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الحالة</span>
                <select
                  value={assignmentForm.status}
                  onChange={(event) => setAssignmentForm((state) => ({ ...state, status: event.target.value }))}
                  className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="submitted">مسلّم</option>
                  <option value="graded">مكتمل</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الدرجة</span>
                <input
                  type="number"
                  min="0"
                  max={homeworkDetailModal.item.maxMarks}
                  value={assignmentForm.score}
                  onChange={(event) => setAssignmentForm((state) => ({ ...state, score: event.target.value }))}
                  className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">إضافة تعليق</span>
                <input
                  type="text"
                  value={assignmentForm.teacherComment}
                  onChange={(event) =>
                    setAssignmentForm((state) => ({ ...state, teacherComment: event.target.value }))
                  }
                  className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[14px] text-[var(--ht-neutral-800)] outline-none focus:border-[var(--ht-border-focus)]"
                />
              </label>
            </div>

            <div className="ht-soft-surface p-4">
              <p className="text-[13px] text-[var(--ht-neutral-600)]">
                حالة التسليم الحالية: {statusLabelMap[selectedHomeworkAssignment?.status] || '-'}
              </p>
              <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">
                آخر تحديث: {formatEnglishDateTime(selectedHomeworkAssignment?.updatedAt)}
              </p>
              <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">
                عرض التسليم: {selectedHomeworkAssignment?.submissionAttachment || selectedHomeworkAssignment?.submissionText || 'لا يوجد تسليم'}
              </p>
            </div>
          </div>
        ) : null}
      </ModalComponent>

      <ModalComponent
        open={studentModal.open}
        onClose={() => {
          setStudentModal({ open: false, student: null, profile: null, loading: false, error: '' });
          setAiDrafts(DEFAULT_AI_DRAFTS);
        }}
        title={studentModal.student ? `ملف الطالب: ${studentModal.student.name}` : 'ملف الطالب'}
        description="نظرة عامة على الأداء والتسليمات الحديثة."
        size="lg"
      >
        {studentModal.loading ? (
          <p className="text-[14px] text-[var(--ht-neutral-500)]">جارٍ تحميل ملف الطالب...</p>
        ) : studentModal.error ? (
          <p className="text-[14px] text-[var(--ht-danger-600)]">{studentModal.error}</p>
        ) : studentModal.profile ? (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="ht-soft-surface p-4">
                <p className="text-[12px] text-[var(--ht-neutral-500)]">الاسم</p>
                <p className="mt-1 text-[16px] font-semibold text-[var(--ht-neutral-900)]">{studentModal.profile.student.name}</p>
              </div>
              <div className="ht-soft-surface p-4">
                <p className="text-[12px] text-[var(--ht-neutral-500)]">البريد الإلكتروني</p>
                <p className="mt-1 text-[16px] text-[var(--ht-neutral-900)]">{studentModal.profile.student.email || '-'}</p>
              </div>
              <div className="ht-soft-surface p-4">
                <p className="text-[12px] text-[var(--ht-neutral-500)]">متوسط الدرجات</p>
                <p className="mt-1 text-[16px] font-semibold text-[var(--ht-neutral-900)]">
                  {(() => {
                    const marks = studentModal.profile.examMarks || [];
                    if (!marks.length) return '0%';
                    const avg =
                      marks.reduce((sum, mark) => {
                        const score = Number(mark.rawScore ?? mark.score ?? 0);
                        const maxMarks = Number(mark.maxMarks || 100) || 100;
                        return sum + (score / maxMarks) * 100;
                      }, 0) / marks.length;
                    return `${formatEnglishNumber(avg, 1)}%`;
                  })()}
                </p>
              </div>
              <div className="ht-soft-surface p-4">
                <p className="text-[12px] text-[var(--ht-neutral-500)]">آخر ملاحظة</p>
                <p className="mt-1 text-[16px] text-[var(--ht-neutral-900)]">
                  {studentModal.profile.feedbackReceived?.[0]?.content || '-'}
                </p>
              </div>
            </section>

            {studentModal.profile.weeklySnapshot ? (
              <section className="ht-soft-surface p-4">
                <h4 className="text-[15px] font-semibold text-[var(--ht-neutral-900)]">AI Weekly Snapshot</h4>
                <p className="mt-2 text-[13px] text-[var(--ht-neutral-600)]">
                  {studentModal.profile.weeklySnapshot.academicDirection} · {studentModal.profile.weeklySnapshot.riskStatus} risk
                </p>
                <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">{studentModal.profile.weeklySnapshot.attendancePattern}</p>
                <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">{studentModal.profile.weeklySnapshot.behaviorNote}</p>
                <p className="mt-1 text-[13px] text-[var(--ht-neutral-600)]">
                  Parent engagement: {studentModal.profile.weeklySnapshot.parentEngagementStatus}
                </p>
              </section>
            ) : null}

            <section className="ht-soft-surface space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-semibold text-[var(--ht-neutral-900)]">AI Feedback Assistant</h4>
                <select
                  value={aiDrafts.tone}
                  onChange={(event) => setAiDrafts((state) => ({ ...state, tone: event.target.value }))}
                  className="h-9 rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] text-[var(--ht-neutral-700)] outline-none"
                >
                  <option value="neutral">Neutral</option>
                  <option value="encouraging">Encouraging</option>
                  <option value="firm">Firm</option>
                </select>
                <button
                  type="button"
                  disabled={aiDrafts.loading}
                  onClick={generateStudentAiFeedbackDraft}
                  className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] disabled:opacity-60"
                >
                  {aiDrafts.loading ? 'جارٍ التوليد...' : 'توليد ملخص للمعلم/ولي الأمر'}
                </button>
                <button
                  type="button"
                  disabled={aiDrafts.loading}
                  onClick={generateStudentAiTermComment}
                  className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] disabled:opacity-60"
                >
                  {aiDrafts.loading ? 'جارٍ التوليد...' : 'توليد تعليق التقرير'}
                </button>
              </div>

              {aiDrafts.error ? (
                <p className="text-[12px] text-[var(--ht-danger-600)]">{aiDrafts.error}</p>
              ) : null}

              {aiDrafts.feedback ? (
                <div className="space-y-2">
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Teacher Internal Summary (Editable)</span>
                    <textarea
                      value={aiDrafts.feedback.teacherInternalSummary || ''}
                      onChange={(event) =>
                        setAiDrafts((state) => ({
                          ...state,
                          feedback: {
                            ...(state.feedback || {}),
                            teacherInternalSummary: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Parent Summary (Editable)</span>
                    <textarea
                      value={aiDrafts.feedback.parentSummary || ''}
                      onChange={(event) =>
                        setAiDrafts((state) => ({
                          ...state,
                          feedback: {
                            ...(state.feedback || {}),
                            parentSummary: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                    />
                  </label>
                </div>
              ) : null}

              {aiDrafts.termComment ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Academic Comment</span>
                    <textarea
                      value={aiDrafts.termComment.academicComment || ''}
                      onChange={(event) =>
                        setAiDrafts((state) => ({
                          ...state,
                          termComment: {
                            ...(state.termComment || {}),
                            academicComment: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Behavior Reflection</span>
                    <textarea
                      value={aiDrafts.termComment.behaviorReflection || ''}
                      onChange={(event) =>
                        setAiDrafts((state) => ({
                          ...state,
                          termComment: {
                            ...(state.termComment || {}),
                            behaviorReflection: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Attendance Note</span>
                    <textarea
                      value={aiDrafts.termComment.attendanceNote || ''}
                      onChange={(event) =>
                        setAiDrafts((state) => ({
                          ...state,
                          termComment: {
                            ...(state.termComment || {}),
                            attendanceNote: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">Improvement Recommendation</span>
                    <textarea
                      value={aiDrafts.termComment.improvementRecommendation || ''}
                      onChange={(event) =>
                        setAiDrafts((state) => ({
                          ...state,
                          termComment: {
                            ...(state.termComment || {}),
                            improvementRecommendation: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[84px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-800)] outline-none"
                    />
                  </label>
                </div>
              ) : null}
            </section>

            <section>
              <h4 className="mb-3 text-[16px] font-semibold text-[var(--ht-neutral-900)]">أحدث التسليمات</h4>
              <div className="space-y-2">
                {(studentModal.profile.homework || []).slice(0, 5).map((item) => (
                  <article key={item.id} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3">
                    <p className="text-[14px] font-medium text-[var(--ht-neutral-800)]">{item.title}</p>
                    <p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">
                      الحالة: {statusLabelMap[item.status] || item.status} · التاريخ: {formatEnglishDateTime(item.assignmentUpdatedAt)}
                    </p>
                  </article>
                ))}
                {!studentModal.profile.homework?.length ? (
                  <p className="text-[13px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>
                ) : null}
              </div>
            </section>

            <section>
              <h4 className="mb-3 text-[16px] font-semibold text-[var(--ht-neutral-900)]">ملخص الدرجات</h4>
              <div className="space-y-2">
                {(studentModal.profile.examMarks || []).slice(0, 5).map((mark) => (
                  <article key={`${mark.subject}-${mark.updatedAt}`} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3">
                    <p className="text-[14px] font-medium text-[var(--ht-neutral-800)]">{mark.examTitle || mark.subject}</p>
                    <p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">
                      {formatEnglishNumber(mark.rawScore ?? mark.score, 2)} / {formatEnglishNumber(mark.maxMarks || 100, 2)}
                    </p>
                  </article>
                ))}
                {!studentModal.profile.examMarks?.length ? (
                  <p className="text-[13px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>
                ) : null}
              </div>
            </section>
          </div>
        ) : (
          <p className="text-[14px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>
        )}
      </ModalComponent>

      <ModalComponent
        open={utilityModal.open}
        onClose={() => setUtilityModal({ open: false, title: '', kind: '' })}
        title={utilityModal.title}
      >
        {utilityModal.kind === 'notifications' ? (
          <div className="space-y-2">
            {allActivity.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3">
                <p className="text-[14px] font-medium text-[var(--ht-neutral-800)]">{item.title}</p>
                <p className="mt-1 text-[12px] text-[var(--ht-neutral-500)]">
                  {item.type} · {item.className} · {formatEnglishDateTime(item.date)}
                </p>
              </article>
            ))}
            {!allActivity.length ? (
              <p className="text-[14px] text-[var(--ht-neutral-500)]">لا توجد بيانات حالياً</p>
            ) : null}
          </div>
        ) : (
          <p className="text-[14px] leading-[1.9] text-[var(--ht-neutral-600)]">
            لا يمكن للمعلم تعديل إعدادات النظام. هذه الصلاحية مخصصة للإدارة.
          </p>
        )}
      </ModalComponent>
    </main>
  );
}
