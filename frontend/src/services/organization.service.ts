// src/services/organization.service.ts
import { api } from './api.service';

// src/services/organization.service.ts
export interface Organization {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    questions: {
      id: string;
      title: string;
      description: string;
      status: string;
      totalYes: number;
      totalNo: number;
      deadline: string;
    }[];
    user: {
      id: string;
      email: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  }

export interface Question {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  totalYes: number;
  totalNo: number;
}

export enum OrganizationCategory {
    EDUCATION = 'EDUCATION',
    SANTE = 'SANTE',
    ENVIRONNEMENT = 'ENVIRONNEMENT',
    CULTURE = 'CULTURE', 
    SPORT = 'SPORT',
    SOCIAL = 'SOCIAL',
    TECHNOLOGIE = 'TECHNOLOGIE',
    HUMANITAIRE = 'HUMANITAIRE',
    COMMUNAUTAIRE = 'COMMUNAUTAIRE',
    RECHERCHE = 'RECHERCHE'
  }

export const organizationService = {
    async getPublicOrganizations(): Promise<Organization[]> {
      const response = await api.get('/organizations');
      return response;
    },

  async getQuestions(): Promise<Question[]> {
    const response = await api.get('/organization/questions');
    return response;
  },

  async createQuestion(data: {
    title: string;
    description: string;
    deadline: string;
    source: string;
  }): Promise<Question> {
    const response = await api.post('/organization/questions', data);
    return response;
  },

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const response = await api.put(`/organization/questions/${id}`, data);
    return response;
  },

  // Pour les admins
  async getAllOrganizations(): Promise<Organization[]> {
    const response = await api.get('/admin/organizations');
    return response;
  },

  async approveOrganization(id: string): Promise<Organization> {
    const response = await api.post(`/admin/organizations/${id}/approve`);
    return response;
  },

  async rejectOrganization(id: string, reason: string): Promise<Organization> {
    const response = await api.post(`/admin/organizations/${id}/reject`, { reason });
    return response;
  },

  async updateOrganizationStatus(id: string, status: string): Promise<Organization> {
    const response = await api.put(`/admin/organizations/${id}/status`, { status });
    return response;
  }
};