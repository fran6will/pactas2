import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TransactionsPage = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const response = await api.get('/organizations/transactions'); // Appel à l'API
        setTransactions(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des transactions :', err);
        setError('Impossible de récupérer les transactions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (isLoading) {
    return <p className="text-center py-8">Chargement des transactions...</p>;
  }

  if (error) {
    return <p className="text-center py-8 text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Historique des Transactions</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4">
                  {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                </td>
                <td className="px-6 py-4">
                  {tx.type === 'bet' ? 'Mise' : tx.type === 'win' ? 'Gain' : tx.type === 'org_commission' ? 'Commission' : tx.type}
                </td>
                <td className={`px-6 py-4 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}$
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
