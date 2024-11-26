// src/types/organization.ts

export interface Organization {
    id: string;
    name: string;
    email: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface OrganizationSubmission {
    name: string;
    email: string;
    password: string;
    description: string;
  }
  
  export interface OrganizationResponse {
    organization: Organization;
    token: string;
  }