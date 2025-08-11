"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, Building, Palette, CreditCard, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService, BrandRegistrationData } from "@/lib/api"
import { getBusinessType, getAppFeature } from "@/lib/business-types"

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
  "reportes": "Reportes y Analytics"
}

const colorPaletteNames: { [key: string]: string } = {
  "purple": "Púrpura Elegante",
  "blue": "Azul Profesional",
  "green": "Verde Natural",
  "orange": "Naranja Vibrante",
  "pink": "Rosa Moderno",
  "slate": "Gris Minimalista"
}

export function ConfirmationStep({ data, onNext, onPrev }: ConfirmationStepProps) {
  const { personalInfo, businessType, selectedFeatures, customization, plan } = data

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Confirma tu configuración</h2>
        <p className="mt-2 text-gray-600">
          Revisa toda la información antes de proceder al pago
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Información Personal</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <p className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{personalInfo.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Teléfono:</span>
              <p className="font-medium">{personalInfo.phone || "No especificado"}</p>
            </div>
            <div>
              <span className="text-gray-600">Negocio:</span>
              <p className="font-medium">{personalInfo.businessName}</p>
            </div>
          </div>
          {personalInfo.description && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm">Descripción:</span>
              <p className="text-sm mt-1">{personalInfo.description}</p>
            </div>
          )}
        </Card>

        {/* Business Type */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Tipo de Servicio</h3>
          </div>
          <p className="font-medium">{businessTypeNames[businessType] || businessType}</p>
        </Card>

        {/* Selected Features */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Check className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Funciones Seleccionadas</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {selectedFeatures.map((feature) => (
              <Badge key={feature} variant="secondary">
                {featureNames[feature] || feature}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Customization */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Personalización</h3>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600 text-sm">Paleta de colores:</span>
              <p className="font-medium">{colorPaletteNames[customization.colorPalette] || customization.colorPalette}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Logo:</span>
              <p className="font-medium">{customization.logo ? "Subido" : "No especificado"}</p>
            </div>
          </div>
        </Card>

        {/* Plan Summary */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Plan Seleccionado</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {plan.type === "monthly" ? "Plan Mensual" : "Plan Anual"}
              </span>
              <span className="text-lg font-bold text-purple-600">
                ${plan.price}/mes
              </span>
            </div>
            {plan.type === "annual" && (
              <p className="text-sm text-green-600">
                ✓ Incluye 20% de descuento por pago anual
              </p>
            )}
          </div>
        </Card>

        {/* Terms */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm space-y-2">
            <p className="font-medium">Al continuar, aceptas:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Nuestros términos y condiciones de servicio</li>
              <li>La política de privacidad</li>
              <li>El procesamiento de tus datos personales</li>
              <li>La facturación recurrente según el plan seleccionado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
          Proceder al Pago
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
