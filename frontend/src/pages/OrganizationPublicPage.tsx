import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Users, 
  Target,
  PiggyBank,
  LineChart,
  Calendar,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { api } from "../services/api.service";
import QuestionCard from '../components/questions/QuestionCard';

const OrganizationPublicPage = () => {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [orgData, questionsData] = await Promise.all([
          api.get(`/organizations/${id}`),
          api.get(`/organizations/${id}/questions`)
        ]);
        setOrganization(orgData);
        setQuestions(questionsData);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Organisation non trouvée"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {organization.name}
            </h1>
            <p className="text-lg text-gray-600">
              {organization.description}
            </p>
          </div>

          {/* Statistiques */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {questions.length}
              </div>
              <div className="text-sm text-gray-600">Questions créées</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {organization.stats?.totalRaised || 0}€
              </div>
              <div className="text-sm text-gray-600">Fonds levés</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {organization.stats?.activeQuestions || 0}
              </div>
              <div className="text-sm text-gray-600">Questions actives</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {organization.stats?.accuracy || '95'}%
              </div>
              <div className="text-sm text-gray-600">Précision</div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="mt-8 flex flex-wrap gap-6 text-gray-600">
            {organization.email && (
              <a href={`mailto:${organization.email}`} className="flex items-center gap-2 hover:text-blue-600">
                <Mail className="w-5 h-5" />
                {organization.email}
              </a>
            )}
            {organization.phone && (
              <a href={`tel:${organization.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                <Phone className="w-5 h-5" />
                {organization.phone}
              </a>
            )}
            {organization.website && (
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                <Globe className="w-5 h-5" />
                Site web
              </a>
            )}
            {/* Réseaux sociaux */}
            {organization.socialLinks?.twitter && (
              <a href={organization.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                <Twitter className="w-5 h-5" />
                Twitter
              </a>
            )}
            {organization.socialLinks?.linkedin && (
              <a href={organization.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
            )}
            {organization.socialLinks?.facebook && (
              <a href={organization.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                <Facebook className="w-5 h-5" />
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-t">
          <nav className="flex gap-8 px-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              À propos
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-8">
        {activeTab === 'about' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* À propos de nous */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Qui nous sommes
              </h2>
              
              {organization.mission && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Notre mission</h3>
                  <p className="text-gray-600">{organization.mission}</p>
                </div>
              )}

              {organization.vision && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Notre vision</h3>
                  <p className="text-gray-600">{organization.vision}</p>
                </div>
              )}

              {organization.team && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Notre équipe</h3>
                  <p className="text-gray-600">{organization.team}</p>
                </div>
              )}
            </div>

            {/* Utilisation des fonds */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-blue-600" />
                Utilisation des fonds
              </h2>
              
              {organization.fundingGoals && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Objectifs de financement</h3>
                  <p className="text-gray-600">{organization.fundingGoals}</p>
                </div>
              )}

              {organization.impact && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Impact attendu</h3>
                  <p className="text-gray-600">{organization.impact}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
            {questions.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune question pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPublicPage;