// backend/src/common/services/pricing.service.ts
import { Injectable } from '@nestjs/common';

export interface PricingConfig {
  plans: {
    web: number;
    app: number;
    completo: number;
  };
  features: {
    [key: string]: number;
  };
}

@Injectable()
export class PricingService {
  private readonly config: PricingConfig = {
    plans: {
      web: 0,      // Plan web gratuito
      app: 35,     // Plan app base
      completo: 60 // Plan completo
    },
    features: {
      'Gestión de Citas': 35,
      'Ubicaciones': 15,
      'Archivos y Documentos': 25,
      'Pagos': 30,
      'Reportes': 30,
      'Catálogo de Servicios': 45,
      'Notificaciones': 25
    }
  };

  /**
   * Calcula el precio total basado en el plan y servicios seleccionados
   */
  calculateTotalPrice(
    planType: string,
    selectedServices: string[],
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): number {
    console.log('💰 PricingService: Calculating price for:', {
      planType,
      selectedServices,
      billingCycle
    });

    // Obtener precio base del plan
    const basePrice = this.config.plans[planType as keyof typeof this.config.plans] || 0;
    console.log(`📊 Base price for ${planType}: $${basePrice}`);

    // Calcular precio de servicios adicionales
    const servicesPrice = selectedServices.reduce((total, serviceName) => {
      const price = this.config.features[serviceName] || 0;
      console.log(`💰 Service: ${serviceName} -> $${price}`);
      return total + price;
    }, 0);

    const monthlyTotal = basePrice + servicesPrice;
    console.log(`📊 Monthly total: $${monthlyTotal}`);

    // Si es anual, aplicar descuento (10 meses por 12)
    const finalPrice = billingCycle === 'annual' ? monthlyTotal * 10 : monthlyTotal;
    
    console.log(`📊 Final price (${billingCycle}): $${finalPrice}`);
    return finalPrice;
  }

  /**
   * Obtiene la configuración de precios
   */
  getPricingConfig(): PricingConfig {
    return this.config;
  }

  /**
   * Calcula el descuento para plan anual
   */
  calculateAnnualDiscount(monthlyPrice: number): number {
    const yearlyPrice = monthlyPrice * 10; // 10 meses por 12
    const regularYearlyPrice = monthlyPrice * 12;
    return regularYearlyPrice - yearlyPrice;
  }

  /**
   * Formatea precio para mostrar
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
}
