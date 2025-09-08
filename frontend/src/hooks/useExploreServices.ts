import { useState, useEffect } from 'react';
import { getServicesTypes } from '@/api/endpoints';
import { ServiceType } from '@/api/types';
import { authService } from '@/services/authService';

export const useExploreServices = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBrandId = (): number => {
    const brandId = process.env.EXPO_PUBLIC_BRAND_ID;
    return parseInt(brandId ?? '0');
  };

  const brandId = getBrandId();

  // Cargar servicios
  const loadServices = async () => {
    setIsLoadingServices(true);
    setError(null);
    
    try {
      // Verificar que el usuario esté autenticado
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }
      
      const response = await getServicesTypes(brandId);

      // Verificar si la respuesta tiene la estructura esperada de ServiceTypesResponse
      if (response && typeof response === 'object') {
        let servicesData: ServiceType[] = [];

        // Caso 1: Respuesta con estructura ServiceTypesResponse
        if ('success' in response && 'data' in response) {
          if (response.success && Array.isArray(response.data)) {
            servicesData = response.data;
          } else {
            setError('Error al cargar servicios');
            return;
          }
        }
        // Caso 2: Respuesta directa con solo data
        else if ('data' in response && Array.isArray(response.data)) {
          servicesData = response.data;
        }
        // Caso 3: Array directo
        else if (Array.isArray(response)) {
          servicesData = response;
        }
        else {
          setError('Formato de respuesta no válido');
          return;
        }

        const activeServices = servicesData.filter(service => service.isActive);
        
        setServices(activeServices);
      } else {
        setError('Respuesta del servidor inválida');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar servicios';
      
      // Manejar errores específicos de autenticación
      if (errorMessage.includes('Authentication required') || 
          errorMessage.includes('Usuario no autenticado') ||
          errorMessage.includes('401')) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Recargar servicios
  const refreshServices = () => {
    loadServices();
  };

  // Cargar servicios al montar el componente
  useEffect(() => {
    if (brandId > 0) {
      loadServices();
    } else {
      setError('Brand ID no válido');
    }
  }, [brandId]);

  return {
    // Estado
    services,
    isLoadingServices,
    error,

    // Funciones
    refreshServices,
  };
};