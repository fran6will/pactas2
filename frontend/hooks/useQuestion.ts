// src/hooks/useQuestion.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.service';

export const useQuestion = (id: string) => {
  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const questionData = await api.get(`/questions/${id}`);
      setQuestion(questionData);
      setError(null);
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  return { 
    question, 
    isLoading, 
    error,
    refresh: fetchQuestion // Expose la fonction de rafraîchissement
  };
};