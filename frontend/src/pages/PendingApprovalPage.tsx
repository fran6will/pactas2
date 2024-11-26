// src/pages/PendingApprovalPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const PendingApprovalPage = () => {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier périodiquement si le statut a changé
    const checkStatus = async () => {
      await refreshUser();
      if (user?.organization?.status === 'approved') {
        navigate('/organization/dashboard');
      }
    };

    const interval = setInterval(checkStatus, 10000); // Vérifier toutes les 10 secondes
    return () => clearInterval(interval);
  }, [user, refreshUser, navigate]);

  const getStatusDisplay = () => {
    if (!user?.organization) return null;

    switch (user.organization.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="w-5 h-5" />
            <span>En attente d'approbation</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Approuvée</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>Demande rejetée</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Demande d'organisation
            </h2>
            
            <div className="mt-4">
              {getStatusDisplay()}
            </div>

            <div className="mt-6 prose text-gray-500">
              <p>
                Votre demande d'organisation est en cours d'examen par notre équipe.
                Vous serez notifié par email lorsqu'elle sera traitée.
              </p>
              {user?.organization?.status === 'rejected' && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
                  <p>
                    Malheureusement, votre demande a été rejetée. 
                    Vous pouvez nous contacter pour plus d'informations.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;