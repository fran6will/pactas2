const API_URL = import.meta.env.VITE_API_URL || 'https://pactas2.onrender.com/api';

export const questionsService = {
  async getAll() {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des questions');
    }

    return response.json();
  },

  async getOne(id: string) {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/questions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la question');
    }

    return response.json();
  },

  async getBets(questionId: string) {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/questions/${questionId}/bets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des paris');
    }

    return response.json();
  },

  async placeBet(data: { questionId: string; amount: number; prediction: 'yes' | 'no' }) {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/bets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du placement du pari');
    }

    return response.json();
  },
};
