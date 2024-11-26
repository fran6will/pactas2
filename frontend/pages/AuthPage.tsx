import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../services/api.service';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    description: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();
  const location = useLocation();

  // Gérer les paramètres de la query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const type = searchParams.get('type');

    if (tab === 'register') {
      setIsRegister(true);
      setIsOrganization(type === 'organization');
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const requestData = {
        email: formData.email,
        password: formData.password,
        ...(isRegister && {
          name: formData.name,
          userType: isOrganization ? 'organization' : 'user',
          description: formData.description
        })
      };

      const response = await api.post(endpoint, requestData);
      if (response.token) {
        api.setToken(response.token);
        setUser(response.user);

        if (response.user.userType === 'organization') {
          if (isRegister || response.user.organization?.status === 'pending') {
            navigate('/organization/pending-approval');
          } else if (response.user.organization?.status === 'approved') {
            navigate('/organization/dashboard');
          }
        } else if (response.user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la soumission.');
    } finally {
      setIsLoading(false);
    }
  };

  // Définir correctement handleStartProject
  const handleStartProject = () => {
    setIsRegister(true);
    setIsOrganization(true);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      description: ''
    });
    navigate('/auth?tab=register&type=organization');
  };

  const handleRegisterToggle = () => {
    setIsRegister(!isRegister);
    setIsOrganization(false);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      description: ''
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </h2>
          {isRegister && (
            <div className="mt-4">
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOrganization(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    !isOrganization
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Utilisateur
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrganization(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isOrganization
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Organisation
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {isOrganization ? "Nom de l'organisation" : "Nom"}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder={isOrganization ? "Nom de votre organisation" : "Votre nom"}
              />
            </div>
          )}
  
          {isRegister && isOrganization && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description de l'organisation
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                rows={3}
                placeholder="Décrivez votre organisation..."
              />
            </div>
          )}
  
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 block w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>
  
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
  
          {isRegister && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
        </div>
  
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : isRegister ? (
              "S'inscrire"
            ) : (
              "Se connecter"
            )}
          </button>
        </div>
        </form>

<div className="text-center">
  <button
    type="button"
    onClick={handleRegisterToggle}
    className="text-sm text-blue-600 hover:text-blue-500"
  >
    {isRegister
      ? "Déjà un compte ? Se connecter"
      : "Pas encore de compte ? S'inscrire"}
  </button>
  {!isRegister && (
    <button
      type="button"
      onClick={handleStartProject}
      className="ml-4 text-sm text-blue-600 hover:text-blue-500"
    >
      Démarrer un projet
    </button>
  )}
</div>
</div>
</div>
);
};

export default AuthPage;