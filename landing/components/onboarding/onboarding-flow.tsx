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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Configurar tu App
            </h1>
            <div className="text-sm text-gray-500">
              Paso {currentStep} de {steps.length}
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-full bg-gray-200 h-0.5 mx-4" />
                )}
              </div>
            ))}
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
