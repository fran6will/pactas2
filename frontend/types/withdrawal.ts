// src/types/withdrawal.ts
export interface Withdrawal {
    id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    processedAt?: string;
    error?: string;
  }