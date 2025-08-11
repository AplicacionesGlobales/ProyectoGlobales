"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Home } from "lucide-react"
import Link from "next/link"

// Import individual step components
import { PersonalInfoStep } from "./steps/personal-info-step"
import { BusinessInfoStep } from "./steps/business-info-step"
import { FeaturesStep } from "./steps/features-step"
import { CustomizationStepNew } from "../customization-step-new"
import { PricingStep } from "./steps/pricing-step"
import { ConfirmationStep } from "./steps/confirmation-step"
import { PaymentStep } from "./steps/payment-step"

export interface OnboardingData {
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

const steps = [
  { id: 1, title: "Información Personal", description: "Cuéntanos sobre ti" },
  { id: 2, title: "Tu Servicio", description: "Detalles de tu negocio" },
  { id: 3, title: "Funciones", description: "¿Qué necesitas en tu app?" },
  { id: 4, title: "Personalización", description: "Colores y diseño" },
  { id: 5, title: "Plan", description: "Elige tu modalidad" },
  { id: 6, title: "Confirmación", description: "¡Casi listo!" },
  { id: 7, title: "Pago", description: "Procesar suscripción" },
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      businessName: "",
      description: ""
    },
    businessType: "",
    selectedFeatures: [],
    customization: {
      colorPalette: "",
      customColors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"]
    },
    plan: {
      type: "web",
      features: [],
      price: 0,
      billingPeriod: "monthly"
    }
  })

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }))
  }

  const handleCustomColorChange = (index: number, color: string) => {
    const newColors = [...data.customization.customColors]
    newColors[index] = color
    updateData({
      customization: {
        ...data.customization,
        customColors: newColors
      }
    })
  }

  const handleFileChange = (field: string, file: File | null) => {
    updateData({
      customization: {
        ...data.customization,
        [field]: file
      }
    })
  }

  const handleCustomizationChange = (field: string, value: any) => {
    console.log('handleCustomizationChange called with:', field, value); // Debug log
    
    // Mapear correctamente los campos
    if (field === "paletaColores") {
      updateData({
        customization: {
          ...data.customization,
          colorPalette: value
        }
      })
    } else {
      // Para otros campos como logos
      const fieldMapping: { [key: string]: string } = {
        'logotipo': 'logoUrl',
        'isotipo': 'isotopoUrl', 
        'imagotipo': 'imagotipoUrl'
      }
      
      const mappedField = fieldMapping[field] || field
      
      updateData({
        customization: {
          ...data.customization,
          [mappedField]: value
        }
      })
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // TODO: Enviar datos al backend
    console.log("Onboarding completed:", data)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={data.personalInfo}
            onChange={(personalInfo) => updateData({ personalInfo })}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <BusinessInfoStep
            businessType={data.businessType}
            onChange={(businessType) => updateData({ businessType })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <FeaturesStep
            features={data.selectedFeatures}
            businessType={data.businessType}
            onChange={(selectedFeatures) => updateData({ selectedFeatures })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Personaliza tu App</h2>
              <p className="mt-2 text-gray-600">
                Elige los colores y sube tus logos para darle identidad a tu aplicación
              </p>
            </div>
            <CustomizationStepNew
              formData={{
                paletaColores: data.customization.colorPalette,
                coloresPersonalizados: data.customization.customColors,
                logotipo: data.customization.logoUrl || null,
                isotipo: data.customization.isotopoUrl || null,
                imagotipo: data.customization.imagotipoUrl || null,
              }}
              onInputChange={handleCustomizationChange}
              onCustomColorChange={handleCustomColorChange}
              onFileChange={handleFileChange}
            />
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={!data.customization.colorPalette} 
                className="flex items-center gap-2"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      case 5:
        return (
          <PricingStep
            plan={data.plan}
            selectedFeatures={data.selectedFeatures}
            onChange={(plan) => updateData({ plan })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 6:
        return (
          <ConfirmationStep
            data={data}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 7:
        return (
          <PaymentStep
            data={data}
            onComplete={handleComplete}
            onPrev={prevStep}
          />
        )
      default:
        return null
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          {/* Título y contador de paso */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Configurar tu App
              </h1>
              <p className="text-gray-600 mt-1">
                Te ayudamos a personalizar tu aplicación paso a paso
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-700">
                Paso {currentStep} de {steps.length}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(progress)}% completado
              </div>
            </div>
          </div>
          
          {/* Progress Steps - Diseño simplificado */}
          <div className="relative">
            {/* Línea de conexión */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200"></div>
            <div 
              className="absolute top-5 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 ease-out"
              style={{ 
                left: '20px',
                width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 40px + ${(currentStep - 1) * 40 / (steps.length - 1)}px)` 
              }}
            ></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.id
                const isCurrent = currentStep === step.id
                
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center"
                  >
                    {/* Círculo del paso */}
                    <div className="relative mb-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                            : isCurrent
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-purple-200"
                            : "bg-white border-2 border-gray-300 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                    </div>
                    
                    {/* Título del paso */}
                    <div className="text-center max-w-20">
                      <div className={`text-xs font-medium leading-tight ${
                        isCurrent 
                          ? "text-purple-600" 
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation to Home */}
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 px-6 py-3">
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
