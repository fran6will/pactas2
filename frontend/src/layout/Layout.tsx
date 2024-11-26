import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useMemo } from 'react';

import { 
  Home, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Shield,
  Coins,
  AlertCircle
} from 'lucide-react';
import HeroSection from './HeroSection';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isOrganization, organization } = useUser(); 
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est une organisation en attente ou rejetée
  const isRestrictedOrganization = useMemo(() => {
    return isOrganization && ['pending', 'rejected'].includes(organization?.status || '');
  }, [isOrganization, organization]);

  // Vérifier si l'utilisateur est une organisation approuvée
  const isOrganizationApproved = useMemo(() => {
    return isOrganization && organization?.status === 'approved';
  }, [isOrganization, organization]);

  // Vérifier si on est sur la page d'accueil
  const isHomePage = window.location.pathname === '/';

  const handleStartProject = () => {
    navigate('/auth?tab=register&type=organization');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo et liens principaux */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-indigo-600 ">
             Pacta
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center gap-4">
                {/* Le lien Accueil est toujours visible */}
                <Link to="/" className="btn btn-secondary">
                  <Home className="w-5 h-5 mr-2" />
                  <span>Accueil</span>
                </Link>

                {/* Tableau de bord uniquement si l'organisation n'est pas restreinte */}
                {!isRestrictedOrganization && (
                  <Link to="/dashboard" className="btn btn-secondary">
                    <Settings className="w-5 h-5 mr-2" />
                    <span>Tableau de bord</span>
                  </Link>
                )}

                {/* Admin toujours visible pour les admins */}
                {isAdmin && (
                  <Link to="/admin" className="btn btn-secondary">
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Message d'avertissement pour les organisations restreintes */}
                {isRestrictedOrganization && (
                  <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700">
                      {organization?.status === 'pending' 
                        ? "En attente d'approbation" 
                        : "Compte rejeté"}
                    </span>
                  </div>
                )}

                {/* Solde uniquement si l'utilisateur n'est PAS une organisation 
                    OU si c'est une organisation avec un statut "approved" */}
                {(!isOrganization || isOrganizationApproved) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                    <Coins className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium">{user.tokens} tokens</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Nom de l'utilisateur toujours visible */}
                  <span className="text-sm font-medium hidden sm:block">
                    {user.name}
                  </span>
                  {/* Bouton de déconnexion toujours visible */}
                  <button
                    onClick={logout}
                    className="btn btn-secondary p-2"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/auth" className="btn btn-primary">
                  <UserIcon className="w-5 h-5 mr-2" />
                  <span>Se connecter</span>
                </Link>
                <button
                  onClick={handleStartProject}
                  className="btn btn-secondary"
                >
                  Démarrer un projet
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* HeroSection uniquement sur la page d'accueil */}
        {isHomePage && <HeroSection />}
        
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;