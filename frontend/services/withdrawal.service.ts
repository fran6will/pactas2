// src/services/withdrawal.service.ts
import { api } from './api.service';
import { Withdrawal } from '../types/withdrawal';

export const withdrawalService = {
  async requestWithdrawal(amount: number): Promise<Withdrawal> {
    return api.post('/withdrawals/request', { amount });
  },

  async getWithdrawalHistory(): Promise<Withdrawal[]> {
    return api.get('/withdrawals/history');
  }
};