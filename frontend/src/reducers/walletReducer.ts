// src/reducers/walletReducer.ts
interface WalletState {
    balance: number;
    transactions: Transaction[];
    pending: boolean;
    error: string | null;
  }
  
  interface Transaction {
    id: string;
    amount: number;
    type: 'deposit' | 'withdraw' | 'bet' | 'win';
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
  }
  
  type WalletAction =
    | { type: 'ADD_TOKENS'; payload: number }
    | { type: 'PLACE_BET'; payload: number }
    | { type: 'WIN_BET'; payload: number }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'CLEAR_ERROR' };
  
  export const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
    switch (action.type) {
      case 'ADD_TOKENS':
        return {
          ...state,
          balance: state.balance + action.payload,
          transactions: [
            {
              id: Date.now().toString(),
              amount: action.payload,
              type: 'deposit',
              status: 'completed',
              timestamp: new Date()
            },
            ...state.transactions
          ]
        };
      // Ajouter autres cases...
      default:
        return state;
    }
  };