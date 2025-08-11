"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, Building, Palette, CreditCard, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService, BrandRegistrationData } from "@/lib/api"
import { getBusinessType, getAppFeature } from "@/lib/business-types"
import { Icon } from "@/lib/icons"

interface ConfirmationStepProps {
  data: {
    personalInfo: {
      firstName: string
      lastName: string
      email: string
      phone: string
      businessName: string
      description: string
    }
    businessType: string
    selectedFeatures: string[]
    customization: {
      colorPalette: string
      logo?: File
    }
    plan: {
      type: "monthly" | "annual"
      features: string[]
      price: number
    }
  }
  onNext: () => void
  onPrev: () => void
}

// Color palettes mapping
const colorPalettes: { [key: string]: any } = {
  "modern": {
    primary: "#1a73e8",
    secondary: "#34a853", 
    accent: "#fbbc04",
    neutral: "#9aa0a6",
    success: "#137333"
  },
  "warm": {
    primary: "#f57c00",
    secondary: "#ff7043",
    accent: "#ffc107",
    neutral: "#8d6e63",
    success: "#689f38"
  },
  "cool": {
    primary: "#00acc1",
    secondary: "#26a69a",
    accent: "#42a5f5",
    neutral: "#78909c",
    success: "#66bb6a"
  }
}

export function ConfirmationStep({ data, onNext, onPrev }: ConfirmationStepProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const businessTypeInfo = getBusinessType(data.businessType)
  
  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)

    try {
      // Prepare registration data
      const registrationData: BrandRegistrationData = {
        // User info
        email: data.personalInfo.email,
        username: data.personalInfo.email.split('@')[0] + '_' + Date.now(), // Generate unique username
        password: 'temp_password_' + Date.now(), // Generate temporary password
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,

        // Brand info
        brandName: data.personalInfo.businessName,
        brandDescription: data.personalInfo.description || undefined,
        brandAddress: undefined, // Could be added to personal info form
        brandPhone: data.personalInfo.phone || undefined,

        // Color palette
        colorPalette: colorPalettes[data.customization.colorPalette] || colorPalettes.modern
      }

      console.log('Registering brand:', registrationData)

      // Test backend connection first
      const healthCheck = await authService.healthCheck()
      console.log('Backend health:', healthCheck)

      // Register brand
      const result = await authService.registerBrand(registrationData)
      
      if (result.success && result.data) {
        console.log('Registration successful:', result.data)
        // Store auth token and user data
        localStorage.setItem('auth_token', result.data.token)
        localStorage.setItem('user_data', JSON.stringify(result.data.user))
        localStorage.setItem('brand_data', JSON.stringify(result.data.brand))
        
        // Proceed to next step (success/dashboard)
        onNext()
      } else {
        setError(result.errors?.map(e => e.description).join(', ') || 'Error en el registro')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      setError('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Confirma tu información</h2>
        <p className="mt-2 text-gray-600">
          Revisa que todos los datos sean correctos antes de crear tu aplicación
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Información Personal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nombre completo</p>
              <p className="font-medium">{data.personalInfo.firstName} {data.personalInfo.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{data.personalInfo.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Teléfono</p>
              <p className="font-medium">{data.personalInfo.phone || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-gray-500">Nombre del negocio</p>
              <p className="font-medium">{data.personalInfo.businessName}</p>
            </div>
            {data.personalInfo.description && (
              <div className="md:col-span-2">
                <p className="text-gray-500">Descripción</p>
                <p className="font-medium">{data.personalInfo.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Business Type */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Tipo de Negocio</h3>
          </div>
          <div className="flex items-center gap-3">
            <Icon name={businessTypeInfo?.icon || "otro"} size={24} className="text-blue-600" />
            <p className="font-medium">{businessTypeInfo?.name || data.businessType}</p>
          </div>
        </Card>

        {/* Selected Features */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Funciones Seleccionadas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.selectedFeatures.map((featureId) => {
              const feature = getAppFeature(featureId)
              return (
                <Badge key={featureId} variant="secondary" className="px-3 py-1">
                  <span className="mr-1">{feature?.icon}</span>
                  {feature?.name || featureId}
                </Badge>
              )
            })}
          </div>
        </Card>

        {/* Customization */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-gray-900">Personalización</h3>
          </div>
          <div>
            <p className="text-gray-500">Paleta de colores</p>
            <p className="font-medium capitalize">{data.customization.colorPalette}</p>
          </div>
        </Card>

        {/* Plan */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Plan Seleccionado</h3>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium capitalize">{data.plan.type === 'monthly' ? 'Mensual' : 'Anual'}</p>
              <p className="text-sm text-gray-500">{data.selectedFeatures.length} funciones incluidas</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${data.plan.price}</p>
              <p className="text-sm text-gray-500">{data.plan.type === 'monthly' ? '/mes' : '/año'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} disabled={isRegistering} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        <Button 
          onClick={handleRegister} 
          disabled={isRegistering}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando tu aplicación...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Crear mi aplicación
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
