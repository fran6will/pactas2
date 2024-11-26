import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    console.log("PaymentSuccessPage mounted");
    console.log("Current path:", location.pathname);
    console.log("Search params:", location.search);
    console.log("Session ID:", sessionId);

    if (sessionId) {
      refreshUser();
      
      // Redirection automatique après 5 secondes
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      console.log("No session ID found, redirecting...");
      navigate('/dashboard');
    }
  }, [sessionId, refreshUser, navigate, location]);

  // Si pas de sessionId, afficher un message de chargement
  if (!sessionId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p>Redirection en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          
          <p className="text-gray-600 mb-6">
            Vos tokens ont été ajoutés à votre compte.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Voir mon solde
            </button>

            <p className="text-sm text-gray-500">
              Redirection automatique dans quelques secondes...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;