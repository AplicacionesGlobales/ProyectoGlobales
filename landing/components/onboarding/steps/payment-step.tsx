'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Clock, Check, Smartphone, ExternalLink, Loader2 } from 'lucide-react';

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

  // Simular información del plan basado en los datos del onboarding
  const plan: PlanInfo = {
    id: 1,
    type: data.businessType || 'app',
    price: 185, // Precio base
    features: ['Gestión de Citas', 'Catálogo de Servicios', 'Reportes', 'Notificaciones'],
    billingPeriod: 'monthly'
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Preparar datos para el pago según el DTO del backend
      const paymentData = {
        name: data.brandName,
        email: data.email,
        phone: data.brandPhone || data.phone || '00000000',
        ownerName: `${data.firstName} ${data.lastName}`,
        location: data.location || 'San José, Costa Rica',
        planType: data.businessType || 'app', // 'web', 'app', 'completo'
        billingCycle: 'monthly', // 'monthly' o 'annual'
        selectedServices: data.selectedFeatures || ['basic_features']
      };

      console.log('🚀 Sending payment data:', paymentData);

      // Hacer request al endpoint de pago
      const response = await fetch('http://localhost:3000/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log('💳 Payment response:', result);

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.description || 'Error al crear el pago');
      }
      
      if (result.success && result.data?.paymentUrl) {
        setPaymentUrl(result.data.paymentUrl);
        
        // En lugar de abrir en nueva ventana, embeber la pasarela
        // Crear iframe para mostrar Tilopay
        const iframe = document.createElement('iframe');
        iframe.src = result.data.paymentUrl;
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        
        // Agregar el iframe al contenedor de pago
        const paymentContainer = document.getElementById('payment-container');
        if (paymentContainer) {
          paymentContainer.innerHTML = '';
          paymentContainer.appendChild(iframe);
        }
        
        // Escuchar mensajes del iframe para detectar cuando se complete el pago
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== 'https://tilopay.com') return;
          
          if (event.data.type === 'payment_success') {
            window.removeEventListener('message', handleMessage);
            onComplete({
              ...data,
              payment: {
                status: 'completed',
                reference: event.data.reference || result.data.reference,
                amount: plan.price
              }
            });
          } else if (event.data.type === 'payment_error') {
            window.removeEventListener('message', handleMessage);
            setError('Error en el pago. Por favor, inténtalo de nuevo.');
            setIsProcessing(false);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Fallback: después de 30 segundos, preguntar al usuario
        setTimeout(() => {
          if (confirm('¿Se completó el pago exitosamente?')) {
            window.removeEventListener('message', handleMessage);
            onComplete({
              ...data,
              payment: {
                status: 'completed',
                reference: result.data.reference,
                amount: plan.price
              }
            });
          } else {
            setError('Pago cancelado o fallido');
            setIsProcessing(false);
          }
        }, 30000);
        
      } else {
        throw new Error(result.message || 'Error al generar URL de pago');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Error al procesar el pago');
      setIsProcessing(false);
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
                    Complete su pago en la pasarela segura de Tilopay
                  </span>
                </div>
              </div>
              
              {/* Contenedor del iframe */}
              <div 
                id="payment-container" 
                className="border rounded-lg overflow-hidden bg-white shadow-sm"
                style={{ minHeight: '600px' }}
              >
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando pasarela de pago...</span>
                </div>
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
              <Button
                onClick={handleSkipPayment}
                variant="outline"
                size="lg"
                className="sm:w-auto"
              >
                Saltar Pago (Dev)
              </Button>
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
          disabled={isProcessing}
        >
          Anterior
        </Button>
        
        <div className="text-sm text-gray-500 flex items-center">
          Paso 7 de 7
        </div>
      </div>
    </div>
  );
}
