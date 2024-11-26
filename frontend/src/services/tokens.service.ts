// src/services/tokens.service.ts
interface Transaction {
    id: string;
    userId: string;
    type: 'bet' | 'win' | 'deposit' | 'withdraw';
    amount: number;
    timestamp: Date;
    questionId?: string;
    status: 'pending' | 'completed' | 'failed';
  }
  
  export const tokensService = {
    // Placer une mise
    async placeBet(userId: string, questionId: string, amount: number, prediction: 'yes' | 'no') {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        type: 'bet',
        amount: -amount,
        timestamp: new Date(),
        questionId,
        status: 'completed'
      };
  
      // Stocker la transaction localement
      const transactions = this.getTransactions(userId);
      transactions.push(transaction);
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
  
      return transaction;
    },
  
    // Récupérer les gains
    async claimWinnings(userId: string, questionId: string, amount: number) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        type: 'win',
        amount: amount,
        timestamp: new Date(),
        questionId,
        status: 'completed'
      };
  
      const transactions = this.getTransactions(userId);
      transactions.push(transaction);
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
  
      return transaction;
    },
  
    // Obtenir l'historique des transactions
    getTransactions(userId: string): Transaction[] {
      const stored = localStorage.getItem(`transactions_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
  };