// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOrganization?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireOrganization = false 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Si pas d'utilisateur, rediriger vers la connexion
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Vérification des permissions admin
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Vérification des permissions organisation
  if (requireOrganization) {
    if (user.userType !== 'organization') {
      return <Navigate to="/" replace />;
    }

    // Si c'est une organisation en attente, rediriger vers la page d'attente
    if (user.organization?.status === 'pending') {
      return <Navigate to="/organization/pending-approval" replace />;
    }

    // Si l'organisation est rejetée, rediriger aussi vers la page d'attente
    if (user.organization?.status === 'rejected') {
      return <Navigate to="/organization/pending-approval" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;