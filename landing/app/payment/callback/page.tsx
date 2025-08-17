// landing\app\payment\callback\page.tsx

"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { paymentService } from "@/services/payment.service"
import Swal from 'sweetalert2'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [callbackResult, setCallbackResult] = useState<{
    success: boolean;
    status: 'completed' | 'failed' | 'pending';
    message: string;
    orderNumber?: string;
  } | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      console.log('🔄 Processing payment callback...');
      
      try {
        // Procesar el callback con el servicio de pago
        const result = await paymentService.handlePaymentCallback(searchParams)
        setCallbackResult(result)
        
        console.log('✅ Callback processed:', result);
        
        // Mostrar modal según el resultado
        if (result.success && result.status === 'completed') {
          // Pago exitoso
          await Swal.fire({
            icon: 'success',
            title: '¡Pago Completado!',
            text: result.message,
            confirmButtonText: 'Ir al Panel',
            confirmButtonColor: '#10b981',
            allowOutsideClick: false,
            allowEscapeKey: false
          })
          
          // Actualizar el estado del usuario en localStorage si es necesario
          const userData = localStorage.getItem('user_data')
          const brandData = localStorage.getItem('brand_data')
          
          if (userData && brandData) {
            const user = JSON.parse(userData)
            const brand = JSON.parse(brandData)
            
            // Crear datos para el panel
            const dashboardData = {
              id: user.id?.toString() || '1',
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              businessType: 'app',
              brandName: brand.name,
              plan: 'app',
              paymentStatus: 'paid',
              createdAt: new Date().toISOString(),
              orderNumber: result.orderNumber
            }
            
            localStorage.setItem('userData', JSON.stringify(dashboardData))
          }
          
          // Redirigir al panel
          router.push('/panel/dashboard')
          
        } else {
          // Pago fallido o pendiente
          const swalResult = await Swal.fire({
            icon: result.status === 'failed' ? 'error' : 'warning',
            title: result.status === 'failed' ? 'Pago Fallido' : 'Pago Pendiente',
            text: result.message,
            showCancelButton: true,
            confirmButtonText: result.status === 'failed' ? 'Intentar de nuevo' : 'Verificar estado',
            cancelButtonText: 'Ir al inicio',
            confirmButtonColor: result.status === 'failed' ? '#ef4444' : '#f59e0b',
            cancelButtonColor: '#6b7280'
          })
          
          if (swalResult.isConfirmed) {
            if (result.status === 'failed') {
              // Volver a la página de pago pendiente
              router.push('/payment/pending')
            } else {
              // Recargar para verificar estado
              window.location.reload()
            }
          } else {
            // Ir al inicio
            router.push('/')
          }
        }
        
      } catch (error) {
        console.error('❌ Error processing callback:', error);
        
        await Swal.fire({
          icon: 'error',
          title: 'Error de Procesamiento',
          text: 'Hubo un error al procesar la respuesta del pago. Por favor, contacta con soporte.',
          confirmButtonText: 'Ir al inicio',
          confirmButtonColor: '#ef4444'
        })
        
        router.push('/')
      } finally {
        setIsProcessing(false)
      }
    }

    // Procesar después de un pequeño delay para asegurar que los parámetros estén disponibles
    const timer = setTimeout(processCallback, 1000)
    
    return () => clearTimeout(timer)
  }, [searchParams, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Procesando tu pago...
          </h2>
          <p className="text-gray-600 mb-6">
            Estamos verificando el estado de tu transacción. 
            Por favor, no cierres esta ventana.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Este proceso puede tomar unos segundos
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Esto normalmente no se debería mostrar porque el useEffect maneja la redirección
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {callbackResult?.success ? (
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        ) : (
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {callbackResult?.success ? 'Pago Completado' : 'Pago No Completado'}
        </h2>
        <p className="text-gray-600">
          {callbackResult?.message || 'Procesando resultado...'}
        </p>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
