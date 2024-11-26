import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../services/api.service';

const WithdrawalTab = ({ organization }) => {
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      try {
        const response = await api.get('/withdrawals/history');
        setWithdrawalHistory(response);
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
      }
    };

    fetchWithdrawalHistory();
  }, []);

  const handleWithdrawal = async () => {
    if (!organization?.wallet || organization.wallet <= 0) {
      setError('Solde insuffisant pour effectuer un retrait');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await api.post('/withdrawals/request', { 
        amount: organization.wallet 
      });
      
      // Rafraîchir l'historique après la demande
      const response = await api.get('/withdrawals/history');
      setWithdrawalHistory(response);
      
      alert('Votre demande de retrait a été envoyée avec succès!');
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      setError(error.response?.data?.error || error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Complété
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Échoué
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Solde disponible */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Solde disponible</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-blue-600">
              {organization?.wallet?.toFixed(2) || '0.00'}€
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Disponible pour retrait
            </p>
          </div>
          <button
            onClick={handleWithdrawal}
            disabled={isLoading || !organization?.wallet || organization.wallet <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Demander un retrait
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2 text-red-600">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Historique des retraits */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Historique des retraits</h3>
        
        {withdrawalHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucun retrait effectué pour le moment
          </p>
        ) : (
          <div className="divide-y">
            {withdrawalHistory.map((withdrawal) => (
              <div key={withdrawal.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {withdrawal.amount.toFixed(2)}€
                    </span>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Demandé le {format(new Date(withdrawal.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-600">
        <p>
          Les retraits sont traités dans un délai de 2-3 jours ouvrés. 
          Un email de confirmation vous sera envoyé une fois le transfert effectué.
        </p>
      </div>
    </div>
  );
};

export default WithdrawalTab;