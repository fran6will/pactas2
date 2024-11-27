import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Coins
} from 'lucide-react';
import { api } from '../services/api.service';
import QuestionCard from '../components/questions/QuestionCard';
import Stats from '../components/stats/Stats';

const ITEMS_PER_PAGE = 10;

const DashboardPage = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [transactionsRes, statsRes, questionsRes] = await Promise.all([
          api.get('/transactions/user'),
          api.get('/users/stats'),
          api.get('/users/active-questions')
        ]);

        setTransactions(transactionsRes);
        setStats(statsRes);
        setActiveQuestions(questionsRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPaginatedTransactions = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return transactions.slice(start, end);
  };

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats en haut */}
      <Stats user={user} stats={stats} />

      {/* Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Historique des transactions
        </button>
        <button
          onClick={() => setActiveTab('bets')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'bets'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Mes paris actifs
        </button>
      </div>

      {/* Contenu principal */}
      {activeTab === 'transactions' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">TYPE</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">QUESTION</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">MONTANT</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">DATE</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">STATUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getPaginatedTransactions().map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {tx.type === 'bet' ? 'Paris' :
                         tx.type === 'win' ? 'Gain' :
                         tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {tx.questionId ? (
                      <Link to={`/question/${tx.questionId}`} className="text-blue-600 hover:text-blue-800">
                        {tx.questionTitle}
                      </Link>
                    ) : '-'}
                    {tx.organizationName && (
                      <div className="text-sm text-gray-500">{tx.organizationName}</div>
                    )}
                  </td>
                  <td className={`px-6 py-4 font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className="flex items-center gap-1">
                <span>{tx.amount > 0 ? '+' : ''}{formatAmount(tx.amount)}</span>
                <Coins className="w-4 h-4 text-yellow-500" />
              </div>
            </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}
                    >
                      {tx.status === 'completed' ? 'Complété' :
                       tx.status === 'pending' ? 'En attente' : 'Échoué'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
              <div className="text-sm text-gray-500">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
          {activeQuestions.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-12 text-center text-gray-500">
              Vous n'avez aucun pari en cours
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;