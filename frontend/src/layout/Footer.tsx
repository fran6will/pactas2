import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="col-span-2">
            <h3 className="text-lg font-bold text-blue-600 mb-4">PrédictSocial</h3>
            <p className="text-gray-600 mb-4">
              Plateforme de prédiction collective pour soutenir des causes et prendre de meilleures décisions.
            </p>
          </div>

          {/* Liens Rapides */}
          <div>
            <h4 className="font-medium mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-gray-600 hover:text-blue-600">
                  Questions
                </Link>
              </li>
              <li>
                <Link to="/organizations" className="text-gray-600 hover:text-blue-600">
                  Organisations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:contact@predictsocial.com" 
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/predictsocial" 
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/predictsocial" 
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PrédictSocial. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;