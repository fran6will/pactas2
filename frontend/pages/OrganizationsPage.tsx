// src/pages/OrganizationsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Coins, Search } from 'lucide-react';
import { organizationService, Organization, OrganizationCategory } from '../services/organization.service';// Définir les catégories disponibles


const CATEGORIES = [
  { id: 'all', label: 'Toutes les catégories' },
  { id: OrganizationCategory.EDUCATION, label: 'Éducation' },
  { id: OrganizationCategory.SANTE, label: 'Santé' },
  { id: OrganizationCategory.ENVIRONNEMENT, label: 'Environnement' },
  { id: OrganizationCategory.CULTURE, label: 'Culture & Arts' },
  { id: OrganizationCategory.SPORT, label: 'Sport' },
  { id: OrganizationCategory.SOCIAL, label: 'Action sociale' },
  { id: OrganizationCategory.TECHNOLOGIE, label: 'Technologie' },
  { id: OrganizationCategory.HUMANITAIRE, label: 'Humanitaire' },
  { id: OrganizationCategory.COMMUNAUTAIRE, label: 'Action communautaire' },
  { id: OrganizationCategory.RECHERCHE, label: 'Recherche' }
];
const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await organizationService.getPublicOrganizations();
        console.log('Fetched organizations:', response); // Pour le debug
        setOrganizations(response);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des organisations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(org => {
    console.log('Filtering org:', org); // Pour le debug
    const matchesSearch = 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      (org.category ? org.category === selectedCategory : false);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organisations</h1>
        <p className="text-gray-600">
          Découvrez les organisations qui font bouger les choses
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-8 space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une organisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 border rounded-lg pl-12 bg-white"
          />
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        </div>

        {/* Catégories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">{organizations.length}</div>
    <div className="text-gray-600">Organisations</div>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">
      {organizations.reduce((sum, org) => sum + (org.questions?.length || 0), 0)}
    </div>
    <div className="text-gray-600">Projets actifs</div>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">
      {(organizations.reduce((sum, org) => sum + (org.wallet || 0), 0)).toFixed(2)}€
    </div>
    <div className="text-gray-600">Collectés</div>
  </div>
</div>

{/* Afficher le nombre d'organisations filtrées pour le debug */}
<div className="text-sm text-gray-500 mb-4">
        {filteredOrganizations.length} organisation(s) trouvée(s)
      </div>

      {/* Liste des organisations */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucune organisation trouvée
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{org.name}</h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
  {org.category 
    ? CATEGORIES.find(c => c.id === org.category)?.label 
    : 'Non catégorisé'}
</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {org.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{org.questions.length} projets</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
  <Coins className="w-4 h-4 mr-2" />
  <span>{(org.wallet || 0).toFixed(2)}€ collectés</span>
</div>
                </div>

                <button
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir l'organisation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;