import { Navigate, Outlet } from 'react-router-dom';
import { decodeJwtPayload, isJwtExpired } from './jwt';
import { resolveHomePath } from './routeHelpers';
import { useAuth } from './useAuth';
import LoadingScreen from '../../modules/shared/LoadingScreen';

export default function AdminRoute({ children }) {
  const { isLoading, isAuthenticated, token, role, logout } = useAuth();
  const payloadRole = decodeJwtPayload(token)?.role;

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

  if (String(payloadRole || role || '').toLowerCase() !== 'admin') {
    return <Navigate to={resolveHomePath(role)} replace />;
  }

  return children || <Outlet />;
}
