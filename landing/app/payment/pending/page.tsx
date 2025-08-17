// landing\app\payment\pending\page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Loader2, ExternalLink, CheckCircle, AlertCircle, Home, LogOut } from "lucide-react"
import Link from "next/link"
import { paymentService } from "@/services/payment.service"

interface UserData {
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  brand: {
    id: number;
    name: string;
    description?: string;
    phone?: string;
  };
  plan: {
    id: number;
    type: string;
    price: number;
    features: string[];
    billingPeriod: string;
  };
  payment?: {
    status: string;
    tilopayReference?: string;
    processedAt?: string;
  };
}

export default function PaymentPendingPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string>('pending')

  useEffect(() => {
    // Obtener parámetros de la URL del lado del cliente
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const status = params.get('status') || 'pending'
      setPaymentStatus(status)

      // Cargar datos del usuario desde localStorage
      const userDataStr = localStorage.getItem('user_data')
      const brandDataStr = localStorage.getItem('brand_data')
      const brandPaymentInfoStr = localStorage.getItem('brand_payment_info')

      if (userDataStr && brandDataStr) {
        const user = JSON.parse(userDataStr)
        const brand = JSON.parse(brandDataStr)
        let brandPaymentInfo = null

        try {
          if (brandPaymentInfoStr) {
            brandPaymentInfo = JSON.parse(brandPaymentInfoStr)
          }
        } catch (e) {
          console.log('Error parsing brand payment info:', e)
        }

        const finalUserData = {
          user: brandPaymentInfo?.owner ? {
            ...user,
            firstName: brandPaymentInfo.owner.firstName,
            lastName: brandPaymentInfo.owner.lastName,
            email: brandPaymentInfo.owner.email
          } : user,
          brand: brandPaymentInfo ? {
            ...brand,
            name: brandPaymentInfo.name,
            phone: brandPaymentInfo.phone
          } : brand,
          plan: {
            id: 1,
            type: brandPaymentInfo?.plan?.type || brand.businessType || 'app',
            price: 185,
            features: ['Gestión de Citas', 'Catálogo de Servicios', 'Reportes', 'Notificaciones'],
            billingPeriod: brandPaymentInfo?.plan?.billingCycle || 'monthly'
          },
          payment: {
            status: status
          }
        }

        console.log('📋 Final user data for payment:', finalUserData)
        setUserData(finalUserData)
      }
    }
  }, [])

  const handlePayment = async () => {
    if (!userData) return

    setIsProcessing(true)
    setError(null)

    try {
      // Validar que tengamos todos los datos requeridos
      if (!userData.brand?.name || !userData.user?.email || !userData.user?.firstName || !userData.user?.lastName) {
        throw new Error('Faltan datos requeridos para procesar el pago');
      }

      // Asegurar que tenemos un teléfono válido
      const phone = userData.brand.phone && userData.brand.phone.trim().length > 0 
        ? userData.brand.phone.trim()
        : '25001000'; // Teléfono por defecto de Costa Rica
      
      console.log('📞 Using phone number:', phone);

      // Preparar datos para el pago según el formato del backend
      const paymentData = {
        name: userData.brand.name.trim(),
        email: userData.user.email.trim(),
        phone: phone,
        ownerName: `${userData.user.firstName.trim()} ${userData.user.lastName.trim()}`,
        location: 'San José, Costa Rica',
        planType: userData.plan.type,
        billingCycle: userData.plan.billingPeriod,
        selectedServices: userData.plan.features
      }

      console.log('💳 Creating payment with data:', paymentData);

      // Usar el servicio de pago
      const response = await paymentService.createPayment(paymentData)

      if (response.success && response.data?.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl)
        console.log('✅ Payment URL generated:', response.data.paymentUrl);

        // Redirigir a Tilopay en la misma ventana
        window.location.href = response.data.paymentUrl;

      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error al generar URL de pago'
        console.error('❌ Payment creation failed:', errorMsg);
        setError(errorMsg)
      }
    } catch (error) {
      console.error('💥 Payment error:', error)
      setError(error instanceof Error ? error.message : 'No se pudo procesar el pago. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('brand_data')
    localStorage.removeItem('refresh_token')
    window.location.href = '/'
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p>Cargando información...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Bienvenido, {userData.user.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Tu registro se completó exitosamente. Solo falta procesar el pago.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Inicio
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Alert de pago pendiente */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Pago Pendiente:</strong> Para activar completamente tu aplicación, necesitas completar el pago de tu suscripción.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Información de la empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Tu Registro
              </CardTitle>
              <CardDescription>
                Información registrada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Empresa:</span>
                <p className="text-gray-600">{userData.brand.name}</p>
              </div>
              <div>
                <span className="font-medium">Propietario:</span>
                <p className="text-gray-600">{userData.user.firstName} {userData.user.lastName}</p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-gray-600">{userData.user.email}</p>
              </div>
              {userData.brand.phone && (
                <div>
                  <span className="font-medium">Teléfono:</span>
                  <p className="text-gray-600">{userData.brand.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Plan Seleccionado
              </CardTitle>
              <CardDescription>
                Detalles de tu suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan:</span>
                <Badge variant="secondary">
                  {userData.plan.type === 'web' ? 'Solo Web' :
                    userData.plan.type === 'app' ? 'Solo App Móvil' :
                      'Web + App Completa'}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Facturación:</span>
                <span>{userData.plan.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}</span>
              </div>

              <div>
                <span className="font-medium">Funciones incluidas:</span>
                <ul className="mt-2 space-y-1">
                  {userData.plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total a pagar:</span>
                  <span className="text-green-600">
                    ${userData.plan.price.toFixed(2)}
                    {userData.plan.billingPeriod === 'monthly' ? '/mes' : '/año'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de pago */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Completar Pago</CardTitle>
            <CardDescription>
              Procesa tu pago de forma segura con Tilopay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Transacciones seguras</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Todas las tarjetas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Soporte 24/7</span>
                </div>
              </div>

              {paymentUrl && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    Se ha abierto una nueva ventana para completar tu pago.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(paymentUrl, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir página de pago
                  </Button>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Proceder al Pago - ${userData.plan.price.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Al hacer clic en "Proceder al Pago", serás redirigido a Tilopay para completar tu transacción de forma segura.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>¿Qué sigue después del pago?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-2">
                  1
                </div>
                <h4 className="font-medium mb-1">Desarrollo</h4>
                <p className="text-gray-600">Comenzamos a desarrollar tu aplicación personalizada</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-2">
                  2
                </div>
                <h4 className="font-medium mb-1">Personalización</h4>
                <p className="text-gray-600">Aplicamos tus colores y configuraciones</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-2">
                  3
                </div>
                <h4 className="font-medium mb-1">Entrega</h4>
                <p className="text-gray-600">Tu aplicación estará lista en 7-10 días hábiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
