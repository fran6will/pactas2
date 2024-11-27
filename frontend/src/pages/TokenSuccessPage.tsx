// src/pages/TokenSuccessPage.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { CheckCircle } from 'lucide-react';

const TokenSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser, user } = useUser();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (sessionId) {
      const checkInterval = setInterval(async () => {
        await refreshUser();
        setCheckCount(prev => prev + 1);
      }, 1000);

      const timer = setTimeout(() => {
        clearInterval(checkInterval);
        navigate('/dashboard');
      }, 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timer);
      };
    }
  }, [navigate, refreshUser, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h2>
          <p className="text-gray-600 mb-6">
            Vos tokens ont été ajoutés à votre compte avec succès.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenSuccessPage;