import React from 'react';
import { ArrowRight, Recycle, Coins, Target, Users, Building2, Sparkles } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* En-tête */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-4">Comment ça fonctionne ?</h1>
        <p className="text-xl text-gray-600">
          Découvrez comment Pacta permet de financer des projets inspirants tout en récompensant la sagesse collective.
        </p>
      </div>

      {/* Section Principe */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Le principe</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 leading-relaxed mb-4">
            Pacta est une plateforme qui permet aux organisations de lever des fonds en créant des questions prédictives. Les participants misent des tokens sur les résultats, et les gains générés sont redistribués entre l'organisation et les gagnants.
          </p>
          <p className="text-gray-600 leading-relaxed">
            La particularité ? Les tokens gagnés ne peuvent pas être convertis en argent, mais doivent être réinvestis dans d'autres projets sur la plateforme. C'est un cycle vertueux qui garantit que l'argent continue de circuler pour soutenir des initiatives positives.
          </p>
        </div>
      </section>

      {/* Section Étapes */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Les étapes</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
            <div className="flex-shrink-0">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">1. Les organisations créent des questions</h3>
              <p className="text-gray-600">
                Les organisations proposent des questions prédictives liées à leurs objectifs ou à leur domaine d'expertise.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Les participants misent des tokens</h3>
              <p className="text-gray-600">
                Les utilisateurs peuvent acheter des tokens et les miser sur "OUI" ou "NON" pour chaque question.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
            <div className="flex-shrink-0">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. La question est résolue</h3>
              <p className="text-gray-600">
                À la date limite, la réponse est vérifiée et la cagnotte est distribuée.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
            <div className="flex-shrink-0">
              <Recycle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. Le cycle continue</h3>
              <p className="text-gray-600">
                Les tokens gagnés sont réinvestis dans de nouveaux projets, créant un cycle vertueux de financement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Répartition */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Répartition des gains</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-bold text-xl text-blue-600 mb-2">47.5%</div>
              <div className="text-gray-600">Pour les gagnants</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-bold text-xl text-green-600 mb-2">47.5%</div>
              <div className="text-gray-600">Pour l'organisation</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-bold text-xl text-purple-600 mb-2">5%</div>
              <div className="text-gray-600">Frais de plateforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center bg-blue-50 rounded-xl p-8">
        <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
        <p className="text-gray-600 mb-6">
          Rejoignez notre communauté et participez au financement de projets inspirants.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un compte
          </button>
          <button
            onClick={() => window.location.href = '/questions'}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voir les questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;