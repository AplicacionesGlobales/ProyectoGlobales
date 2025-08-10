import { Plan, PlanSelectionResponse, BusinessSetupData } from '../types/plan.types';

class PlanService {
  private baseURL: string;

  constructor(baseURL: string = process.env.API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async selectPlan(planId: string, userId: number): Promise<PlanSelectionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/plans/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to select plan');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async setupBusiness(data: BusinessSetupData): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/business/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to setup business');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async getPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${this.baseURL}/plans`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      return response.json();
    } catch (error) {
      // Return local plans if API fails
      const { AVAILABLE_PLANS } = await import('../constants/Plans');
      return AVAILABLE_PLANS;
    }
  }
}

export const planService = new PlanService();