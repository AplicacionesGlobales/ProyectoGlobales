"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, Building, Palette, CreditCard, Loader2, AlertCircle, Sparkles, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService, BrandRegistrationData } from "@/lib/services/auth.service"
import { useLandingData } from "@/hooks/use-landing-data"
import { useValidation } from "@/hooks/use-validation"
import { convertFilesForRegistration } from "@/lib/utils/file-utils"
import { Icon } from "@/lib/icons"

interface ConfirmationStepProps {
  data: {
    personalInfo: {
      firstName: string
      lastName: string
      email: string
      username: string
      phone: string
      businessName: string
      description: string
      password: string
      confirmPassword: string
    }
    businessType: string
    selectedFeatures: string[]
    customization: {
      colorPalette: string
      customColors: string[]
      logoUrl?: File
      isotopoUrl?: File
      imagotipoUrl?: File
    }
    plan: {
      type: "web" | "app" | "complete"
      features: string[]
      price: number
      billingPeriod?: "monthly" | "annual"
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

  const { 
    businessTypes, 
    features, 
    loading, 
    error: apiError,
    getBusinessTypeByKey 
  } = useLandingData();

  const businessTypeInfo = getBusinessTypeByKey(data.businessType)

  // Helper function to generate plan ID
  const generatePlanId = (type: string, billingPeriod: string) => {
    return `${type}_${billingPeriod}`;
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  // Handle error state
  if (apiError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg mb-4">Error al cargar los datos.</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }
  
  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)

    try {
      // Convert images to base64 if they exist
      const imageFiles = await convertFilesForRegistration({
        logoUrl: data.customization.logoUrl,
        isotopoUrl: data.customization.isotopoUrl,
        imagotipoUrl: data.customization.imagotipoUrl
      });

      // Preparar paleta de colores
      let finalColorPalette;
      if (data.customization.colorPalette === 'custom' && data.customization.customColors && data.customization.customColors.length >= 5) {
        // Si es custom y tiene al menos 5 colores, usar esos colores
        finalColorPalette = {
          primary: data.customization.customColors[0],
          secondary: data.customization.customColors[1], 
          accent: data.customization.customColors[2],
          neutral: data.customization.customColors[3],
          success: data.customization.customColors[4]
        };
      } else {
        // Si es una paleta predeterminada, usar esa paleta
        finalColorPalette = colorPalettes[data.customization.colorPalette] || colorPalettes.modern;
      }

      // Get planId - generate based on type and billing period
      const planId = generatePlanId(data.plan.type, data.plan.billingPeriod || 'monthly');

      // Prepare registration data with ONLY IDs and processed data for backend
      const registrationData: BrandRegistrationData = {
        // User authentication info
        email: data.personalInfo.email,
        username: data.personalInfo.username, // Ya validado en personal-info-step
        password: data.personalInfo.password,
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,

        // Brand info
        brandName: data.personalInfo.businessName,
        brandDescription: data.personalInfo.description || undefined,
        brandPhone: data.personalInfo.phone || undefined,

        // Business details - SOLO IDs
        businessTypeId: data.businessType, // Solo el ID del tipo de negocio
        selectedFeatureIds: data.selectedFeatures, // Solo los IDs de las features

        // Customization - SOLO los 5 colores hexadecimales
        colorPalette: finalColorPalette, // Los 5 colores hex procesados

        // Images as base64 strings
        ...imageFiles,

        // Plan information - SOLO ID y billing period
        planId: planId, // ID del plan basado en tipo y billing
        planBillingPeriod: data.plan.billingPeriod || 'monthly', // 'monthly' o 'annual'
        finalPrice: data.plan.price, // Precio final calculado

        // Additional metadata
        registrationDate: new Date().toISOString(),
        source: 'landing_onboarding'
      }

      console.log('=== DATOS ENVIADOS AL BACKEND (SOLO IDs y DATOS PROCESADOS) ===')
      console.log('Registration Data enviada:', JSON.stringify(registrationData, null, 2))
      console.log('=== DETALLES DE LO QUE SE ENVÍA ===')
      console.log('Business Type ID:', data.businessType)
      console.log('Selected Feature IDs:', data.selectedFeatures)
      console.log('Plan ID:', planId)
      console.log('Plan Billing Period:', data.plan.billingPeriod)
      console.log('Final Price:', data.plan.price)
      console.log('Color Palette (5 hex colors):', finalColorPalette)
      console.log('Images converted to base64:', {
        logo: !!imageFiles.logoImage,
        isotopo: !!imageFiles.isotopoImage, 
        imagotipo: !!imageFiles.imagotipoImage
      })
      console.log('===========================================')

      // Test backend connection first
      const healthCheck = await authService.healthCheck()
      console.log('Backend health:', healthCheck)

      // Register brand
      console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++',registrationData);
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
              <p className="text-gray-500">Contraseña</p>
              <p className="font-medium">{'*'.repeat(data.personalInfo.password.length)} (configurada)</p>
            </div>
            <div>
              <p className="text-gray-500">Username</p>
              <p className="font-medium">{data.personalInfo.username || 'No especificado'}</p>
            </div>
            <div className="md:col-span-2">
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
            <p className="font-medium">{businessTypeInfo?.title || data.businessType}</p>
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
              const feature = features.find(f => f.key === featureId)
              return (
                <Badge key={featureId} variant="secondary" className="px-3 py-1">
                  <Sparkles className="w-3 h-3" />
                  {feature?.title || featureId}
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
          
          {/* Plan type and basic info */}
          <div className="mb-4">
            <p className="font-medium capitalize text-lg">
              {data.plan.type === 'web' ? 'Solo Web' : 
               data.plan.type === 'app' ? 'Solo App Móvil' : 
               'Web + App Completa'} - {data.plan.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}
            </p>
            <p className="text-sm text-gray-500">{data.selectedFeatures.length} funciones seleccionadas</p>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Plan base:</span>
              <span>
                {data.plan.type === 'web' ? (
                  '$0/mes'
                ) : data.plan.billingPeriod === 'annual' ? (
                  `$${data.plan.type === 'app' ? '59' : '60'} × 12 × 0.8 = $${data.plan.type === 'app' ? '566' : '576'}/año`
                ) : (
                  `$${data.plan.type === 'app' ? '59' : '60'}/mes`
                )}
              </span>
            </div>
            
            {data.selectedFeatures.length > 0 && (
              <>
                <div className="text-sm font-medium text-gray-700 pt-2 border-t">Funciones adicionales:</div>
                {data.selectedFeatures.map(featureId => {
                  const feature = features.find(f => f.key === featureId);
                  if (!feature) return null;
                  const monthlyPrice = feature.price;
                  const yearlyPrice = data.plan.billingPeriod === 'annual' ? monthlyPrice * 12 * 0.8 : monthlyPrice;
                  
                  return (
                    <div key={featureId} className="flex justify-between text-sm">
                      <span>• {feature.title}</span>
                      <span>
                        {data.plan.billingPeriod === 'annual' 
                          ? `$${monthlyPrice} × 12 × 0.8 = $${yearlyPrice.toFixed(2)}/año`
                          : `$${monthlyPrice}/mes`
                        }
                      </span>
                    </div>
                  );
                })}
                {data.plan.billingPeriod === 'annual' && (
                  <div className="flex justify-between text-sm text-green-600 pt-1 border-t">
                    <span>Descuento anual (20%):</span>
                    <span>¡Incluido!</span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${data.plan.price.toFixed(2)}{data.plan.billingPeriod === 'monthly' ? '/mes' : '/año'}</span>
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
          className="gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
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
