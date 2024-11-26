import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

const TransactionHistoryPage: React.FC = () => {
  const { user } = useUser(); // Récupération de l'utilisateur connecté
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/transactions/${user.id}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return <p>Chargement des transactions...</p>;
  }

  if (error) {
    return <p>Erreur : {error}</p>;
  }

  return (
    <div>
      <h1>Historique des transactions</h1>
      {transactions.length === 0 ? (
        <p>Aucune transaction disponible.</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.type} : {transaction.amount} crédits le{' '}
              {new Date(transaction.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
