// src/services/questions.service.ts
import { authService } from './auth.service';

const API_URL = 'https://pactas2.onrender.com//api';

export const questionsService = {
  // Récupérer toutes les questions
  async getAll() {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/questions`, {
      headers: {
        Authorization: `Bearer ${token}`, // Ajout du token dans les en-têtes
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des questions');
    }

    return response.json();
  },

  // Récupérer une question spécifique
  async getOne(id: string) {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/questions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Ajout du token dans les en-têtes
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la question');
    }

    return response.json();
  },

  // Récupérer les paris sur une question spécifique
  async getBets(questionId: string) {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/questions/${questionId}/bets`, {
      headers: {
        Authorization: `Bearer ${token}`, // Ajout du token dans les en-têtes
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des paris');
    }

    return response.json();
  },

  // Placer un pari
  async placeBet(data: {
    questionId: string;
    amount: number;
    prediction: 'yes' | 'no';
  }) {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/bets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Ajout du token dans les en-têtes
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du placement du pari');
    }

    return response.json();
  },
};
