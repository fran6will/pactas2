import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface OrganizationRouteProps {
  children: ReactNode;
}

const OrganizationRoute = ({ children }: OrganizationRouteProps) => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Vérifier si l'utilisateur est une organisation approuvée
  const isApprovedOrganization = 
    user?.userType === 'organization' && 
    user?.organization?.status === 'approved';

  if (!isApprovedOrganization) {
    // Rediriger vers la page d'attente si en attente d'approbation
    if (user?.organization?.status === 'pending') {
      return <Navigate to="/organization/pending-approval" replace />;
    }
    // Sinon, rediriger vers la page d'accueil
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default OrganizationRoute;