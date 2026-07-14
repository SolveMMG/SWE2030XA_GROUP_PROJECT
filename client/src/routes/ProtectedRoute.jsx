import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, isAuthenticated = Boolean(localStorage.getItem('skillswap_token')) }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
