// app/payment/callback/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { paymentService } from "@/services/payment.service"
import Swal from 'sweetalert2'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await paymentService.handlePaymentCallback(searchParams)
        
        setIsProcessing(false)
        
        if (result.success && result.status === 'completed') {
          // Guardar datos en localStorage si existen
          if (result.paymentData) {
            const userData = localStorage.getItem('user_data')
            const brandData = localStorage.getItem('brand_data')
            
            if (userData && brandData) {
              const user = JSON.parse(userData)
              const brand = JSON.parse(brandData)
              
              const dashboardData = {
                id: user.id?.toString() || '1',
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                businessType: 'app',
                brandName: brand.name,
                plan: result.paymentData.plan?.name || 'app',
                paymentStatus: 'paid',
                createdAt: new Date().toISOString(),
                orderNumber: result.orderNumber
              }
              
              localStorage.setItem('userData', JSON.stringify(dashboardData))
            }
          }
          
          await Swal.fire({
            icon: 'success',
            title: '¡Pago Completado!',
            text: result.message,
            confirmButtonText: 'Ir al Panel',
            confirmButtonColor: '#10b981',
          })
          
          router.push('/panel/dashboard')
          
        } else {
          const swalResult = await Swal.fire({
            icon: 'error',
            title: 'Pago No Completado',
            text: result.message,
            showCancelButton: true,
            confirmButtonText: 'Intentar de nuevo',
            cancelButtonText: 'Ir al inicio',
            confirmButtonColor: '#ef4444',
          })
          
          if (swalResult.isConfirmed) {
            router.push('/payment/pending')
          } else {
            router.push('/')
          }
        }
        
      } catch (error) {
        console.error('Error:', error)
        setIsProcessing(false)
        
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al procesar el pago',
          confirmButtonText: 'Ir al inicio',
        })
        
        router.push('/')
      }
    }

    processCallback()
  }, [searchParams, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verificando tu pago...
          </h2>
          <p className="text-gray-600">
            Por favor espera, estamos consultando tu transacción con Tilopay.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}