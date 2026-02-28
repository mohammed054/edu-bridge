import { Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './core/auth/AdminRoute';
import RoleRoute from './core/auth/RoleRoute';
import { resolveHomePath } from './core/auth/routeHelpers';
import { useAuth } from './core/auth/useAuth';
import LoginPage from './modules/auth/LoginPage';
import AdminLayout from './modules/admin/layout/AdminLayout';
import AdminDashboardPage from './modules/admin/pages/AdminDashboardPage';
import ClassesPage from './modules/admin/pages/ClassesPage';
import FeedbackPage from './modules/admin/pages/FeedbackPage';
import ImportUsersPage from './modules/admin/pages/ImportUsersPage';
import NotificationsPage from './modules/admin/pages/NotificationsPage';
import ReportsPage from './modules/admin/pages/ReportsPage';
import SchedulePage from './modules/admin/pages/SchedulePage';
import SettingsPage from './modules/admin/pages/SettingsPage';
import StudentsPage from './modules/admin/pages/StudentsPage';
import SubjectsPage from './modules/admin/pages/SubjectsPage';
import SurveyBuilderPage from './modules/admin/pages/SurveyBuilderPage';
import TeachersPage from './modules/admin/pages/TeachersPage';
import LoadingScreen from './modules/shared/LoadingScreen';
import StudentPortalPage from './modules/student/StudentPortalPage';
import StudentWeeklySchedulePage from './modules/student/StudentWeeklySchedulePage';
import TeacherPortalPage from './modules/teacher/TeacherPortalPage';
import TeacherSchedulePage from './modules/teacher/TeacherSchedulePage';

function HomeRedirect() {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Navigate to={isAuthenticated ? resolveHomePath(role) : '/login'} replace />;
}

function LoginRoute() {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={resolveHomePath(role)} replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="import-users" element={<ImportUsersPage />} />
          <Route path="surveys" element={<SurveyBuilderPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow="teacher" />}>
        <Route path="/teacher" element={<TeacherPortalPage />} />
        <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
      </Route>

      <Route element={<RoleRoute allow="student" />}>
        <Route path="/student" element={<StudentPortalPage />} />
        <Route path="/student/schedule" element={<StudentWeeklySchedulePage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
