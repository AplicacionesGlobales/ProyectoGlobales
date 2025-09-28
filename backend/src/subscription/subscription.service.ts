// src/subscription/subscription.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { 
  SubscriptionFeaturesResponseDto, 
  ActiveFeatureDto,
  PricingBreakdownDto,
  CostSummaryDto
} from './dto/subscription-features.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getUserSubscriptionFeatures(
    userId: number
  ): Promise<BaseResponseDto<SubscriptionFeaturesResponseDto>> {
    try {
      // Obtener el brand activo del usuario
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          brand: {
            include: {
              // Features activas del brand
              brandFeatures: {
                where: { isActive: true },
                include: {
                  feature: true
                }
              },
              // Plan actual
              brandPlans: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                  plan: true
                }
              }
            }
          }
        }
      });

      if (!userBrand) {
        throw new NotFoundException('No se encontró suscripción activa para el usuario');
      }

      const brand = userBrand.brand;
      const currentPlan = brand.brandPlans[0];

      // Mapear las features activas
      const activeFeatures: ActiveFeatureDto[] = brand.brandFeatures.map(bf => ({
        id: bf.feature.id,
        key: bf.feature.key,
        title: bf.feature.title,
        description: bf.feature.description,
        category: bf.feature.category,
        price: Number(bf.feature.price),
        isActive: bf.isActive,
        activatedAt: bf.createdAt.toISOString(),
        expiresAt: this.calculateFeatureExpiration(bf, currentPlan)
      }));

      // Agrupar features por categoría
      const featuresByCategory = activeFeatures.reduce((acc, feature) => {
        if (!acc[feature.category]) {
          acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
      }, {} as Record<string, ActiveFeatureDto[]>);

      // Crear desglose de precios ordenado de mayor a menor
      const pricingBreakdown: PricingBreakdownDto[] = activeFeatures
        .sort((a, b) => b.price - a.price)
        .map(feature => ({
          featureName: feature.title,
          featureKey: feature.key,
          price: feature.price,
          billingPeriod: currentPlan?.billingPeriod || 'monthly'
        }));

      // Calcular totales
      const subtotalFeatures = activeFeatures.reduce((sum, f) => sum + f.price, 0);
      const basePlanPrice = currentPlan ? Number(currentPlan.plan.basePrice) : 0;
      const totalMonthlyPrice = basePlanPrice + subtotalFeatures;
      
      // Calcular impuestos si aplica (ejemplo: 13% en Costa Rica)
      const taxRate = 0.13; // Puedes hacer esto configurable
      const taxes = totalMonthlyPrice * taxRate;
      const totalWithTaxes = totalMonthlyPrice + taxes;

      const nextBillingDate = currentPlan ? this.calculateNextBillingDate(currentPlan) : new Date().toISOString();

      // Crear resumen de costos
      const costSummary: CostSummaryDto = {
        currency: 'USD',
        breakdown: {
          planBase: basePlanPrice,
          features: subtotalFeatures,
          discounts: 0, // Implementar si tienes descuentos
          taxes: Number(taxes.toFixed(2)),
          total: Number(totalWithTaxes.toFixed(2))
        },
        nextBillingAmount: Number(totalWithTaxes.toFixed(2)),
        nextBillingDate
      };

      const response: SubscriptionFeaturesResponseDto = {
        brandId: brand.id,
        brandName: brand.name,
        subscriptionStatus: currentPlan ? 'active' : 'inactive',
        plan: currentPlan ? {
          id: currentPlan.plan.id,
          name: currentPlan.plan.name,
          type: currentPlan.plan.type,
          billingPeriod: currentPlan.billingPeriod,
          nextBillingDate,
          basePrice: basePlanPrice
        } : undefined,
        activeFeatures,
        featuresByCategory,
        totalFeatures: activeFeatures.length,
        pricingBreakdown,
        subtotalFeatures,
        basePlanPrice,
        totalMonthlyPrice,
        costSummary,
        monthlyFeaturesPrice: subtotalFeatures, // Mantener por compatibilidad
        limits: {
          maxUsers: this.getFeatureLimit(activeFeatures, 'max_users'),
          maxAppointments: this.getFeatureLimit(activeFeatures, 'max_appointments'),
          maxBranches: this.getFeatureLimit(activeFeatures, 'max_branches'),
          storageGB: this.getFeatureLimit(activeFeatures, 'storage_gb')
        }
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error getting subscription features:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error al obtener funcionalidades de suscripción');
    }
  }

  private calculateFeatureExpiration(brandFeature: any, currentPlan: any): string | undefined {
    if (!currentPlan || !currentPlan.endDate) {
      return undefined;
    }
    return currentPlan.endDate.toISOString();
  }

  private calculateNextBillingDate(plan: any): string {
    const startDate = new Date(plan.startDate);
    const now = new Date();
    
    if (plan.billingPeriod === 'annual') {
      const nextDate = new Date(startDate);
      while (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      return nextDate.toISOString();
    } else {
      const nextDate = new Date(startDate);
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate.toISOString();
    }
  }

  private calculateMonthlyFeaturesPrice(features: ActiveFeatureDto[]): number {
    return features.reduce((sum, feature) => sum + feature.price, 0);
  }

  private getFeatureLimit(features: ActiveFeatureDto[], limitKey: string): number | undefined {
    // Definir límites por feature
    const featureLimits: Record<string, Record<string, number>> = {
      'citas': { 
        max_appointments: 1000,
        max_users: 50 
      },
      'clientes': { 
        max_users: 100 
      },
      'pagos': { 
        max_transactions: 5000 
      },
      'analytics': {
        max_reports: 100
      },
      'multi_branch': {
        max_branches: 10
      }
    };
    
    // Buscar el límite más alto entre las features activas
    let maxLimit = 0;
    features.forEach(feature => {
      const limits = featureLimits[feature.key];
      if (limits && limits[limitKey]) {
        maxLimit = Math.max(maxLimit, limits[limitKey]);
      }
    });
    
    return maxLimit > 0 ? maxLimit : undefined;
  }
}