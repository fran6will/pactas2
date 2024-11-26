import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      console.log('Payment session ID:', sessionId);
    }
    // Rafraîchir les données de l'utilisateur après le paiement
    refreshUser();
  }, [refreshUser, sessionId]);

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

            <button
              onClick={() => navigate('/')}
              className="w-full text-blue-600 hover:text-blue-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;