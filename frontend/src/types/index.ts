// src/types.ts

export interface Question {
    id: string;
    title: string;
    description: string;
    organizationId: string;
    organization: string;  // Ajout du nom de l'organisation
    deadline: string | Date;  // Support des deux formats
    source: string;
    totalYes: number;
    totalNo: number;
    status: 'active' | 'closed' | 'resolved_yes' | 'resolved_no';  // Mise à jour des status possibles
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }
  
  export interface Organization {
    id: string;
    name: string;
    description: string;
    wallet: number;
    createdAt: string | Date;
    updatedAt: string | Date;
  }
  
  export interface Bet {
    id: string;
    userId: string;
    questionId: string;
    amount: number;
    prediction: 'yes' | 'no';
    createdAt: string | Date;
  }
  
  export interface Transaction {
    id: string;
    userId?: string;
    orgId?: string;
    amount: number;
    type: 'bet' | 'win' | 'org_commission';
    questionId?: string;
    createdAt: string | Date;
  }