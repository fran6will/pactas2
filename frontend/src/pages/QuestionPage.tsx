import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Building2, 
  Calendar,
  Target,
  Lightbulb,
  Users,
  PiggyBank,
  TreePine,
  ExternalLink,
  Globe,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { useQuestion } from '../hooks/useQuestion';
import { betService } from '../services/bet.service';
import { useUser } from '../context/UserContext';
import { api } from '../services/api.service';
import BetConfirmationModal from '../components/modals/BetConfirmationModal';
import BetSuccessAnimation from '../components/animations/BetSuccessAnimation';

export default function QuestionPage() {
  // Existing state management
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
  const [showOrgDetails, setShowOrgDetails] = useState(false);
  const [organizationDetails, setOrganizationDetails] = useState(null);

  // Fetch organization details when question loads
  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (question?.organizationId) {
        try {
          const orgData = await api.get(`/organizations/${question.organizationId}`);
          setOrganizationDetails(orgData);
        } catch (err) {
          console.error('Erreur lors du chargement des détails de l\'organisation:', err);
        }
      }
    };

    fetchOrgDetails();
  }, [question?.organizationId]);

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
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          Retour aux questions
        </button>
      </div>
    );
  }



  return (

    
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl overflow-hidden mb-6">
        {/* Question Header */}
 <div className="bg-white rounded-xl p-6 mb-6">
 <h1 className="text-2xl font-medium mb-3">{question.title}</h1>
 <div className="flex items-center gap-3 text-sm text-gray-500">
   <Calendar className="w-4 h-4" />
   <span>Résolution: {format(new Date(question.deadline), 'dd MMMM yyyy', { locale: fr })}</span>
 </div>
</div>
        {/* Organization Header */}
        <div className="p-6 border-l-4 border-indigo-500">
  <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide font-medium">Une question propulsée par</div>
  <div className="flex items-center justify-between">
    <Link 
      to={`/organizations/${question.organizationId}`}
      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
    >
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
        <Building2 className="w-8 h-8 text-indigo-600" />
      </div>
      <div>
        <h2 className="text-xl font-medium text-gray-900">{organizationDetails?.name || question.organization}</h2>
        <p className="text-sm text-gray-500">{organizationDetails?.description || 'Organisation vérifiée'}</p>
      </div>
    </Link>
    <button
      onClick={() => setShowOrgDetails(!showOrgDetails)}
      className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
    >
      {showOrgDetails ? 'Masquer les détails' : 'Voir les détails'}
      <ExternalLink className="w-4 h-4" />
    </button>
  </div>

          {showOrgDetails && organizationDetails && (
            <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <h3>Notre mission</h3>
                  </div>
                  <p className="text-sm text-gray-600">{organizationDetails.mission}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <h3>Notre vision</h3>
                  </div>
                  <p className="text-sm text-gray-600">{organizationDetails.vision}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h3>Notre équipe</h3>
                  </div>
                  <p className="text-sm text-gray-600">{organizationDetails.team}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <PiggyBank className="w-4 h-4 text-indigo-600" />
                    <h3>Objectifs de financement</h3>
                  </div>
                  <p className="text-sm text-gray-600">{organizationDetails.fundingGoals}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <TreePine className="w-4 h-4 text-indigo-600" />
                    <h3>Impact attendu</h3>
                  </div>
                  <p className="text-sm text-gray-600">{organizationDetails.impact}</p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  {organizationDetails.website && (
                    <a href={organizationDetails.website} target="_blank" rel="noopener noreferrer" 
                       className="text-gray-600 hover:text-indigo-600 transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {organizationDetails.twitterUrl && (
                    <a href={organizationDetails.twitterUrl} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 hover:text-indigo-600 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {organizationDetails.linkedinUrl && (
                    <a href={organizationDetails.linkedinUrl} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 hover:text-indigo-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {organizationDetails.facebookUrl && (
                    <a href={organizationDetails.facebookUrl} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 hover:text-indigo-600 transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
 
    

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">À propos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{question.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Source</h3>
              <p className="text-gray-600 text-sm">{question.source}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Distribution des paris</h3>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-green-500/50 transition-all"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-600">
              <div>OUI: {Math.round(yesPercentage)}% ({question.totalYes}€)</div>
              <div>NON: {Math.round(noPercentage)}% ({question.totalNo}€)</div>
            </div>
          </div>
        </div>

        {/* Betting Interface */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl p-6 sticky top-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Placer une mise</h2>

            {user ? (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Votre solde</div>
                  <div className="font-medium text-gray-900">{user.tokens}€</div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
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
                    className="w-full p-3 border rounded-lg text-sm"
                    placeholder="20"
                    disabled={isPlacingBet}
                  />
                  {betError && (
                    <p className="mt-1 text-xs text-red-600">{betError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => initiateBet('yes')}
                    disabled={isPlacingBet}
                    className="p-3 rounded-lg border text-center border-green-500 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-sm font-medium">OUI</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(yesPercentage)}%
                    </div>
                  </button>

                  <button
                    onClick={() => initiateBet('no')}
                    disabled={isPlacingBet}
                    className="p-3 rounded-lg border text-center border-red-500 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-sm font-medium">NON</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(noPercentage)}%
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">Connectez-vous pour parier</p>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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
}
  
  