import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuestion } from '../hooks/useQuestion';
import { betService } from '../services/bet.service';
import { useUser } from '../context/UserContext';
import BetConfirmationModal from '../components/modals/BetConfirmationModal';
import BetSuccessAnimation from '../components/animations/BetSuccessAnimation';


const QuestionPage = () => {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { question, isLoading, error, refresh } = useQuestion(id);
    const [betAmount, setBetAmount] = useState('');
    const [isPlacingBet, setIsPlacingBet] = useState(false);
    const [betError, setBetError] = useState(null);
    const [confirmationData, setConfirmationData] = useState(null);
    const { user, refreshUser } = useUser();
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const totalBets = question?.totalYes + question?.totalNo || 0;
    const yesPercentage = totalBets ? (question?.totalYes / totalBets) * 100 : 0;
    const noPercentage = totalBets ? (question?.totalNo / totalBets) * 100 : 0;
  
    const odds = {
      yes: yesPercentage || 100,
      no: noPercentage || 100
    };
  
    const initiateBet = (prediction) => {
      if (!user) {
        navigate('/auth');
        return;
      }
  
      const amount = parseFloat(betAmount);
      if (!betAmount || amount <= 0) {
        setBetError('Veuillez entrer un montant valide');
        return;
      }
  
      if (amount > user.tokens) {
        setBetError('Solde insuffisant');
        return;
      }
  
      setBetError(null);
      setConfirmationData({ amount, prediction });
    };
  
    const handleConfirmBet = async () => {
        if (!confirmationData) return;
      
        setIsPlacingBet(true);
        try {
          await betService.placeBet(question.id, confirmationData.amount, confirmationData.prediction);
          // Sauvegarder les données pour l'animation avant de reset
          setSuccessData(confirmationData);
          setBetAmount('');
          setConfirmationData(null);
          await Promise.all([refresh(), refreshUser()]);
          setShowSuccessAnimation(true);
        } catch (error) {
          console.error('Erreur lors du pari:', error);
          setBetError(error.message || 'Erreur lors de la mise');
        } finally {
          setIsPlacingBet(false);
        }
    };
  
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      );
    }
  
    if (error || !question) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Question non trouvée'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline"
          >
            Retour aux questions
          </button>
        </div>
      );
    }
  
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{question.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>{question.organization}</span>
            <span>•</span>
            <span>
              Résolution: {format(new Date(question.deadline), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
  
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">À propos de cette prédiction</h2>
              <p className="text-gray-600">{question.description}</p>
            </div>
  
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">Source de vérification</h2>
              <p className="text-gray-600">{question.source}</p>
            </div>
  
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">Distribution des mises</h2>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 transition-all"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span>OUI: {Math.round(yesPercentage)}% ({question.totalYes}€)</span>
                <span>NON: {Math.round(noPercentage)}% ({question.totalNo}€)</span>
              </div>
            </div>
          </div>
  
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-6">
              <h2 className="font-semibold mb-4">Placer une mise</h2>
  
              {user ? (
                <>
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">Votre solde</div>
                    <div className="font-medium">{user.tokens}€</div>
                  </div>
  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={user.tokens}
                      value={betAmount}
                      onChange={(e) => {
                        setBetAmount(e.target.value);
                        setBetError(null);
                      }}
                      className="w-full p-3 border rounded-lg"
                      placeholder="20"
                      disabled={isPlacingBet}
                    />
                    {betError && (
                      <p className="mt-1 text-sm text-red-600">{betError}</p>
                    )}
                  </div>
  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => initiateBet('yes')}
                      disabled={isPlacingBet}
                      className="p-4 rounded-lg border text-center border-green-500 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium">OUI</div>
                      <div className="text-sm text-gray-500">
                        {Math.round(yesPercentage)}%
                      </div>
                    </button>
  
                    <button
                      onClick={() => initiateBet('no')}
                      disabled={isPlacingBet}
                      className="p-4 rounded-lg border text-center border-red-500 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium">NON</div>
                      <div className="text-sm text-gray-500">
                        {Math.round(noPercentage)}%
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Connectez-vous pour parier</p>
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-blue-600 hover:underline"
                  >
                    Se connecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
  
        <BetConfirmationModal
          isOpen={!!confirmationData}
          onClose={() => setConfirmationData(null)}
          onConfirm={handleConfirmBet}
          prediction={confirmationData?.prediction}
          amount={confirmationData?.amount}
          odds={odds}
          isLoading={isPlacingBet}
          question={question}
        />
        <BetSuccessAnimation 
  show={showSuccessAnimation} 
  amount={successData?.amount}
  prediction={successData?.prediction}
/>
      </div>
    );
  };
  
  export default QuestionPage;