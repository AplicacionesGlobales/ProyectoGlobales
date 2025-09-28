// types/subscription.ts
export interface SubscriptionData {
  brandId: number
  brandName: string
  subscriptionStatus: 'active' | 'inactive' | 'suspended'
  plan?: {
    id: number
    name: string
    type: string
    billingPeriod: string
    nextBillingDate: string
    basePrice: number
  }
  activeFeatures: ActiveFeature[]
  featuresByCategory: Record<string, ActiveFeature[]>
  totalFeatures: number
  pricingBreakdown: PricingBreakdown[]
  subtotalFeatures: number
  basePlanPrice: number
  totalMonthlyPrice: number
  costSummary: CostSummary
  limits: SubscriptionLimits
}

export interface ActiveFeature {
  id: number
  key: string
  title: string
  description: string
  category: string
  price: number
  isActive: boolean
  activatedAt: string
  expiresAt?: string
}

export interface PricingBreakdown {
  featureName: string
  featureKey: string
  price: number
  billingPeriod: string
}

export interface CostSummary {
  currency: string
  breakdown: {
    planBase: number
    features: number
    discounts: number
    taxes: number
    total: number
  }
  nextBillingAmount: number
  nextBillingDate: string
}

export interface SubscriptionLimits {
  maxUsers?: number
  maxAppointments?: number
  maxBranches?: number
  storageGB?: number
}