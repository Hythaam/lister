import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { CenteredLoading } from '../components/common/Spinner';

/**
 * Protected Route component that requires authentication
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (loading) {
    return <CenteredLoading message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
}

/**
 * Public Route component that redirects authenticated users
 */
export function PublicRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth status
  if (loading) {
    return <CenteredLoading message="Loading..." />;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;