// Admin types for feature management

export interface CreateFeatureDto {
    key: string;
    title: string;
    subtitle?: string;
    description: string;
    price: number;
    category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED';
    businessTypes: string[];
    isRecommended?: boolean;
    isPopular?: boolean;
    order?: number;
}

export interface Feature {
    id: number;
    key: string;
    title: string;
    subtitle?: string;
    description: string;
    price: number;
    category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED';
    isRecommended: boolean;
    isPopular: boolean;
    order: number;
    businessTypes: string[];
    createdAt?: string;
    updatedAt?: string;
}