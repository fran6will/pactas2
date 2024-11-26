import { useState } from 'react';
import { Tag, X, TrendingUp, Clock, CalendarDays, Flame, Filter } from 'lucide-react';

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  totalQuestions: number;
}

interface FilterState {
  tags: string[];
  showResolved: boolean;
  sortBy: 'recent' | 'popular' | 'endingSoon';
  minAmount?: number;
}

export const QuestionFilters: React.FC<FilterProps> = ({ onFilterChange, totalQuestions }) => {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    showResolved: true,
    sortBy: 'recent'
  });
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.tags.length > 0) count++;
    if (!filters.showResolved) count++;
    if (filters.sortBy !== 'recent') count++;
    if (filters.minAmount) count++;
    return count;
  };

  return (
    <div className="mb-6">
      {/* Quick Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>{totalQuestions} questions</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {getActiveFiltersCount()} filtres actifs
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const newFilters = { ...filters, sortBy: 'recent' };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
              filters.sortBy === 'recent' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Plus récentes
          </button>

          <button
            onClick={() => {
              const newFilters = { ...filters, sortBy: 'popular' };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
              filters.sortBy === 'popular' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Populaires
          </button>

          <button
            onClick={() => {
              const newFilters = { ...filters, sortBy: 'endingSoon' };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
              filters.sortBy === 'endingSoon' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Se termine bientôt
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <Filter className="w-4 h-4" />
            Plus de filtres
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* Tags */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Catégories
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.tags.includes(tag.id)
                      ? `bg-${tag.color}-100 text-${tag.color}-800`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Montant minimum */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Montant minimum de la cagnotte
            </h3>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map(amount => (
                <button
                  key={amount}
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      minAmount: filters.minAmount === amount ? undefined : amount
                    };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm ${
                    filters.minAmount === amount
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {amount}$+
                </button>
              ))}
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showResolved}
                onChange={(e) => {
                  const newFilters = { ...filters, showResolved: e.target.checked };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Afficher les questions résolues</span>
            </label>
          </div>

          {/* Filtres actifs */}
          {filters.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-500 mb-2">Filtres actifs</div>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId)!;
                  return (
                    <div
                      key={tagId}
                      className={`bg-${tag.color}-50 text-${tag.color}-700 px-2 py-1 rounded-full text-sm flex items-center gap-1`}
                    >
                      {tag.label}
                      <button
                        onClick={() => handleTagToggle(tagId)}
                        className="hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reset button */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  const newFilters = {
                    tags: [],
                    showResolved: true,
                    sortBy: 'recent'
                  };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};