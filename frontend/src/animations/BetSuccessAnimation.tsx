import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const BetSuccessAnimation = ({ show, amount, prediction }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="transform translate-y-0 opacity-100 transition-all duration-500 animate-bounce-once">
        <div className="bg-white rounded-xl shadow-xl p-6 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Pari placé avec succès!</div>
            <div className="text-sm text-gray-600">
              {amount}€ sur {prediction === 'yes' ? 'OUI' : 'NON'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetSuccessAnimation;