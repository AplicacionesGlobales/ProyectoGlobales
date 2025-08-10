export interface Plan {
  id: string;
  name: string;
  price: number;
  monthlyPrice: number;
  features: string[];
  recommended?: boolean;
  color: string;
  icon: string;
  description: string;
  maxUsers?: number;
  maxClients?: number | 'unlimited';
}

export interface PlanSelectionResponse {
  planId: string;
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface BusinessSetupData {
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  postalCode?: string;
}