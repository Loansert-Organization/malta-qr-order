
import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'guest' | 'vendor' | 'admin'>;
  allowAnonymous?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['vendor', 'admin'],
  allowAnonymous = false,
  redirectTo = '/'
}) => {
  const { user, profile, loading, isAnonymous } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow anonymous access if specified
  if (allowAnonymous && isAnonymous) {
    return <>{children}</>;
  }

  // For admin routes, require authentication
  if (allowedRoles.includes('admin') && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // For vendor routes, allow anonymous access unless admin is also required
  if (allowedRoles.includes('vendor') && !allowedRoles.includes('admin')) {
    return <>{children}</>;
  }

  // Check role-based access for authenticated users
  if (user && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is authenticated but no profile exists, allow access (profile will be created)
  if (user && !profile) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
