import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';
import WithdrawalsManagement from './WithdrawalsManagement';


import { api } from '../services/api.service';
import { 
  Edit2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Search,
  DollarSign,
  Filter,
  LayoutGrid,
  Building2,
  Mail,
  Calendar,
  Clock
} from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  organization: {
    id: string;
    name: string;
  };
  deadline: string;
  source: string;
  status: 'active' | 'closed' | 'resolved_yes' | 'resolved_no';
  totalYes: number;
  totalNo: number;
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: string;
  name: string;
  email: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

type AdminTab = 'questions' | 'organizations' | 'withdrawals';


const AdminPage = () => {
  // État pour la gestion des onglets
  const [activeTab, setActiveTab] = useState<AdminTab>('questions');

  // États pour la gestion des questions (votre code existant)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la gestion des organisations
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [orgFilter, setOrgFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Fonction pour charger les questions
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/questions');
      const questionsWithTotals = response.map((question: any) => {
        const bets = question.bets || [];
        const totalYes = bets
          .filter((bet: any) => bet.prediction === 'yes')
          .reduce((sum: number, bet: any) => sum + bet.amount, 0);

        const totalNo = bets
          .filter((bet: any) => bet.prediction === 'no')
          .reduce((sum: number, bet: any) => sum + bet.amount, 0);

        const { bets: _, organization, ...questionWithoutBets } = question;

        return {
          ...questionWithoutBets,
          organization: organization?.name || 'Non spécifié',
          totalYes,
          totalNo,
          totalPool: totalYes + totalNo,
        };
      });

      setQuestions(questionsWithTotals);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des questions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les organisations
  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/organizations');
      setOrganizations(response);
    } catch (error) {
      console.error('Error:', error);
      setError('Erreur lors du chargement des organisations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions();
    } else {
      fetchOrganizations();
    }
  }, [activeTab]);

  // Fonctions de gestion des questions (votre code existant)
  const handleStatusChange = async (questionId: string, newStatus: Question['status']) => {
    try {
      await api.post(`/admin/questions/${questionId}/status`, { status: newStatus });
      await fetchQuestions();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleResolveQuestion = async (questionId: string, resolution: 'yes' | 'no') => {
    if (!window.confirm('Êtes-vous sûr de vouloir résoudre cette question ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.post(`/admin/questions/${questionId}/resolve`, { resolution });
      await fetchQuestions();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la résolution de la question');
    }
  };

  // Fonctions de gestion des organisations
  const handleApproveOrg = async (orgId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver cette organisation ?')) {
      return;
    }
  
    try {
      // Utiliser le bon endpoint avec le préfixe /admin
      await api.post(`/admin/organizations/${orgId}/approve`);
      await fetchOrganizations();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'approbation');
    }
  };
  
  const handleRejectOrg = (organization: Organization) => {
    setSelectedOrg(organization);
    setIsRejectModalOpen(true);
  };
  
  const confirmRejectOrg = async () => {
    if (!selectedOrg) return;
  
    try {
      // Utiliser le bon endpoint avec le préfixe /admin
      await api.post(`/admin/organizations/${selectedOrg.id}/reject`, {
        reason: rejectionReason,
      });
      await fetchOrganizations();
      setIsRejectModalOpen(false);
      setSelectedOrg(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors du rejet');
    }
  };

  // Filtrage des questions
  const filteredQuestions = questions.filter(q => {
    let statusMatch = true;
    if (filter === 'active') statusMatch = q.status === 'active';
    if (filter === 'closed') statusMatch = q.status === 'closed';
    if (filter === 'resolved') statusMatch = q.status.startsWith('resolved_');

    return statusMatch && 
      (q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       q.organization.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Filtrage des organisations
  const filteredOrganizations = organizations.filter(org => {
    if (orgFilter === 'all') return true;
    return org.status === orgFilter;
  });

  // Fonctions d'affichage des badges de statut
  const getQuestionStatusBadge = (status: Question['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Fermée</span>;
      case 'resolved_yes':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Résolue (Oui)</span>;
      case 'resolved_no':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Résolue (Non)</span>;
      default:
        return null;
    }
  };

  const getOrgStatusBadge = (status: Organization['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Approuvée
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Refusée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Administration</h1>
        
        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Questions
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'organizations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Organisations
              <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                Nouveau
              </span>
            </button>
            <button
    onClick={() => setActiveTab('withdrawals')}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
      activeTab === 'withdrawals'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <DollarSign className="w-4 h-4" />
    Retraits
  </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
      {activeTab === 'withdrawals' ? (
    <WithdrawalsManagement />
  ) : activeTab === 'questions' ? (
          <>
            {/* Votre code existant de gestion des questions */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium">Gestion des Questions</h2>
              <button 
                onClick={() => {
                  setSelectedQuestion(null);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Nouvelle Question
              </button>
            </div>

            {/* Filtres et recherche des questions */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une question..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'all' 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'active'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  Actives
                </button>
                <button
                  onClick={() => setFilter('closed')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'closed'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  }`}
                >
                  Fermées
                </button>
                <button
                  onClick={() => setFilter('resolved')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'resolved'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  Résolues
                </button>
              </div>
            </div>

            {/* Liste des questions */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date limite
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paris
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQuestions.map((question) => (
                        <tr key={question.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{question.title}</div>
                            <div className="text-sm text-gray-500">{question.description.substring(0, 100)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {question.organization}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {format(new Date(question.deadline), 'dd MMM yyyy', { locale: fr })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getQuestionStatusBadge(question.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              Oui: {question.totalYes}$ ({Math.round((question.totalYes / (question.totalYes + question.totalNo || 1)) * 100)}%)
                            </div>
                            <div className="text-sm">
                              Non: {question.totalNo}$ ({Math.round((question.totalNo / (question.totalYes + question.totalNo || 1)) * 100)}%)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedQuestion(question);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Modifier"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              {question.status === 'active' && (
                                <button
                                  onClick={() => handleStatusChange(question.id, 'closed')}
                                  className="p-1 text-yellow-600 hover:text-yellow-800"
                                  title="Fermer les paris"
                                >
                                  <AlertTriangle className="h-5 w-5" />
                                </button>
                              )}
                              {question.status === 'closed' && (
                                <>
                                  <button
                                    onClick={() => handleResolveQuestion(question.id, 'yes')}
                                    className="p-1 text-green-600 hover:text-green-800"
                                    title="Résoudre OUI"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleResolveQuestion(question.id, 'no')}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Résoudre NON"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal d'édition des questions */}
            {isEditModalOpen && (
              <EditQuestionModal
                question={selectedQuestion}
                onClose={() => setIsEditModalOpen(false)}
                onSave={async (updatedQuestion) => {
                  try {
                    if (selectedQuestion) {
                      await api.put(`/admin/questions/${selectedQuestion.id}`, updatedQuestion);
                    } else {
                      await api.post('/admin/questions', updatedQuestion);
                    }
                    await fetchQuestions();
                    setIsEditModalOpen(false);
                  } catch (err) {
                    console.error('Erreur lors de la sauvegarde:', err);
                    alert('Erreur lors de la sauvegarde de la question');
                  }
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* Gestion des organisations */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setOrgFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  orgFilter === 'all'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setOrgFilter('pending')}
                className={`px-4 py-2 rounded-lg ${
                  orgFilter === 'pending'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setOrgFilter('approved')}
                className={`px-4 py-2 rounded-lg ${
                  orgFilter === 'approved'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                Approuvées
              </button>
              <button
                onClick={() => setOrgFilter('rejected')}
                className={`px-4 py-2 rounded-lg ${
                  orgFilter === 'rejected'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                Refusées
              </button>
            </div>

            {/* Liste des organisations */}
            <div className="space-y-4">
              {filteredOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{org.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail className="w-4 h-4" />
                        {org.email}
                      </div>
                    </div>
                    {getOrgStatusBadge(org.status)}
                  </div>

                  <p className="text-gray-600">{org.description}</p>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Demande soumise le {format(new Date(org.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </div>

                    {org.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveOrg(org.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleRejectOrg(org)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredOrganizations.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune organisation à afficher</p>
                </div>
              )}
            </div>

            {/* Modal de rejet d'organisation */}
            {isRejectModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                  <div className="flex items-center gap-2 text-red-600 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-medium">Refuser l'organisation</h3>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Veuillez indiquer la raison du refus. Cette information sera envoyée à l'organisation.
                  </p>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 border rounded-lg mb-4"
                    rows={4}
                    placeholder="Raison du refus..."
                    required
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsRejectModalOpen(false);
                        setSelectedOrg(null);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmRejectOrg}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      disabled={!rejectionReason.trim()}
                    >
                      Confirmer le refus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Composant EditQuestionModal (votre code existant)
const EditQuestionModal = ({ question, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      title: question?.title || '',
      description: question?.description || '',
      organization: typeof question?.organization === 'string'
        ? question.organization
        : (question?.organization?.name || ''),
      deadline: question?.deadline 
        ? new Date(question.deadline).toISOString().split('T')[0]
        : '',
      source: question?.source || '',
    });
  
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
  
    const validate = (data) => {
      const newErrors = {};
      if (!data.title.trim()) newErrors.title = 'Le titre est requis';
      if (!data.description.trim()) newErrors.description = 'La description est requise';
      if (!data.organization.trim()) newErrors.organization = "L'organisation est requise";
      if (!data.deadline) newErrors.deadline = 'La date limite est requise';
      if (!data.source.trim()) newErrors.source = 'La source est requise';
      return newErrors;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
  
      setIsSaving(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        setIsSaving(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {question ? 'Modifier la question' : 'Nouvelle question'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: null });
                  }
                }}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : ''
                }`}
                placeholder="Ex: La France va-t-elle gagner l'Euro 2024 ?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
  
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: null });
                  }
                }}
                rows={4}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : ''
                }`}
                placeholder="Décrivez la question en détail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
  
            {/* Organisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organisation
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => {
                  setFormData({ ...formData, organization: e.target.value });
                  if (errors.organization) {
                    setErrors({ ...errors, organization: null });
                  }
                }}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.organization ? 'border-red-500' : ''
                }`}
                placeholder="Nom de l'organisation"
              />
              {errors.organization && (
                <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
              )}
            </div>
  
            {/* Date limite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date limite
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => {
                  setFormData({ ...formData, deadline: e.target.value });
                  if (errors.deadline) {
                    setErrors({ ...errors, deadline: null });
                  }
                }}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.deadline ? 'border-red-500' : ''
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
              )}
            </div>
  
            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source de vérification
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => {
                  setFormData({ ...formData, source: e.target.value });
                  if (errors.source) {
                    setErrors({ ...errors, source: null });
                  }
                }}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.source ? 'border-red-500' : ''
                }`}
                placeholder="Ex: Site officiel de l'UEFA"
              />
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source}</p>
              )}
            </div>
  
            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default AdminPage;