import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum PlanType {
  web = 'web',
  app = 'app', 
  complete = 'complete'
}

export enum BillingPeriod {
  monthly = 'monthly',
  annual = 'annual'
}

export interface PlanData {
  type: PlanType;
  name: string;
  description: string;
  basePrice: number;
}

export interface FeatureData {
  key: string;
  name: string;
  description: string;
  price: number;
}

@Injectable()
export class PlanService implements OnModuleInit {
  private readonly logger = new Logger(PlanService.name);

  // Datos maestros de planes
  private readonly PLANS: PlanData[] = [
    {
      type: PlanType.web,
      name: 'Plan Web',
      description: 'Solo aplicación web - Sin mensualidad, solo comisiones',
      basePrice: 0,
    },
    {
      type: PlanType.app,
      name: 'Plan App Móvil',
      description: 'Solo aplicación móvil nativa',
      basePrice: 59,
    },
    {
      type: PlanType.complete,
      name: 'Plan Completo',
      description: 'Web + App móvil nativa',
      basePrice: 99,
    },
  ];

  // Datos maestros de características
  private readonly FEATURES: FeatureData[] = [
    {
      key: 'citas',
      name: 'Sistema de Citas',
      description: 'Sistema completo de reservas con tipos de citas personalizables',
      price: 20,
    },
    {
      key: 'ubicaciones',
      name: 'Ubicaciones en Mapa',
      description: 'Permite a clientes marcar ubicaciones exactas en el mapa para servicios a domicilio',
      price: 15,
    },
    {
      key: 'archivos',
      name: 'Gestión de Archivos',
      description: 'Comparte portfolios, contratos, resultados y documentos organizados por cita',
      price: 18,
    },
    {
      key: 'pagos',
      name: 'Pagos Integrados',
      description: 'Acepta pagos directamente en la app',
      price: 25,
    },
    {
      key: 'tipos-citas',
      name: 'Tipos de Citas Personalizables',
      description: 'Define diferentes tipos de servicios con precios y duraciones específicas',
      price: 12,
    },
    {
      key: 'reportes',
      name: 'Reportes y Análisis',
      description: 'Genera reportes detallados de ingresos, citas y rendimiento del negocio',
      price: 15,
    },
    {
      key: 'productos',
      name: 'Catálogo de Productos',
      description: 'Vende productos adicionales desde tu app',
      price: 22,
    },
  ];

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedPlansAndFeatures();
  }

  /**
   * Inicializa planes y características en la base de datos
   */
  private async seedPlansAndFeatures() {
    try {
      // Crear planes si no existen
      for (const planData of this.PLANS) {
        await this.prisma.plan.upsert({
          where: { type: planData.type },
          update: {
            name: planData.name,
            description: planData.description,
            basePrice: planData.basePrice,
          },
          create: planData,
        });
      }

      // Crear características si no existen
      for (const featureData of this.FEATURES) {
        await this.prisma.feature.upsert({
          where: { key: featureData.key },
          update: {
            title: featureData.name,
            description: featureData.description || '',
            price: featureData.price,
          },
          create: {
            key: featureData.key,
            title: featureData.name,
            description: featureData.description || '',
            price: featureData.price,
            category: 'ESSENTIAL', // Default category
            isRecommended: false,
            isPopular: false,
            order: 0,
            businessTypes: []
          },
        });
      }

      this.logger.log('Plans and features seeded successfully');
    } catch (error) {
      this.logger.error('Error seeding plans and features', error);
    }
  }

  /**
   * Calcula el precio total de un plan con características
   */
  async calculateTotalPrice(
    planType: PlanType,
    selectedFeatures: string[],
    billingPeriod: BillingPeriod = BillingPeriod.monthly
  ): Promise<number> {
    // Obtener plan base
    const plan = await this.prisma.plan.findUnique({
      where: { type: planType }
    });

    if (!plan) {
      throw new Error(`Plan ${planType} not found`);
    }

    // Obtener precios de características
    const features = await this.prisma.feature.findMany({
      where: {
        key: { in: selectedFeatures },
        isActive: true
      }
    });

    // Calcular precio base
    let totalPrice = Number(plan.basePrice);

    // Sumar características
    const featuresPrice = features.reduce((sum, feature) => sum + Number(feature.price), 0);
    totalPrice += featuresPrice;

    // Aplicar descuento anual (20%)
    if (billingPeriod === BillingPeriod.annual) {
      totalPrice = totalPrice * 0.8;
    }

    return Math.round(totalPrice * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Crear suscripción de plan para una marca
   */
  async createBrandPlan(
    brandId: number,
    planType: PlanType,
    selectedFeatures: string[],
    billingPeriod: BillingPeriod = BillingPeriod.monthly
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { type: planType }
    });

    if (!plan) {
      throw new Error(`Plan ${planType} not found`);
    }

    // Calcular precio total
    const totalPrice = await this.calculateTotalPrice(planType, selectedFeatures, billingPeriod);

    // Crear suscripción al plan
    const brandPlan = await this.prisma.brandPlan.create({
      data: {
        brandId,
        planId: plan.id,
        billingPeriod,
        price: totalPrice,
      },
      include: {
        plan: true
      }
    });

    // Asociar características seleccionadas
    if (selectedFeatures.length > 0) {
      const features = await this.prisma.feature.findMany({
        where: {
          key: { in: selectedFeatures },
          isActive: true
        }
      });

      await this.prisma.brandFeature.createMany({
        data: features.map(feature => ({
          brandId,
          featureId: feature.id
        }))
      });
    }

    return brandPlan;
  }

  /**
   * Obtener información completa del plan de una marca
   */
  async getBrandPlanDetails(brandId: number) {
    return await this.prisma.brandPlan.findFirst({
      where: {
        brandId,
        isActive: true
      },
      include: {
        plan: true,
        brand: {
          include: {
            brandFeatures: {
              include: {
                feature: true
              }
            }
          }
        }
      }
    });
  }
}
