import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const BetConfirmationModal = ({ 
  isOpen,
  onClose,
  onConfirm,
  prediction,
  amount,
  odds,
  isLoading,
  question
}) => {
  // Calcul des gains potentiels selon la vraie logique de répartition
  const calculatePotentialWinnings = () => {
    if (!amount || !question) return 0;

    // Total actuel des paris (incluant le nouveau pari)
    const totalPool = question.totalYes + question.totalNo + amount;
    
    // Déduction des frais admin (5%)
    const remainingAfterAdmin = totalPool * 0.95;
    
    // Part des gagnants (47.5% du reste)
    const winnersPool = remainingAfterAdmin * 0.475;

    // Total des paris gagnants (incluant le nouveau pari si c'est le bon côté)
    const totalWinningAmount = prediction === 'yes' 
      ? question.totalYes + amount 
      : question.totalNo + amount;

    // Part proportionnelle du parieur
    const winnerShare = (amount / totalWinningAmount) * winnersPool;

    return winnerShare;
  };

  const potentialWin = calculatePotentialWinnings();
  const currentOdds = prediction === 'yes' 
    ? ((question?.totalYes || 0) / (question?.totalYes + question?.totalNo || 1)) 
    : ((question?.totalNo || 0) / (question?.totalYes + question?.totalNo || 1));

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold mb-4">
            Confirmer votre pari
          </AlertDialog.Title>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Type de pari</span>
                <span className="font-medium">{prediction === 'yes' ? 'OUI' : 'NON'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant misé</span>
                <span className="font-medium">{amount}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distribution actuelle</span>
                <span className="font-medium">{(currentOdds * 100).toFixed(1)}%</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-green-600">
                  <span>Gains potentiels</span>
                  <span className="font-medium">{potentialWin.toFixed(2)}€</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <p>En cas de victoire :</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>47.5% est partagé entre les gagnants</li>
                    <li>47.5% va à l'organisation</li>
                    <li>5% sont des frais de plateforme</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Les gains peuvent varier selon la distribution finale des paris.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <AlertDialog.Cancel 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Annuler
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirmation...</span>
                </div>
              ) : (
                'Confirmer le pari'
              )}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default BetConfirmationModal;