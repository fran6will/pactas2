// src/components/TransactionHistory.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { api } from '../services/api.service';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Building2,
  AlertCircle 
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
  questionId?: string;
  questionTitle?: string;
  organizationName?: string;
  prediction?: 'yes' | 'no';
}

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        // Utiliser transactions/user pour les users normaux et organizations/transactions pour les organisations
        const endpoint = user?.userType === 'organization' ? '/organizations/transactions' : '/transactions/user';
        const response = await api.get(endpoint);
        setTransactions(response);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Error loading transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.userType]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'bet':
        return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      case 'win':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'credit':
      case 'deposit':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'org_commission':
      case 'commission':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTransactionLabel = (transaction: Transaction) => {
    const baseLabel = (() => {
      switch (transaction.type) {
        case 'bet':
          return `Mise ${transaction.prediction === 'yes' ? '(OUI)' : '(NON)'}`;
        case 'win':
          return 'Gain';
        case 'credit':
        case 'deposit':
          return 'Dépôt';
        case 'org_commission':
        case 'commission':
          return 'Commission';
        default:
          return transaction.type;
      }
    })();

    return baseLabel;
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Historique des transactions
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                    <span className="ml-2">{getTransactionLabel(transaction)}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}€
                </td>
                <td className="px-6 py-4">
                  {transaction.questionId ? (
                    <div>
                      <Link 
                        to={`/question/${transaction.questionId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {transaction.questionTitle}
                      </Link>
                      {transaction.organizationName && (
                        <div className="text-sm text-gray-500 mt-1">
                          {transaction.organizationName}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {format(new Date(transaction.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {transaction.status === 'completed' ? 'Complété' :
                     transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune transaction à afficher
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;