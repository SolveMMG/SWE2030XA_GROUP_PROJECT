import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const intended = location.pathname + location.search;
    if (intended !== '/' && intended !== '/login') {
      localStorage.setItem('redirectAfterLogin', intended);
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
