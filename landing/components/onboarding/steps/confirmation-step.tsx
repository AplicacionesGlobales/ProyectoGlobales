"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, User, Mail, Phone, Building, Palette, CreditCard, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService, BrandRegistrationData } from "@/services/auth.service"
import { filesService } from "@/services/files.service"
import { useLandingData } from "@/hooks/use-landing-data"
import { Icon } from "@/lib/icons"
import { ImageUploadProgress } from "../image-upload-progress"

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
    primary: "#8B5CF6",
    secondary: "#EC4899", 
    accent: "#5c4343",
    neutral: "#10B981",
    success: "#3B82F6"
  },
  "professional": {
    primary: "#1F2937",
    secondary: "#374151",
    accent: "#6B7280",
    neutral: "#9CA3AF",
    success: "#E5E7EB"
  },
  "nature": {
    primary: "#065F46",
    secondary: "#047857",
    accent: "#059669",
    neutral: "#10B981",
    success: "#34D399"
  },
  "sunset": {
    primary: "#92400E",
    secondary: "#D97706",
    accent: "#F59E0B",
    neutral: "#FCD34D",
    success: "#FEF3C7"
  },
  "ocean": {
    primary: "#1E3A8A",
    secondary: "#3B82F6",
    accent: "#60A5FA",
    neutral: "#93C5FD",
    success: "#DBEAFE"
  }
}

export function ConfirmationStep({ data, onNext, onPrev }: ConfirmationStepProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    logo?: { success: boolean; error?: string };
    isotipo?: { success: boolean; error?: string };
    imagotipo?: { success: boolean; error?: string };
  } | undefined>(undefined)
  
  const { 
    businessTypes, 
    features, 
    plans,
    loading, 
    error: apiError,
    getBusinessTypeByKey 
  } = useLandingData();

  const businessTypeInfo = getBusinessTypeByKey(data.businessType)
  
  // Get business type ID and plan ID
  const getBusinessTypeId = () => {
    const businessType = businessTypes.find(bt => bt.key === data.businessType)
    return businessType?.id || null
  }

  const getSelectedFeatureIds = () => {
    return data.selectedFeatures.map(featureKey => {
      const feature = features.find(f => f.key === featureKey)
      return feature?.id
    }).filter(Boolean) // Remove any undefined values
  }

  const getPlanId = () => {
    const plan = plans.find(p => p.type === data.plan.type)
    return plan?.id || null
  }

  // Helper functions for UI display
  const getFeatureNames = () => {
    return data.selectedFeatures.map(featureKey => {
      const feature = features.find(f => f.key === featureKey)
      return feature?.title || featureKey
    })
  }

  const calculateTotalPrice = () => {
    const planBasePrice = plans.find(p => p.type === data.plan.type)?.basePrice || 0
    const featuresPrice = data.selectedFeatures.reduce((total, featureKey) => {
      const feature = features.find(f => f.key === featureKey)
      return total + (feature?.price || 0)
    }, 0)
    
    const monthlyTotal = planBasePrice + featuresPrice
    
    // If annual billing, apply 20% discount
    if (data.plan.billingPeriod === 'annual') {
      return monthlyTotal * 12 * 0.8
    }
    
    return monthlyTotal
  }

  const getPlanName = () => {
    const planNames = {
      'web': 'Solo Web',
      'app': 'Solo App Móvil', 
      'complete': 'Web + App Completa'
    }
    return planNames[data.plan.type] || data.plan.type
  }

  // Helper function to calculate features price for UI
  const calculateFeaturesPrice = () => {
    return data.selectedFeatures.reduce((total, featureKey) => {
      const feature = features.find(f => f.key === featureKey)
      return total + (feature?.price || 0)
    }, 0)
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)
    
    try {
      console.log('� Starting brand registration...');

      // Prepare color palette
      let finalColorPalette;
      if (data.customization.colorPalette === 'custom' && data.customization.customColors?.length >= 5) {
        finalColorPalette = {
          primary: data.customization.customColors[0],
          secondary: data.customization.customColors[1], 
          accent: data.customization.customColors[2],
          neutral: data.customization.customColors[3],
          success: data.customization.customColors[4]
        };
      } else {
        finalColorPalette = colorPalettes[data.customization.colorPalette] || colorPalettes.modern;
      }

      // Get IDs for backend
      const businessTypeId = getBusinessTypeId()
      const selectedFeatureIds = getSelectedFeatureIds()
      const planId = getPlanId()

      if (!businessTypeId || !planId) {
        throw new Error('Error obteniendo IDs de negocio o plan')
      }

      // Calculate total price for validation
      const totalPrice = calculateTotalPrice()

      // Prepare registration data WITHOUT images
      const registrationData: BrandRegistrationData = {
        // User info
        email: data.personalInfo.email,
        username: data.personalInfo.username,
        password: data.personalInfo.password,
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        
        // Brand info
        brandName: data.personalInfo.businessName,
        brandDescription: data.personalInfo.description || undefined,
        brandPhone: data.personalInfo.phone || undefined,
        
        // Business details - ONLY NUMERIC IDs
        businessTypeId: businessTypeId,
        selectedFeatureIds: selectedFeatureIds.filter((id): id is number => id !== undefined),
        
        // Customization
        colorPalette: finalColorPalette,
        
        // Plan information - ONLY NUMERIC ID
        planId: planId,
        planBillingPeriod: data.plan.billingPeriod || 'monthly',
        totalPrice: totalPrice,
        
        // Metadata
        registrationDate: new Date().toISOString(),
        source: 'landing_onboarding'
      }

      console.log('📤 Registering brand without images...');
      console.log('Business Type ID:', businessTypeId);
      console.log('Selected Feature IDs:', selectedFeatureIds);
      console.log('Plan ID:', planId);
      console.log('Total Price:', totalPrice);

      // Step 1: Register brand without images
      const result = await authService.registerBrand(registrationData)
      
      if (!result.success || !result.data) {
        throw new Error(result.errors?.map(e => e.description).join(', ') || 'Error en el registro')
      }

      console.log('✅ Brand registered successfully:', result.data.brand.id);

      // Store auth data immediately
      localStorage.setItem('auth_token', result.data.token)
      localStorage.setItem('user_data', JSON.stringify(result.data.user))
      localStorage.setItem('brand_data', JSON.stringify(result.data.brand))

      console.log('🔐 Token saved to localStorage:', {
        hasToken: !!result.data.token,
        tokenLength: result.data.token?.length
      });

      // Wait a moment to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 2: Upload images if they exist
      const hasImages = data.customization.logoUrl || data.customization.isotopoUrl || data.customization.imagotipoUrl;
      
      console.log('🔍 Checking for images to upload:', {
        hasImages,
        logoExists: !!data.customization.logoUrl,
        isotipoExists: !!data.customization.isotopoUrl,
        imagotipoExists: !!data.customization.imagotipoUrl,
        logoFile: data.customization.logoUrl ? { name: data.customization.logoUrl.name, size: data.customization.logoUrl.size } : null,
        isotipoFile: data.customization.isotopoUrl ? { name: data.customization.isotopoUrl.name, size: data.customization.isotopoUrl.size } : null,
        imagotipoFile: data.customization.imagotipoUrl ? { name: data.customization.imagotipoUrl.name, size: data.customization.imagotipoUrl.size } : null
      });
      
      if (hasImages) {
        console.log('📤 Uploading brand images...');
        
        const imagesToUpload = {
          logo: data.customization.logoUrl,
          isotipo: data.customization.isotopoUrl,
          imagotipo: data.customization.imagotipoUrl
        };

        console.log('📤 Images to upload object:', imagesToUpload);

        const uploadResult = await filesService.uploadMultipleBrandImages(
          imagesToUpload,
          result.data.brand.id,
          result.data.user.id
        );

        console.log('📤 Upload result:', uploadResult);

        // Update progress state
        setUploadProgress(uploadResult.results);

        if (!uploadResult.success) {
          console.warn('⚠️ Some images failed to upload:', uploadResult.errors);
          // Don't fail the entire registration for image upload errors
          // The user can upload images later
        } else {
          console.log('✅ All images uploaded successfully');
        }
      } else {
        console.log('ℹ️ No images to upload');
      }

      console.log('🎉 Registration completed successfully');
      onNext()
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      setError(error instanceof Error ? error.message : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setIsRegistering(false)
    }
  }

  // Handle loading/error states
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-600">Cargando datos...</span>
      </div>
    );
  }

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

  const infoSections = [
    {
      icon: User,
      title: "Información Personal",
      color: "text-blue-500",
      fields: [
        { label: "Nombre completo", value: `${data.personalInfo.firstName} ${data.personalInfo.lastName}` },
        { label: "Email", value: data.personalInfo.email },
        { label: "Username", value: data.personalInfo.username },
        { label: "Teléfono", value: data.personalInfo.phone || 'No especificado' },
        { label: "Contraseña", value: `${'*'.repeat(data.personalInfo.password.length)} (configurada)` },
        { label: "Nombre del negocio", value: data.personalInfo.businessName, fullWidth: true },
        ...(data.personalInfo.description ? [{ label: "Descripción", value: data.personalInfo.description, fullWidth: true }] : [])
      ]
    }
  ];

  const featuresPrice = calculateFeaturesPrice()
  const planBasePrice = plans.find(p => p.type === data.plan.type)?.basePrice || 0

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
        {infoSections.map((section) => (
          <Card key={section.title} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <section.icon className={`w-5 h-5 ${section.color}`} />
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {section.fields.map((field, index) => (
                <div key={index} className={field.fullWidth ? "md:col-span-2" : ""}>
                  <p className="text-gray-500">{field.label}</p>
                  <p className="font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Business Type */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Tipo de Negocio</h3>
          </div>
          <div className="flex items-center gap-3">
            <Icon name={businessTypeInfo?.icon || "Settings"} size={24} className="text-blue-600" />
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
            {getFeatureNames().map((featureName, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                {featureName}
              </Badge>
            ))}
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
          
          <div className="mb-4">
            <p className="font-medium text-lg">
              {getPlanName()} - {data.plan.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}
            </p>
            <p className="text-sm text-gray-500">{data.selectedFeatures.length} funciones seleccionadas</p>
          </div>

          <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Plan base:</span>
              <span>
                {data.plan.type === 'web' ? '$0/mes' : 
                 data.plan.billingPeriod === 'annual' ? 
                 `$${planBasePrice} × 12 × 0.8 = $${(planBasePrice * 12 * 0.8).toFixed(0)}/año` :
                 `$${planBasePrice}/mes`}
              </span>
            </div>
            
            {data.selectedFeatures.length > 0 && (
              <>
                <div className="text-sm font-medium text-gray-700 pt-2 border-t">Funciones adicionales:</div>
                {data.selectedFeatures.map(featureKey => {
                  const feature = features.find(f => f.key === featureKey);
                  if (!feature) return null;
                  
                  const monthlyPrice = feature.price;
                  const yearlyPrice = data.plan.billingPeriod === 'annual' ? monthlyPrice * 12 * 0.8 : monthlyPrice;
                  
                  return (
                    <div key={featureKey} className="flex justify-between text-sm">
                      <span>• {feature.title}</span>
                      <span>
                        {data.plan.billingPeriod === 'annual' 
                          ? `$${monthlyPrice} × 12 × 0.8 = $${yearlyPrice.toFixed(2)}/año`
                          : `$${monthlyPrice}/mes`}
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
              <span>${calculateTotalPrice().toFixed(2)}{data.plan.billingPeriod === 'monthly' ? '/mes' : '/año'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Image Upload Progress */}
      {isRegistering && (
        <ImageUploadProgress
          images={{
            logo: data.customization.logoUrl,
            isotipo: data.customization.isotopoUrl,
            imagotipo: data.customization.imagotipoUrl
          }}
          uploadResults={uploadProgress}
          isUploading={isRegistering}
        />
      )}

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