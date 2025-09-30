import { API_ENDPOINTS } from '@/api/constants';
import { CreateFeatureDto, Feature } from '@/types/admin.types';

export class AdminService {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    async createFeature(createFeatureDto: CreateFeatureDto): Promise<Feature> {
        const token = this.getAuthToken();

        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ADMIN.CREATE_FEATURE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(createFeatureDto),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async getAllFeatures(): Promise<Feature[]> {
        const token = this.getAuthToken();

        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ADMIN.GET_ALL_FEATURES}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    private getAuthToken(): string {
        // Implementar lógica para obtener el token del localStorage/cookie/contexto
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token') || '';
        }
        return '';
    }
}

export const adminService = new AdminService();