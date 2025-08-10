import { useState, useCallback } from 'react';
import { Plan, PlanSelectionResponse } from '../types/plan.types';
import { planService } from '../services/planService';
import { AVAILABLE_PLANS } from '@/constants/Plans';

interface UsePlanSelectionReturn {
  plans: Plan[];
  selectedPlan: string;
  loading: boolean;
  error: string | null;
  selectPlan: (planId: string) => void;
  confirmPlanSelection: () => Promise<void>;
  getSelectedPlanDetails: () => Plan | undefined;
}

export const usePlanSelection = (
  userId?: number,
  onSuccess?: (response: PlanSelectionResponse) => void,
  onError?: (error: Error) => void
): UsePlanSelectionReturn => {
  const [plans] = useState<Plan[]>(AVAILABLE_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectPlan = useCallback((planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  }, []);

  const getSelectedPlanDetails = useCallback(() => {
    return plans.find(p => p.id === selectedPlan);
  }, [plans, selectedPlan]);

  const confirmPlanSelection = useCallback(async () => {
    if (!selectedPlan) {
      setError('Por favor selecciona un plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response: PlanSelectionResponse = {
        planId: selectedPlan,
        transactionId: `TXN-${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      onSuccess?.(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to confirm plan selection');
      setError(error.message);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, userId, onSuccess, onError]);

  return {
    plans,
    selectedPlan,
    loading,
    error,
    selectPlan,
    confirmPlanSelection,
    getSelectedPlanDetails,
  };
};
