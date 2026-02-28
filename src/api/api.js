export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  ''
);

export const SESSION_STORAGE_KEY = 'edu_bridge_auth_session';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = Number(status);
  }
}

let failedAuthToken = null;
let sessionExpiredEmitted = false;

const emitSessionExpired = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('auth:session-expired'));
};

const resetAuthFailureState = () => {
  failedAuthToken = null;
  sessionExpiredEmitted = false;
};

const emitSessionExpiredOnce = () => {
  if (sessionExpiredEmitted) {
    return;
  }

  sessionExpiredEmitted = true;
  emitSessionExpired();
};

const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const [, payloadPart] = String(token).split('.');
    if (!payloadPart) {
      return false;
    }

    const payloadJson = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    if (!payload?.exp) {
      return false;
    }

    return Date.now() >= Number(payload.exp) * 1000;
  } catch {
    return false;
  }
};

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

export const getStoredSession = () => {
  try {
    const raw = getStorage()?.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (session) => {
  resetAuthFailureState();
  getStorage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  getStorage()?.removeItem(SESSION_STORAGE_KEY);
};

const toQueryString = (query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    params.append(key, String(value));
  });

  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const request = async (path, { method = 'GET', token, body, auth = false } = {}) => {
  const headers = {};
  const sessionToken = token || getStoredSession()?.token;

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    if (!sessionToken) {
      throw new ApiError('انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.', 401);
    }

    if (failedAuthToken && failedAuthToken !== sessionToken) {
      // A newer successful login issued a different token, so clear prior failure state.
      resetAuthFailureState();
    }

    if (failedAuthToken === sessionToken || isTokenExpired(sessionToken)) {
      const currentToken = getStoredSession()?.token;
      failedAuthToken = sessionToken;
      if (currentToken === sessionToken) {
        clearStoredSession();
      }
      emitSessionExpiredOnce();
      throw new ApiError('انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.', 401);
    }

    headers.Authorization = `Bearer ${sessionToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      const currentToken = getStoredSession()?.token;
      failedAuthToken = sessionToken || currentToken || null;
      if (!currentToken || !sessionToken || currentToken === sessionToken) {
        clearStoredSession();
        emitSessionExpiredOnce();
      }
    }
    throw new ApiError(payload.message || 'تعذر تنفيذ الطلب.', response.status);
  }

  return payload;
};

export const login = async ({ role, identifier, password }) => {
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (normalizedRole === 'admin') {
    return request('/auth/login/admin', {
      method: 'POST',
      body: {
        identifier: String(identifier || '').trim().toLowerCase(),
        password: String(password || ''),
      },
    });
  }

  if (normalizedRole === 'teacher') {
    return request('/auth/login/teacher', {
      method: 'POST',
      body: {
        email: String(identifier || '').trim().toLowerCase(),
        password: String(password || ''),
      },
    });
  }

  const studentEmail = String(identifier || '').trim().toLowerCase();

  try {
    return await request('/auth/login/student', {
      method: 'POST',
      body: {
        email: studentEmail,
        password: String(password || ''),
      },
    });
  } catch (error) {
    // Backward compatibility for existing student accounts using the older domain.
    if (
      error instanceof ApiError &&
      [400, 401].includes(error.status) &&
      studentEmail.endsWith('@moe.sch.ae')
    ) {
      const legacyEmail = studentEmail.replace('@moe.sch.ae', '@privatemoe.gov.ae');
      return request('/auth/login/student', {
        method: 'POST',
        body: {
          email: legacyEmail,
          password: String(password || ''),
        },
      });
    }
    throw error;
  }
};

export const getCurrentUser = (token) =>
  request('/auth/me', {
    token,
    auth: true,
  });

export const fetchStudentProfile = (token, studentId, query = {}) =>
  request(`/profile/${studentId}${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchStudentPortal = (token) =>
  request('/student/portal', {
    token,
    auth: true,
  });

export const fetchStudentWeeklySchedule = (token, query = {}) =>
  request(`/student/schedule${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchStudentAttendanceSummary = (token, query = {}) =>
  request(`/student/attendance/summary${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchFeedbackList = (token, query = {}) =>
  request(`/feedback/list${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchFeedbackOptions = (token) =>
  request('/feedback/options', {
    token,
    auth: true,
  });

export const submitStudentToTeacherFeedback = (token, body) =>
  request('/feedback/student-to-teacher', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const submitStudentToAdminFeedback = (token, body) =>
  request('/feedback/student-to-admin', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const fetchTeacherExams = (token, query = {}) =>
  request(`/teacher/exams${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const updateTeacherExamMark = (token, body) =>
  request('/teacher/exams', {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const deleteTeacherExamMark = (token, body) =>
  request('/teacher/exams', {
    method: 'DELETE',
    token,
    auth: true,
    body,
  });

export const previewTeacherGradeImport = (token, body) =>
  request('/teacher/grades/import/preview', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const confirmTeacherGradeImport = (token, body) =>
  request('/teacher/grades/import/confirm', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const generateTeacherFeedbackDraft = (token, studentId, body) =>
  request(`/teacher/students/${studentId}/feedback-draft`, {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const generateTeacherTermComment = (token, studentId, body) =>
  request(`/teacher/students/${studentId}/term-comment`, {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const fetchTeacherHomework = (token, query = {}) =>
  request(`/teacher/homework${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const createTeacherHomework = (token, body) =>
  request('/teacher/homework', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const updateTeacherHomework = (token, homeworkId, body) =>
  request(`/teacher/homework/${homeworkId}`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const updateTeacherHomeworkAssignment = (token, homeworkId, body) =>
  request(`/teacher/homework/${homeworkId}/assignments`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const deleteTeacherHomework = (token, homeworkId) =>
  request(`/teacher/homework/${homeworkId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const fetchTeacherAnnouncements = (token, query = {}) =>
  request(`/teacher/announcements${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchTeacherWeeklySchedule = (token, query = {}) =>
  request(`/teacher/schedule${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const markTeacherAttendance = (token, body) =>
  request('/teacher/attendance', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const fetchTeacherAttendanceSummary = (token, query = {}) =>
  request(`/teacher/attendance/summary${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchTeacherIncidents = (token, query = {}) =>
  request(`/teacher/incidents${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const createTeacherIncident = (token, body) =>
  request('/teacher/incidents', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const updateTeacherIncidentParentStatus = (token, incidentId, body) =>
  request(`/teacher/incidents/${incidentId}/parent-status`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const fetchTeacherDashboardInsights = (token) =>
  request('/teacher/dashboard-insights', {
    token,
    auth: true,
  });

export const createTeacherAnnouncement = (token, body) =>
  request('/teacher/announcements', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const updateTeacherAnnouncement = (token, announcementId, body) =>
  request(`/teacher/announcements/${announcementId}`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const deleteTeacherAnnouncement = (token, announcementId) =>
  request(`/teacher/announcements/${announcementId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const fetchAdminOverview = (token) =>
  request('/admin/overview', {
    token,
    auth: true,
  });

export const fetchAdminAuditLogs = (token, query = {}) =>
  request(`/admin/audit-logs${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const fetchAdminReports = (token) =>
  request('/admin/reports', {
    token,
    auth: true,
  });

export const fetchAdminAiAnalytics = (token) =>
  request('/admin/ai-analytics', {
    token,
    auth: true,
  });

export const fetchAdminIntelligence = (token) =>
  request('/admin/intelligence', {
    token,
    auth: true,
  });

export const fetchAdminSchedule = (token, query = {}) =>
  request(`/admin/schedule${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const createAdminScheduleEntry = (token, body) =>
  request('/admin/schedule/entries', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const updateAdminScheduleEntry = (token, entryId, body) =>
  request(`/admin/schedule/entries/${entryId}`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const deleteAdminScheduleEntry = (token, entryId) =>
  request(`/admin/schedule/entries/${entryId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const fetchAdminIncidents = (token, query = {}) =>
  request(`/admin/incidents${toQueryString(query)}`, {
    token,
    auth: true,
  });

export const updateAdminIncidentParentStatus = (token, incidentId, body) =>
  request(`/admin/incidents/${incidentId}/parent-status`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const addTeacher = (token, body) =>
  request('/admin/teachers', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const addStudent = (token, body) =>
  request('/admin/students', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const addClass = (token, body) =>
  request('/admin/classes', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const removeTeacher = (token, teacherId) =>
  request(`/admin/teachers/${teacherId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const removeStudent = (token, studentId) =>
  request(`/admin/students/${studentId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const removeClass = (token, classId) =>
  request(`/admin/classes/${classId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const updateTeacherAssignment = (token, teacherId, body) =>
  request(`/admin/teachers/${teacherId}/assignment`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const updateStudentAssignment = (token, studentId, body) =>
  request(`/admin/students/${studentId}/assignment`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const updateAdminUser = (token, userId, body) =>
  request(`/admin/users/${userId}`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const updateAdminUserStatus = (token, userId, active) =>
  request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    token,
    auth: true,
    body: { active },
  });

export const resetAdminUserPassword = (token, userId, newPassword) =>
  request(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
    token,
    auth: true,
    body: { newPassword },
  });

export const deleteAdminUser = (token, userId) =>
  request(`/admin/users/${userId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const fetchAdminSurveys = (token) =>
  request('/admin/surveys', {
    token,
    auth: true,
  });

export const createAdminSurvey = (token, body) =>
  request('/admin/surveys', {
    method: 'POST',
    token,
    auth: true,
    body,
  });

export const updateAdminSurvey = (token, surveyId, body) =>
  request(`/admin/surveys/${surveyId}`, {
    method: 'PATCH',
    token,
    auth: true,
    body,
  });

export const deleteAdminSurvey = (token, surveyId) =>
  request(`/admin/surveys/${surveyId}`, {
    method: 'DELETE',
    token,
    auth: true,
  });

export const fetchAdminSurveyResponses = (token, surveyId) =>
  request(`/admin/surveys/${surveyId}/responses`, {
    token,
    auth: true,
  });

export const exportUsers = (token) =>
  request('/admin/export-users', {
    token,
    auth: true,
  });

export const importUsers = (token, body, options = {}) =>
  request(`/admin/import-users${toQueryString(options)}`, {
    method: 'POST',
    token,
    auth: true,
    body,
  });
