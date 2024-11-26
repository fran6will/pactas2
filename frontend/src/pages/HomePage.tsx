import { useState, useEffect } from 'react';
import QuestionCard from '../components/questions/QuestionCard';
import { QuestionFilters } from '../components/QuestionFilters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  deadline: string;
  status: string;
  resolvedAt?: string;
  totalYes: number;
  totalNo: number;
  organization: {
    id: string;
    name: string;
  };
}

interface FilterState {
  tags: string[];
  showResolved: boolean;
  sortBy: 'recent' | 'popular' | 'endingSoon';
  minAmount?: number;
}

const HomePage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    showResolved: true,
    sortBy: 'popular'
  });

  const QUESTIONS_PER_PAGE = 9;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('Fetching questions...');
        const response = await fetch('http://localhost:3000/api/questions');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Questions fetched:', data);
        setQuestions(data);
        setFilteredQuestions(data);
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    console.log('Applying filters:', filters);
    const applyFilters = () => {
      let updatedQuestions = [...questions];

      // Filtrer par tags
      if (filters.tags.length > 0) {
        updatedQuestions = updatedQuestions.filter((q) => {
          const hasMatchingTag = q.tags?.some(tag => filters.tags.includes(tag));
          console.log('Question:', q.title, 'Tags:', q.tags, 'Has matching tag:', hasMatchingTag);
          return hasMatchingTag;
        });
      }

      // Filtrer par montant minimum
      if (filters.minAmount) {
        updatedQuestions = updatedQuestions.filter(
          (q) => q.totalYes + q.totalNo >= filters.minAmount!
        );
      }

      // Filtrer par résolu/non résolu
      if (!filters.showResolved) {
        updatedQuestions = updatedQuestions.filter(
          (q) => !q.status.startsWith('resolved_')
        );
      }

      // Trier les questions
      updatedQuestions.sort((a, b) => {
        switch (filters.sortBy) {
          case 'popular':
            return (b.totalYes + b.totalNo) - (a.totalYes + a.totalNo);
          case 'endingSoon':
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          case 'recent':
          default:
            return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
      });

      console.log('Filtered questions:', updatedQuestions.length);
      setFilteredQuestions(updatedQuestions);
      setCurrentPage(1); // Réinitialiser la page quand les filtres changent
    };

    applyFilters();
  }, [filters, questions]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Erreur: {error}</div>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
          }}
          className="text-blue-600 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('New filters:', newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Filtres */}
      <QuestionFilters 
        onFilterChange={handleFilterChange}
        totalQuestions={questions.length}
      />

      {/* Grille des questions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}

        {paginatedQuestions.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucune question ne correspond aux filtres sélectionnés</p>
            <button
              onClick={() => setFilters({
                tags: [],
                showResolved: true,
                sortBy: 'recent'
              })}
              className="mt-2 text-blue-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;