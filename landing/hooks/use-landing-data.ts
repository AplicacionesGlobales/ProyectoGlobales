"use client"

import { useState, useEffect, useCallback } from 'react';
import { landingService, type BusinessType, type Feature, type Plan, type LandingConfig } from '@/lib/api';

interface UseLandingDataReturn {
  config: LandingConfig | null;
  businessTypes: BusinessType[];
  features: Feature[];
  plans: Plan[];
  loading: boolean;
  error: string | null;
  getRecommendedFeatures: (businessTypeKey: string) => Feature[];
  getBusinessTypeById: (id: number) => BusinessType | undefined;
  getBusinessTypeByKey: (key: string) => BusinessType | undefined;
  getFeaturesByCategory: (category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED') => Feature[];
  getPopularFeatures: () => Feature[];
  getPlanByType: (type: 'web' | 'app' | 'complete') => Plan | undefined;
  calculateTotalPrice: (selectedFeatures: string[], planType: 'web' | 'app' | 'complete') => number;
  refreshData: () => Promise<void>;
}

export function useLandingData(): UseLandingDataReturn {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLandingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await landingService.getLandingConfig();
      
      if (response.success && response.data) {
        setConfig(response.data);
      } else {
        setError(response.errors?.[0]?.description || 'Failed to load data');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error loading landing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLandingData();
  }, [loadLandingData]);

  const getRecommendedFeatures = useCallback((businessTypeKey: string): Feature[] => {
    if (!config) return [];
    
    return config.features.filter(feature => 
      feature.businessTypes.includes(businessTypeKey)
    );
  }, [config]);

  const refreshData = useCallback(async () => {
    await loadLandingData();
  }, [loadLandingData]);

  return {
    config,
    businessTypes: config?.businessTypes || [],
    features: config?.features || [],
    plans: config?.plans || [],
    loading,
    error,
    getRecommendedFeatures,
    refreshData,
  };
}

// Hook for getting features for a specific business type
export function useBusinessTypeFeatures(businessTypeKey: string) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeatures = async () => {
      if (!businessTypeKey) {
        setFeatures([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await landingService.getFeaturesForBusinessType(businessTypeKey);
        
        if (response.success && response.data) {
          setFeatures(response.data);
        } else {
          setError(response.errors?.[0]?.description || 'Failed to load features');
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Error loading features:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, [businessTypeKey]);

  return { features, loading, error };
}
