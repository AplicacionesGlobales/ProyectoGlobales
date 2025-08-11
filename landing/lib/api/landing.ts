import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { LandingConfig, BusinessType, Feature, Plan } from './types';

export const landingService = {
  /**
   * Get complete landing configuration in one optimized request
   */
  async getLandingConfig(): Promise<ApiResponse<LandingConfig>> {
    try {
      return await apiClient.get<LandingConfig>(API_ENDPOINTS.LANDING.CONFIG);
    } catch (error) {
      console.error('Failed to get landing config:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load landing configuration'
        }]
      };
    }
  },

  /**
   * Get all business types
   */
  async getBusinessTypes(): Promise<ApiResponse<BusinessType[]>> {
    try {
      return await apiClient.get<BusinessType[]>(API_ENDPOINTS.LANDING.BUSINESS_TYPES);
    } catch (error) {
      console.error('Failed to get business types:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load business types'
        }]
      };
    }
  },

  /**
   * Get all features
   */
  async getFeatures(): Promise<ApiResponse<Feature[]>> {
    try {
      return await apiClient.get<Feature[]>(API_ENDPOINTS.LANDING.FEATURES);
    } catch (error) {
      console.error('Failed to get features:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load features'
        }]
      };
    }
  },

  /**
   * Get features recommended for a specific business type
   */
  async getFeaturesForBusinessType(businessType: string): Promise<ApiResponse<Feature[]>> {
    try {
      return await apiClient.get<Feature[]>(API_ENDPOINTS.LANDING.FEATURES_FOR_BUSINESS(businessType));
    } catch (error) {
      console.error('Failed to get features for business type:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load recommended features'
        }]
      };
    }
  },

  /**
   * Get all plans
   */
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      return await apiClient.get<Plan[]>(API_ENDPOINTS.LANDING.PLANS);
    } catch (error) {
      console.error('Failed to get plans:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load plans'
        }]
      };
    }
  },

  /**
   * Get business type with its recommended features
   */
  async getBusinessTypeConfig(businessType: string): Promise<ApiResponse<BusinessType>> {
    try {
      return await apiClient.get<BusinessType>(API_ENDPOINTS.LANDING.BUSINESS_TYPE_CONFIG(businessType));
    } catch (error) {
      console.error('Failed to get business type config:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load business type configuration'
        }]
      };
    }
  },
};
