// src/hooks/useAdmin.ts
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export const useAdmin = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin ?? false;

  const requireAdmin = () => {
    if (!isAdmin) {
      navigate('/');
    }
  };

  return { isAdmin, requireAdmin };
};