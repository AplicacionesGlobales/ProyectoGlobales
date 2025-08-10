export interface BrandCreationData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  ownerId: number;
}

export interface UserCreationData {
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: 'ROOT';
}

export interface ColorPaletteCreationData {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  brandId: number;
}

export interface BrandRegistrationResult {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  brand: {
    id: number;
    name: string;
    description?: string | null;
    address?: string | null;
    phone?: string | null;
  };
  colorPalette: {
    id: number;
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };
}

export type BusinessFeature = 
  | 'citas' 
  | 'ubicaciones' 
  | 'archivos' 
  | 'pagos' 
  | 'tipos-citas' 
  | 'reportes';

export type PlanType = 'monthly' | 'annual';
