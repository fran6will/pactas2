import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { CreditCard, Plus, Minus, Loader } from 'lucide-react';
import { api } from '../services/api.service';

const BuyTokensForm = () => {
  const [amount, setAmount] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const handleAmountChange = (change) => {
    const newAmount = Math.max(10, amount + change); // Minimum 10 tokens
    setAmount(newAmount);
  };

  const handleBuyTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Créer une session de paiement
      const response = await api.post('/payments/create-payment-session', { 
        amount: amount 
      });

      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        window.location.href = response.url;
      }

    } catch (err) {
      setError('Une erreur est survenue lors de la création de la session de paiement.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Acheter des Tokens</h2>
      
      <div className="space-y-4">
        {/* Sélecteur de montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant en CAD (1$ = 1 token)
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleAmountChange(-10)}
              disabled={amount <= 10}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 0))}
                min="10"
                className="w-full p-2 border rounded-lg text-center"
              />
            </div>

            <button
              onClick={() => handleAmountChange(10)}
              className="p-2 rounded-lg border hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tokens actuels</span>
            <span>{user?.tokens || 0} tokens</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Achat</span>
            <span>+{amount} tokens</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total après achat</span>
            <span>{(user?.tokens || 0) + amount} tokens</span>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Bouton d'achat */}
        <button
          onClick={handleBuyTokens}
          disabled={isLoading || amount < 10}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Acheter {amount} tokens pour {amount}$
            </>
          )}
        </button>

        {/* Information de paiement sécurisé */}
        <p className="text-center text-sm text-gray-500">
          Paiement sécurisé par Stripe
        </p>
      </div>
    </div>
  );
};

export default BuyTokensForm;