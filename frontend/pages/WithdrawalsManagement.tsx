import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../services/api.service';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign
} from 'lucide-react';

const WithdrawalsManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/withdrawals/pending');
      setWithdrawals(response);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des demandes de retrait');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleComplete = async (withdrawalId) => {
    if (!window.confirm('Êtes-vous sûr d\'avoir effectué ce paiement ?')) {
      return;
    }

    try {
      await api.post(`/admin/withdrawals/${withdrawalId}/complete`);
      await fetchWithdrawals();
      alert('Retrait marqué comme complété');
    } catch (error) {
      alert('Erreur lors du traitement du retrait');
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason) return;

    try {
      await api.post(`/admin/withdrawals/${selectedWithdrawal.id}/reject`, {
        reason: rejectionReason
      });
      await fetchWithdrawals();
      setIsRejectModalOpen(false);
      setSelectedWithdrawal(null);
      setRejectionReason('');
      alert('Retrait rejeté');
    } catch (error) {
      alert('Erreur lors du rejet du retrait');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Demandes de retrait en attente</h2>
        <button
          onClick={fetchWithdrawals}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {withdrawals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande en attente</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{withdrawal.organization.name}</h3>
                  <p className="text-sm text-gray-500">
                    Demande effectuée le {format(new Date(withdrawal.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                  <div className="mt-2">
                    <span className="text-lg font-semibold text-green-600">
                      ${withdrawal.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleComplete(withdrawal.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                    title="Marquer comme payé"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmer paiement
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(withdrawal);
                      setIsRejectModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    title="Rejeter"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rejet */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-medium">Rejeter la demande de retrait</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Montant : ${selectedWithdrawal.amount.toFixed(2)}<br />
              Organisation : {selectedWithdrawal.organization.name}
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
              rows={4}
              placeholder="Raison du rejet..."
              required
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!rejectionReason.trim()}
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsManagement;