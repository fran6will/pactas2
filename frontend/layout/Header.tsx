// src/components/layout/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Wallet, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            PrédictSocial
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{user.tokens}$</span>
                </div>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
                  {user.name}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;