import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Flame, Building2, Users, Tag, CheckCircle, Clock } from 'lucide-react';
import { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCardEnhanced = ({ question }: QuestionCardProps) => {
  const navigate = useNavigate();
  const totalPool = question.totalYes + question.totalNo;
  const yesPercentage = (question.totalYes / totalPool) * 100 || 0;
  const noPercentage = (question.totalNo / totalPool) * 100 || 0;
  const totalBets = question.bets?.length || 0;

  const formattedDeadline = typeof question.deadline === 'string'
    ? format(new Date(question.deadline), 'dd MMMM yyyy', { locale: fr })
    : format(question.deadline, 'dd MMMM yyyy', { locale: fr });

  const formattedResolvedAt = question.resolvedAt
    ? format(new Date(question.resolvedAt), 'dd MMMM yyyy', { locale: fr })
    : null;

  const handlePredictionClick = (prediction: 'yes' | 'no') => {
    navigate(`/question/${question.id}?predict=${prediction}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border hover:border-blue-200">
      <div className="flex flex-col gap-4">
        {/* Titre et Organisation */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">
            <Link 
              to={`/question/${question.id}`} 
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {question.title}
            </Link>
          </h3>
          
        </div>

        {/* Statut et Résolution */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              question.status === 'active'
                ? 'bg-green-100 text-green-800'
                : question.status === 'closed'
                ? 'bg-gray-100 text-gray-800'
                : question.status.includes('resolved')
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {question.status === 'active'
              ? 'Active'
              : question.status === 'closed'
              ? 'Fermée'
              : question.status.includes('resolved')
              ? 'Résolue'
              : 'Inconnue'}
          </span>
          {formattedResolvedAt && (
            <div className="flex items-center gap-1 text-gray-500">
              <CheckCircle className="w-4 h-4" />
              <span>Résolue le {formattedResolvedAt}</span>
            </div>
          )}
        </div>

        {/* Date limite, Cagnotte et Nombre de paris */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Résolution: {formattedDeadline}
          </span>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {totalPool}$
            </div>
            {totalPool > 5000 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-sm">Populaire</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {question.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                <Tag className="w-4 h-4 mr-1" />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Barres de progression */}
        <div className="space-y-4">
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-green-200"
              style={{ width: `${yesPercentage}%` }}
            />
            <div 
              className="absolute top-0 h-full bg-red-200"
              style={{ width: `${noPercentage}%`, left: `${yesPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <button
              onClick={() => handlePredictionClick('yes')}
              className="bg-gray-50 p-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>OUI</span>
                <span className="font-medium">{yesPercentage.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {question.totalYes}$ misés
              </div>
            </button>

            <button
              onClick={() => handlePredictionClick('no')}
              className="bg-gray-50 p-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>NON</span>
                <span className="font-medium">{noPercentage.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {question.totalNo}$ misés
              </div>
            </button>
          </div>

          {/* Information sur le nombre de parieurs */}
          <div className="flex justify-end items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{totalBets} paris</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCardEnhanced;
