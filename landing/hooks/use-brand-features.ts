// landing\hooks\use-brand-features.ts
import { useState, useEffect, useCallback } from 'react';
import { Feature, BrandFeature, ApiResponse } from '@/api/types';
import { landingService, brandFeaturesService } from '@/api/endpoints';

interface UseBrandFeaturesOptions {
  brandId?: number;
  autoLoad?: boolean;
}

interface UseBrandFeaturesReturn {
  // State
  allFeatures: Feature[];
  brandFeatures: BrandFeature[];
  loading: boolean;
  error: string | null;
  
  // Derived data
  activeBrandFeatures: BrandFeature[];
  availableFeatures: Feature[];
  
  // Actions
  loadAllFeatures: () => Promise<void>;
  loadBrandFeatures: (brandId: number) => Promise<void>;
  assignFeature: (brandId: number, featureId: number) => Promise<boolean>;
  unassignFeature: (brandId: number, featureId: number) => Promise<boolean>;
  toggleFeature: (brandId: number, featureId: number, isCurrentlyActive: boolean) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useBrandFeatures = ({ 
  brandId, 
  autoLoad = true 
}: UseBrandFeaturesOptions = {}): UseBrandFeaturesReturn => {
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [brandFeatures, setBrandFeatures] = useState<BrandFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived data
  const activeBrandFeatures = brandFeatures.filter(bf => bf.isActive);
  const assignedFeatureIds = brandFeatures.map(bf => bf.featureId);
  const availableFeatures = allFeatures.filter(f => !assignedFeatureIds.includes(f.id));

  // Load all available features
  const loadAllFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ApiResponse<Feature[]> = await landingService.getFeatures();
      
      if (response.success && response.data) {
        setAllFeatures(response.data);
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Failed to load features';
        setError(errorMsg);
        console.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Error loading features';
      setError(errorMsg);
      console.error(errorMsg);
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load brand-specific features
  const loadBrandFeatures = useCallback(async (targetBrandId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ApiResponse<BrandFeature[]> = await brandFeaturesService.getBrandFeatures(targetBrandId);
      
      if (response.success && response.data) {
        setBrandFeatures(response.data);
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Failed to load brand features';
        setError(errorMsg);
        console.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Error loading brand features';
      setError(errorMsg);
      console.error(errorMsg);
      console.error('Error loading brand features:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign feature to brand
  const assignFeature = useCallback(async (targetBrandId: number, featureId: number): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response: ApiResponse<BrandFeature> = await brandFeaturesService.assignFeature(targetBrandId, featureId);
      
      if (response.success && response.data) {
        // Add the new brand feature to the list
        setBrandFeatures(prev => [...prev, response.data!]);
        console.log('Feature asignada exitosamente');
        return true;
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Failed to assign feature';
        console.error(errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error asignando feature');
      console.error('Error assigning feature:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unassign feature from brand
  const unassignFeature = useCallback(async (targetBrandId: number, featureId: number): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response: ApiResponse<any> = await brandFeaturesService.unassignFeature(targetBrandId, featureId);
      
      if (response.success) {
        // Remove the brand feature from the list
        setBrandFeatures(prev => prev.filter(bf => bf.featureId !== featureId));
        console.log('Feature desasignada exitosamente');
        return true;
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Failed to unassign feature';
        console.error(errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error desasignando feature');
      console.error('Error unassigning feature:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle feature (assign if not assigned, unassign if assigned)
  const toggleFeature = useCallback(async (
    targetBrandId: number, 
    featureId: number, 
    isCurrentlyActive: boolean
  ): Promise<boolean> => {
    if (isCurrentlyActive) {
      return await unassignFeature(targetBrandId, featureId);
    } else {
      return await assignFeature(targetBrandId, featureId);
    }
  }, [assignFeature, unassignFeature]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadAllFeatures();
    if (brandId) {
      await loadBrandFeatures(brandId);
    }
  }, [loadAllFeatures, loadBrandFeatures, brandId]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadAllFeatures();
      if (brandId) {
        loadBrandFeatures(brandId);
      }
    }
  }, [autoLoad, brandId, loadAllFeatures, loadBrandFeatures]);

  return {
    // State
    allFeatures,
    brandFeatures,
    loading,
    error,
    
    // Derived data
    activeBrandFeatures,
    availableFeatures,
    
    // Actions
    loadAllFeatures,
    loadBrandFeatures,
    assignFeature,
    unassignFeature,
    toggleFeature,
    refresh,
  };
};

export default useBrandFeatures;