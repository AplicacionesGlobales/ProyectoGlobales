import { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';

export interface NavigationLoadingOptions {
  delay?: number; // Minimum loading time for better UX
  message?: string;
}

export interface UseNavigationLoadingReturn {
  isNavigating: boolean;
  navigateWithLoading: (
    route: Href, 
    options?: NavigationLoadingOptions & { replace?: boolean }
  ) => Promise<void>;
  navigatingTo: string | null;
  currentMessage: string;
}

export const useNavigationLoading = (): UseNavigationLoadingReturn => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('Loading...');

  const navigateWithLoading = async (
    route: Href, 
    options: NavigationLoadingOptions & { replace?: boolean } = {}
  ): Promise<void> => {
    const { delay = 500, message = 'Loading...', replace = false } = options;

    try {
      setIsNavigating(true);
      setNavigatingTo(typeof route === 'string' ? route : 'navigating...');
      setCurrentMessage(message);

      // Minimum loading time for better UX
      const startTime = Date.now();
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, delay - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Navigate
      if (replace) {
        router.replace(route);
      } else {
        router.push(route);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Small delay before removing loading to avoid flash
      setTimeout(() => {
        setIsNavigating(false);
        setNavigatingTo(null);
        setCurrentMessage('Loading...');
      }, 100);
    }
  };

  return {
    isNavigating,
    navigateWithLoading,
    navigatingTo,
    currentMessage,
  };
};
