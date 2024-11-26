// src/pages/PackSuccessPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { CheckCircle, Loader } from 'lucide-react';

const PackSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate('/organization/dashboard');
        return;
      }

      try {
        const response = await fetch(`/api/payments/check-session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();

        if (data.status === 'complete') {
          await refreshUser();
          setIsVerifying(false);
          
          // Démarrer le compte à rebours après la vérification
          const timer = setTimeout(() => {
            navigate('/organization/dashboard');
          }, 5000);

          return () => clearTimeout(timer);
        } else {
          // Si le paiement n'est pas complet, rediriger immédiatement
          navigate('/organization/dashboard');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        navigate('/organization/dashboard');
      }
    };

    verifyPayment();
  }, [sessionId, navigate, refreshUser]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Achat réussi !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre pack de questions a été ajouté à votre compte avec succès.
          </p>
          <button
            onClick={() => navigate('/organization/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Retour au tableau de bord
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Redirection automatique dans quelques secondes...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PackSuccessPage;