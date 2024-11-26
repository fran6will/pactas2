import React, { useState, useEffect } from 'react';
import { Save, Building2, Mail, Phone, Globe, Users, Target, PiggyBank } from 'lucide-react';
import { api } from '../../services/api.service';

const OrganizationProfileForm = ({ organization, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    mission: '',
    vision: '',
    team: '',
    fundingGoals: '',
    impact: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      facebook: '',
    }
  });

  useEffect(() => {
    if (organization) {
      setFormData(prev => ({
        ...prev,
        ...organization,
      }));
    }
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(`/organizations/profile`, formData);
      if (onUpdate) {
        onUpdate(response);
      }
      // Afficher un message de succès
      alert('Profil mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium">Profil de l'organisation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ces informations seront affichées sur votre page publique
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Informations de base */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-gray-900">
            <Building2 className="w-5 h-5 text-gray-500" />
            Informations générales
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom de l'organisation
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium flex items-center gap-2 text-gray-900">
            <Users className="w-5 h-5 text-gray-500" />
            Qui nous sommes
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description générale
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Présentez votre organisation en quelques phrases..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notre mission
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                rows={3}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Quelle est votre mission principale ?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notre vision
              </label>
              <textarea
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                rows={3}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Quelle est votre vision à long terme ?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notre équipe
            </label>
            <textarea
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Présentez les membres clés de votre équipe..."
            />
          </div>
        </div>

        {/* Objectifs de financement */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium flex items-center gap-2 text-gray-900">
            <PiggyBank className="w-5 h-5 text-gray-500" />
            Utilisation des fonds
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectifs de financement
            </label>
            <textarea
              value={formData.fundingGoals}
              onChange={(e) => setFormData({ ...formData, fundingGoals: e.target.value })}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Comment seront utilisés les fonds récoltés ?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact attendu
            </label>
            <textarea
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Quel impact souhaitez-vous avoir ?"
            />
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium flex items-center gap-2 text-gray-900">
            <Globe className="w-5 h-5 text-gray-500" />
            Réseaux sociaux
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://twitter.com/"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://facebook.com/"
              />
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationProfileForm;