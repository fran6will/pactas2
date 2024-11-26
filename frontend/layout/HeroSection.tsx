import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const HeroSection = () => {
  const { user } = useUser();

  return (
    <div className="bg-blue-600">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          {/* Section texte */}
          <div className="text-white max-w-xl">
            <h1 className="text-3xl font-bold text-white mb-2">
              Faire le pari de soutenir demain
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Prédisez l'avenir, soutenez des causes
            </p>
            <p className="text-blue-100 mb-8">
              Participez à la prédiction collective : aidez les organisations à financer leurs projets tout en bénéficiant vous aussi. Gagnant gagnant.
            </p>
            
            {!user && (
              <Link 
                to="/auth" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-6 text-white">
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">10k+</div>
              <div className="text-blue-100">Prédictions</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Organisations</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Précision</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">10K $</div>
              <div className="text-blue-100">Distribués</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;