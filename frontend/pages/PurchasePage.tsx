// src/pages/PurchasePage.tsx
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api.service';

const PurchasePage = () => {
    const { user, refreshUser } = useUser();
    const [selectedPack, setSelectedPack] = useState<'pack1' | 'pack2' | 'pack3'>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
  
    const packOptions = [
      { id: 'pack1', name: '1 question', price: 10 },
      { id: 'pack2', name: '3 questions', price: 18 },
      { id: 'pack3', name: '5 questions', price: 45 },
    ];

    const handlePurchase = async () => {
        if (!selectedPack) return;
      
        try {
          setIsLoading(true);
          const pack = packOptions.find(p => p.id === selectedPack);
          if (!pack) return;
      
          const response = await api.post('/payments/create-pack-payment-session', {
            packId: selectedPack
          });
      
          if (response.url) {
            await refreshUser(); // Rafraîchir avant la redirection
            window.location.href = response.url;
          }
        } catch (error) {
          console.error('Error during purchase:', error);
          setError('Une erreur est survenue lors de l\'achat. Veuillez réessayer.');
        } finally {
          setIsLoading(false);
        }
      };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Acheter des questions</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packOptions.map(pack => (
          <div
            key={pack.id}
            className={`bg-white rounded-lg shadow-sm p-6 border transition-all ${
              selectedPack === pack.id
                ? 'border-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="text-xl font-medium mb-2">{pack.name}</h3>
            <p className="text-4xl font-bold text-blue-600 mb-4">${pack.price}</p>
            <button
              onClick={() => setSelectedPack(pack.id)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPack === pack.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {selectedPack === pack.id ? 'Sélectionné' : 'Choisir'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handlePurchase}
          disabled={!selectedPack || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Chargement...' : 'Acheter'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default PurchasePage;