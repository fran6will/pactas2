// src/pages/CancelPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const CancelPage = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // Ajoutez ceci

  useEffect(() => {
    const timer = setTimeout(() => {
      // Rediriger vers le dashboard approprié selon l'état de l'authentification
      if (user) {
        navigate('/organization/dashboard');
      } else {
        navigate('/');  // ou '/auth' ou une autre page publique
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement annulé
          </h2>
          <p className="text-gray-600 mb-6">
            Votre paiement a été annulé. Retour au tableau de bord...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;