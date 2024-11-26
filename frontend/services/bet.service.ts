import { api } from './api.service';

export const betService = {
  async placeBet(questionId: string, amount: number, prediction: 'yes' | 'no') {
    return api.post('/bets', {
      questionId,
      amount,
      prediction
    });
  },

  async getBets(questionId: string) {
    return api.get(`/questions/${questionId}/bets`);
  }
};