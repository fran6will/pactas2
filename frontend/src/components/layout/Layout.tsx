import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Settings, Shield, UserIcon, LogOut, Coins, AlertCircle } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isOrganization, organization } = useUser();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isRestrictedOrganization = isOrganization && ['pending', 'rejected'].includes(organization?.status || '');
  const isOrganizationApproved = isOrganization && organization?.status === 'approved';
  const isHomePage = window.location.pathname === '/';

  const handleStartProject = () => {
    navigate('/auth?tab=register&type=organization');
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Pacta
              </Link>
            </div>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/" className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900">
                  <Home className="w-5 h-5 mr-2" />
                  <span>Accueil</span>
                </Link>
                {!isRestrictedOrganization && (
                  <Link to="/dashboard" className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900">
                    <Settings className="w-5 h-5 mr-2" />
                    <span>Tableau de bord</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900">
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {isRestrictedOrganization && (
                    <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-700">
                        {organization?.status === 'pending' ? "En attente d'approbation" : "Compte rejeté"}
                      </span>
                    </div>
                  )}
                  {(!isOrganization || isOrganizationApproved) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                      <Coins className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">{user.tokens} tokens</span>
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                  <button onClick={logout} className="p-2 text-gray-600 hover:text-gray-900">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/auth" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <UserIcon className="w-5 h-5 mr-2" />
                    <span>Se connecter</span>
                  </Link>
                  <button onClick={handleStartProject} className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
                    Démarrer un projet
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Accueil
                </Link>
                {!isRestrictedOrganization && (
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="block w-full px-3 py-2 text-center rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  Se connecter
                </Link>
                <button
                  onClick={handleStartProject}
                  className="block w-full mt-2 px-3 py-2 text-center rounded-md text-base font-medium border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                >
                  Démarrer un projet
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {isHomePage && <HeroSection />}
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
