import { Navigate, Outlet } from 'react-router-dom';
import { isJwtExpired } from './jwt';
import { useAuth } from './useAuth';
import LoadingScreen from '../../modules/shared/LoadingScreen';

export default function PrivateRoute({ children }) {
  const { isLoading, isAuthenticated, token, logout } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (token && isJwtExpired(token)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}