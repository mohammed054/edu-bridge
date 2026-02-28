import { Navigate, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import StudentList from './components/StudentList.jsx';
import { useAuth } from './hooks/useAuth.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/students" replace /> : <LoginForm />} />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <StudentList />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/students' : '/'} replace />} />
    </Routes>
  );
}
