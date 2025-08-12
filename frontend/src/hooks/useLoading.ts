import { useState, useCallback } from 'react';
import { UseLoadingOptions, UseLoadingReturn } from '../types/loading.types';

export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
  const { initialLoading = false } = options;
  const [loading, setLoading] = useState(initialLoading);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};
