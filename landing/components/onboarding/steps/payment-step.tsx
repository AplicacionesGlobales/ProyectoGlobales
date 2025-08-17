// components/onboarding/PaymentStep.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Clock, Check, Smartphone, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { paymentService } from '@/services/payment.service';

interface PaymentStepProps {
  data: any;
  onComplete: (stepData: any) => void;
  onPrev: () => void;
}

interface PlanInfo {
  id: number;
  type: string;
  price: number;
  features: string[];
  billingPeriod: string;
}

export default function PaymentStep({ data, onComplete, onPrev }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // Simular información del plan basado en los datos del onboarding
  const plan: PlanInfo = {
    id: 1,
    type: data.businessType || 'app',
    price: calculatePlanPrice(data.businessType, data.selectedFeatures),
    features: getPlanFeatures(data.businessType, data.selectedFeatures),
    billingPeriod: data.billingCycle || 'monthly'
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      // Validar que tengamos todos los datos requeridos
      if (!data.brandName || !data.email || !data.firstName || !data.lastName) {
        throw new Error('Faltan datos requeridos para procesar el pago');
      }

      // Preparar datos para el pago según el DTO del backend
      const paymentData = {
        name: data.brandName.trim(),
        email: data.email.trim(),
        phone: (data.brandPhone || data.phone || '00000000').toString(),
        ownerName: `${data.firstName.trim()} ${data.lastName.trim()}`,
        location: data.location || 'San José, Costa Rica',
        planType: data.businessType || 'app',
        billingCycle: data.billingCycle || 'monthly',
        selectedServices: Array.isArray(data.selectedFeatures) ? data.selectedFeatures : ['basic_features']
      };

      console.log('💳 Payment data to send:', paymentData);

      const response = await paymentService.createPayment(paymentData);

      if (response.success && response.data?.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        
        // Iniciar verificación periódica del estado del pago
        if (response.data.orderNumber) {
          checkPaymentStatus(response.data.orderNumber);
        }
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error al generar URL de pago';
        console.error('❌ Payment creation failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('💥 Payment error:', error);
      setError(error.message || 'Error al procesar el pago');
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (orderNumber: string) => {
    try {
      const response = await paymentService.getPaymentStatus(orderNumber);
      
      if (response.success && response.data?.status === 'completed') {
        setPaymentStatus('completed');
        onComplete({
          ...data,
          payment: {
            status: 'completed',
            reference: response.data.tilopayReference || response.data.orderNumber,
            amount: plan.price
          }
        });
      } else {
        // Reintentar después de 5 segundos si el pago no está completo
        setTimeout(() => checkPaymentStatus(orderNumber), 5000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setTimeout(() => checkPaymentStatus(orderNumber), 5000);
    }
  };

  const handleSkipPayment = () => {
    // Para desarrollo, permitir saltar el pago
    onComplete({
      ...data,
      payment: {
        status: 'pending',
        amount: plan.price
      }
    });
  };

  // Calcular precio del plan
  function calculatePlanPrice(planType: string, selectedFeatures: string[] = []): number {
    const basePrices: Record<string, number> = {
      web: 0,
      app: 59,
      completo: 60
    };

    const featurePrices: Record<string, number> = {
      citas: 20,
      ubicaciones: 15,
      archivos: 25,
      pagos: 30,
      reportes: 15
    };

    const basePrice = basePrices[planType] || 0;
    const featuresPrice = selectedFeatures.reduce((sum, feature) => sum + (featurePrices[feature] || 0), 0);
    
    return basePrice + featuresPrice;
  }

  // Obtener características del plan
  function getPlanFeatures(planType: string, selectedFeatures: string[] = []): string[] {
    const baseFeatures: Record<string, string[]> = {
      web: ['Sitio web básico', 'Perfil de negocio'],
      app: ['Aplicación móvil', 'Gestión básica'],
      completo: ['Aplicación móvil', 'Sitio web completo', 'Gestión avanzada']
    };

    const featureNames: Record<string, string> = {
      citas: 'Gestión de Citas',
      ubicaciones: 'Múltiples Ubicaciones',
      archivos: 'Almacenamiento de Archivos',
      pagos: 'Pagos en Línea',
      reportes: 'Reportes Avanzados'
    };

    const features = baseFeatures[planType] || [];
    const additionalFeatures = selectedFeatures.map(f => featureNames[f] || f);
    
    return [...features, ...additionalFeatures];
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Finaliza tu Registro
        </h2>
        <p className="text-lg text-gray-600">
          Tu aplicación está casi lista. Solo falta procesar el pago.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumen del Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Tu Plan Seleccionado
            </CardTitle>
            <CardDescription>
              Resumen de tu aplicación personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Plan {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}</span>
              <Badge variant="default" className="text-lg py-1 px-3">
                ₡{plan.price.toLocaleString()}/mes
              </Badge>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Características incluidas:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₡{plan.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (13%):</span>
                <span>₡{Math.round(plan.price * 0.13).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₡{Math.round(plan.price * 1.13).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Negocio */}
        <Card>
          <CardHeader>
            <CardTitle>Información de tu Negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre de la Marca</label>
              <p className="text-lg font-semibold">{data.brandName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Propietario</label>
              <p className="text-lg font-semibold">{data.firstName} {data.lastName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg font-semibold">{data.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Negocio</label>
              <p className="text-lg font-semibold capitalize">{data.businessType}</p>
            </div>

            {data.brandPhone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-lg font-semibold">{data.brandPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métodos de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Método de Pago
          </CardTitle>
          <CardDescription>
            Procesado de forma segura por Tilopay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Contenedor para la pasarela embebida */}
          {paymentUrl ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    {paymentStatus === 'processing' ? 'Procesando tu pago...' : 'Complete su pago en la pasarela segura de Tilopay'}
                  </span>
                </div>
              </div>
              
              {/* Contenedor del iframe */}
              <div 
                className="border rounded-lg overflow-hidden bg-white shadow-sm"
                style={{ minHeight: '600px' }}
              >
                <iframe
                  src={paymentUrl}
                  title="Pasarela de pago Tilopay"
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(paymentUrl, '_blank', 'width=800,height=600')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en nueva ventana
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5 mr-2" />
                )}
                {isProcessing ? 'Procesando...' : `Pagar ₡${Math.round(plan.price * 1.13).toLocaleString()}`}
              </Button>
              
              {/* Botón para desarrollo */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={handleSkipPayment}
                  variant="outline"
                  size="lg"
                  className="sm:w-auto"
                >
                  Saltar Pago (Dev)
                </Button>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Al proceder, aceptas nuestros términos y condiciones. 
            El pago es procesado de forma segura por Tilopay.
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isProcessing || paymentStatus === 'processing'}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="text-sm text-gray-500 flex items-center">
          Paso 7 de 7
        </div>
      </div>
    </div>
  );
}