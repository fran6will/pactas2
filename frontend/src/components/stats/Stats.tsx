// src/components/stats/Stats.tsx
import { Award, BarChart3, TrendingUp, Coins } from 'lucide-react';
import BuyTokensForm from '../../BuyTokensForm';  // Corrigé l'import

interface StatsProps {
  user: any;
  stats: {
    totalBets: number;
    wonBets: number;
    lostBets: number;
    totalWinnings: number;
    totalLosses: number;
    winRate: number;
    activeQuestions: number;
  } | null;
}

const formatAmount = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};


const AmountDisplay = ({ amount, className }: { amount: number, className?: string }) => (
  <div className={`flex items-center gap-1 ${className || ''}`}>
    <span>{amount > 0 ? '+' : ''}{formatAmount(amount)}</span>
    <Coins className="w-4 h-4 text-yellow-500" />
  </div>
);

export const Stats = ({ user, stats }: StatsProps) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-12 gap-6 mb-8">
      {/* Solde actuel et achat de tokens */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white rounded-xl p-6 shadow-sm h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-600 text-lg">Solde actuel</h2>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-6">
            <AmountDisplay amount={user?.tokens || 0} />
          </div>
          <BuyTokensForm />
        </div>
      </div>

      {/* Performance et paris actifs */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-6">
            {/* Performance */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium">Performance</h3>
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {Math.round(stats.winRate * 100)}%
              </div>
              <p className="text-sm text-gray-500">
                {stats.wonBets} gains / {stats.totalBets} paris
              </p>
            </div>

            {/* Paris actifs */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium">Paris actifs</h3>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {stats.activeQuestions}
              </div>
              <div className="text-sm text-gray-500">
                En cours de résolution
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bilan financier */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white rounded-xl p-6 shadow-sm h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Bilan</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Gains totaux</div>
              <div className="text-3xl font-bold text-green-500">
                <AmountDisplay amount={stats.totalWinnings} />
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-1">Pertes totales</div>
              <div className="text-3xl font-bold text-red-500">
                <AmountDisplay amount={-stats.totalLosses} />
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-1">Bilan net</div>
              <div className={`text-3xl font-bold ${
                stats.totalWinnings - stats.totalLosses > 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                <AmountDisplay amount={stats.totalWinnings - stats.totalLosses} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;