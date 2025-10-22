'use client';

import { useState, useEffect, useCallback } from 'react';
import { landingService } from '@/api';
import type { BrandDashboardMetrics } from '@/api/types';

interface UseBrandMetricsResult {
  metrics: BrandDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useBrandMetrics(brandId: number): UseBrandMetricsResult {
  const [metrics, setMetrics] = useState<BrandDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await landingService.getBrandDashboardMetrics(brandId);

      if (response.success && response.data) {
        setMetrics(response.data);
        setLastUpdated(new Date());
      } else {
        const errorMessage = response.errors?.[0]?.description || 'Error al cargar las métricas';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching brand metrics:', err);
      setError('Error de conexión al cargar las métricas');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  const refresh = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (brandId) {
      fetchMetrics();
    }
  }, [brandId, fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh,
    lastUpdated
  };
}

// Hook for auto-refresh functionality
export function useAutoRefresh(
  refreshFunction: () => Promise<void>,
  intervalMs: number = 300000, // 5 minutes default
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      refreshFunction();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [refreshFunction, intervalMs, enabled]);
}