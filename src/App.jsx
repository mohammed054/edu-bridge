import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './core/auth/AdminRoute';
import RoleRoute from './core/auth/RoleRoute';
import { resolveHomePath } from './core/auth/routeHelpers';
import { useAuth } from './core/auth/useAuth';
import LoadingScreen from './modules/shared/LoadingScreen';

const LoginPage = lazy(() => import('./modules/auth/LoginPage'));
const AdminLayout = lazy(() => import('./modules/admin/layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./modules/admin/pages/AdminDashboardPage'));
const StudentsPage = lazy(() => import('./modules/admin/pages/StudentsPage'));
const TeachersPage = lazy(() => import('./modules/admin/pages/TeachersPage'));
const ClassesPage = lazy(() => import('./modules/admin/pages/ClassesPage'));
const SubjectsPage = lazy(() => import('./modules/admin/pages/SubjectsPage'));
const SchedulePage = lazy(() => import('./modules/admin/pages/SchedulePage'));
const FeedbackPage = lazy(() => import('./modules/admin/pages/FeedbackPage'));
const SurveyBuilderPage = lazy(() => import('./modules/admin/pages/SurveyBuilderPage'));
const NotificationsPage = lazy(() => import('./modules/admin/pages/NotificationsPage'));
const ImportUsersPage = lazy(() => import('./modules/admin/pages/ImportUsersPage'));
const ReportsPage = lazy(() => import('./modules/admin/pages/ReportsPage'));
const SettingsPage = lazy(() => import('./modules/admin/pages/SettingsPage'));

const TeacherPortalPage = lazy(() => import('./modules/teacher/TeacherPortalPage'));
const TeacherSchedulePage = lazy(() => import('./modules/teacher/TeacherSchedulePage'));
const StudentPortalPage = lazy(() => import('./modules/student/StudentPortalPage'));
const StudentWeeklySchedulePage = lazy(() => import('./modules/student/StudentWeeklySchedulePage'));

function LazyWrap({ children }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

function HomeRedirect() {
  const { isLoading, isAuthenticated, role } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return <Navigate to={isAuthenticated ? resolveHomePath(role) : '/login'} replace />;
}

function LoginRoute() {
  const { isLoading, isAuthenticated, role } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to={resolveHomePath(role)} replace />;
  return (
    <LazyWrap>
      <LoginPage />
    </LazyWrap>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<AdminRoute />}>
        <Route
          path="/admin"
          element={
            <LazyWrap>
              <AdminLayout />
            </LazyWrap>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="surveys" element={<SurveyBuilderPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="import-users" element={<ImportUsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow="teacher" />}>
        <Route
          path="/teacher"
          element={
            <LazyWrap>
              <TeacherPortalPage />
            </LazyWrap>
          }
        />
        <Route
          path="/teacher/schedule"
          element={
            <LazyWrap>
              <TeacherSchedulePage />
            </LazyWrap>
          }
        />
      </Route>

      <Route element={<RoleRoute allow="student" />}>
        <Route
          path="/student"
          element={
            <LazyWrap>
              <StudentPortalPage />
            </LazyWrap>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <LazyWrap>
              <StudentWeeklySchedulePage />
            </LazyWrap>
          }
        />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
