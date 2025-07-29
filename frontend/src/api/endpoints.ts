import { API_ENDPOINTS, BASE_URL } from './constants';
import { HealthResponse } from './types';

// Función helper para hacer requests
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// API Endpoints - Aquí declaras cada endpoint de forma simple

export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiRequest<HealthResponse>(
    API_ENDPOINTS.HEALTH,
    'GET'
  );
  
  console.log('Health check response:', response.status);
  return response;
};
