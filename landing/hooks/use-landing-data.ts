"use client"

import { useState, useEffect, useCallback } from 'react';
import { landingService } from '@/api';
import type { LandingConfig, BusinessType, Feature, Plan } from '@/api/types';

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
    console.log('🔄 Starting to load landing data...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Making API call to landingService.getLandingConfig()...');
      const response = await landingService.getLandingConfig();
      console.log('📥 API response received:', {
        success: response.success,
        hasData: !!response.data,
        errors: response.errors,
        dataKeys: response.data ? Object.keys(response.data) : null
      });
      
      if (response.success && response.data) {
        console.log('✅ Setting config data:', {
          businessTypes: response.data.businessTypes?.length,
          features: response.data.features?.length,
          plans: response.data.plans?.length
        });
        setConfig(response.data);
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Failed to load data';
        console.error('❌ API call unsuccessful:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('🚨 Exception caught while loading landing data:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
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

  const getBusinessTypeById = useCallback((id: number): BusinessType | undefined => {
    if (!config) return undefined;
    return config.businessTypes.find(bt => bt.id === id);
  }, [config]);

  const getBusinessTypeByKey = useCallback((key: string): BusinessType | undefined => {
    if (!config) return undefined;
    return config.businessTypes.find(bt => bt.key === key);
  }, [config]);

  const getFeaturesByCategory = useCallback((category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED'): Feature[] => {
    if (!config) return [];
    return config.features
      .filter(feature => feature.category === category)
      .sort((a, b) => a.order - b.order);
  }, [config]);

  const getPopularFeatures = useCallback((): Feature[] => {
    if (!config) return [];
    return config.features
      .filter(feature => feature.isPopular)
      .sort((a, b) => a.order - b.order);
  }, [config]);

  const getPlanByType = useCallback((type: 'web' | 'app' | 'complete'): Plan | undefined => {
    if (!config) return undefined;
    return config.plans.find(plan => plan.type === type);
  }, [config]);

  const calculateTotalPrice = useCallback((selectedFeatures: string[], planType: 'web' | 'app' | 'complete'): number => {
    if (!config) return 0;
    
    const plan = getPlanByType(planType);
    const planPrice = plan?.basePrice || 0;
    
    const featuresPrice = selectedFeatures.reduce((total, featureKey) => {
      const feature = config.features.find(f => f.key === featureKey);
      return total + (feature?.price || 0);
    }, 0);

    return planPrice + featuresPrice;
  }, [config, getPlanByType]);

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
    getBusinessTypeById,
    getBusinessTypeByKey,
    getFeaturesByCategory,
    getPopularFeatures,
    getPlanByType,
    calculateTotalPrice,
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
        
        const response = await landingService.getFeaturesForBusiness(businessTypeKey);
        
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
