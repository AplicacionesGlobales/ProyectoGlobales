"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Mail, Phone, ExternalLink, Home } from "lucide-react"
import Link from "next/link"

interface SuccessStepProps {
  data: {
    personalInfo: {
      firstName: string
      lastName: string
      email: string
      username: string
      phone: string
      businessName: string
    }
    plan: {
      type: "web" | "app" | "complete"
      price: number
      billingPeriod?: "monthly" | "annual"
    }
  }
}

export function SuccessStep({ data }: SuccessStepProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirigir al login o dashboard
          window.location.href = '/auth/login'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const isFreePlan = data.plan.type === 'web' && data.plan.price === 0
  const estimatedDays = isFreePlan ? 10 : 7

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido a Aplicaciones Globales!
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Tu registro se ha completado exitosamente
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-auto max-w-md">
          <p className="text-green-800 font-medium">
            🎉 Tu aplicación estará lista en {estimatedDays} días hábiles
          </p>
        </div>
      </div>

      {/* Información del registro */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Información Registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Empresa:</span>
              <p className="text-gray-600">{data.personalInfo.businessName}</p>
            </div>
            <div>
              <span className="font-medium">Propietario:</span>
              <p className="text-gray-600">{data.personalInfo.firstName} {data.personalInfo.lastName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{data.personalInfo.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Próximos Pasos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Desarrollo Inicial</p>
                <p className="text-sm text-gray-600">Creación de la estructura base (2-3 días)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Personalización</p>
                <p className="text-sm text-gray-600">Aplicación de colores y diseño (2-3 días)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Entrega</p>
                <p className="text-sm text-gray-600">Configuración final y entrega (1-2 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información importante */}
      <Card>
        <CardHeader>
          <CardTitle>📧 Te mantendremos informado</CardTitle>
          <CardDescription>
            Recibirás actualizaciones sobre el progreso de tu aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Notificaciones por Email</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Confirmación de inicio de desarrollo</li>
                <li>• Actualizaciones de progreso</li>
                <li>• Enlace de tu aplicación lista</li>
                <li>• Instrucciones de acceso</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Soporte Disponible</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Chat en vivo 9AM - 6PM</li>
                <li>• Email de soporte 24/7</li>
                <li>• Documentación completa</li>
                <li>• Videos tutoriales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-500">
          Serás redirigido al login en {countdown} segundos...
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/auth/login">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Ir al Login
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
