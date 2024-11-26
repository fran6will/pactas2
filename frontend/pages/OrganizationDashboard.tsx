import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api.service';
import { 
    PlusCircle, 
    LayoutDashboard, 
    Settings,
    Building2, 
    CreditCard, 
    Archive,
    AlertCircle
} from 'lucide-react';
import TransactionHistory from '../components/TransactionHistory';

import QuestionCardEnhanced from '../components/questions/QuestionCardOrg';
import OrganizationProfileForm from '../components/org/OrganizationProfileForm';
import WithdrawalTab from '../components/org/WithdrawalTab';
const tags = [
    { id: 'POLITIQUE', label: 'Politique', color: 'blue' },
    { id: 'ENVIRONNEMENT', label: 'Environnement', color: 'green' },
    { id: 'DIVERTISSEMENT', label: 'Divertissement', color: 'purple' },
    { id: 'ART_CULTURE', label: 'Art & Culture', color: 'pink' },
    { id: 'SPORT', label: 'Sport', color: 'orange' },
    { id: 'TECHNOLOGIE', label: 'Technologie', color: 'indigo' },
    { id: 'ECONOMIE', label: 'Économie', color: 'yellow' },
    { id: 'SOCIAL', label: 'Social', color: 'red' },
    { id: 'EDUCATION', label: 'Éducation', color: 'cyan' },
    { id: 'SANTE', label: 'Santé', color: 'emerald' },
  ];
  
  
const OrganizationDashboard = () => {
    const { user, refreshUser } = useUser();
    const [questions, setQuestions] = useState([]);
    
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  const navigate = useNavigate();

  const availableQuestions = user?.organization?.availableQuestions || 0;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    source: '',
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/organizations/questions');
        setQuestions(response);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProfileUpdate = () => {
    // Rafraîchir les données après mise à jour du profil si nécessaire
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/organizations/questions', formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        source: '',
        tags: [],
      });

      // Rafraîchir les données
      await Promise.all([
        refreshUser(), // Pour mettre à jour le nombre de questions disponibles
        loadData()    // Pour rafraîchir la liste des questions
      ]);

    } catch (error: any) {
      console.error('Error creating question:', error);
      // Gestion spécifique de l'erreur de questions insuffisantes
      if (error.response?.data?.code === 'NO_QUESTIONS_AVAILABLE') {
        setFormError('Vous n\'avez plus de questions disponibles. Veuillez en acheter.');
        setTimeout(() => {
          setIsCreateModalOpen(false);
          navigate('/purchase');
        }, 3000);
      } else {
        setFormError('Erreur lors de la création de la question');
      }
    } finally {
      setIsSubmitting(false);
    }
};

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* En-tête */}
      <div className="px-4 py-5 sm:px-6">
      <div className="flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Tableau de bord Organisation
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Gérez vos questions et suivez les performances
      </p>
    </div>
    {activeTab === 'questions' && (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Questions disponibles: <span className="font-bold text-blue-600">{availableQuestions}</span>
        </div>
        {availableQuestions > 0 ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nouvelle Question
          </button>
        ) : (
          <button
            onClick={() => navigate('/purchase')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Acheter des questions
          </button>
        )}
      </div>
    )}
  </div>

        {/* Onglets de navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('questions')}
              className={`${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center gap-2`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Questions
            </button>
            
            <button
              onClick={() => setActiveTab('transactions')}
              className={`${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center gap-2`}
            >
              <Archive className="w-5 h-5" />
              Transactions
            </button>

            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`${
                activeTab === 'withdrawal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center gap-2`}
            >
              <CreditCard className="w-5 h-5" />
              Retrait de fonds
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center gap-2`}
            >
              <Settings className="w-5 h-5" />
              Profil
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === 'profile' ? (
              <OrganizationProfileForm
                organization={user?.organization}
                onUpdate={handleProfileUpdate}
              />
            ) : activeTab === 'withdrawal' ? (
              <WithdrawalTab organization={user?.organization} />
            ) : activeTab === 'questions' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questions.map((question) => (
                  <QuestionCardEnhanced key={question.id} question={question} />
                ))}
                {questions.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">Aucune question</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par créer votre première question
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <TransactionHistory />
            )}
          </>
        )}
      </div>
      {/* Modal de création */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Créer une nouvelle question
              </h2>
              <p className="text-sm text-gray-500 mt-1">
            Questions restantes : {availableQuestions}
          </p>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la question
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Ex: La France va-t-elle gagner l'Euro 2024 ?"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Décrivez le contexte et les conditions de résolution..."
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Date limite
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                  Source de vérification
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Ex: www.uefa.com/euro2024"
                />
              </div>
              <div>
               
                <div className="flex flex-wrap gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
    Tags
  </label>
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <button
        key={tag.id}
        type="button"
        onClick={() => {
          setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag.id)
              ? prev.tags.filter(t => t !== tag.id)
              : [...prev.tags, tag.id]
          }))
        }}
        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          formData.tags.includes(tag.id)
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {tag.label}
        {formData.tags.includes(tag.id) && (
          <span className="ml-1">✓</span>
        )}
      </button>
    ))}
  </div>
</div>
{formData.tags.length > 0 && (
  <p className="mt-2 text-sm text-gray-500">
    {formData.tags.length} tag{formData.tags.length > 1 ? 's' : ''} sélectionné{formData.tags.length > 1 ? 's' : ''}
  </p>
)}
                </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    'Créer la question'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;