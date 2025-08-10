"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

// Import individual step components
import { PersonalInfoStep } from "./steps/personal-info-step"
import { BusinessInfoStep } from "./steps/business-info-step"
import { FeaturesStep } from "./steps/features-step"
import { CustomizationStep } from "./steps/customization-step"
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
    logo?: File
  }
  plan: {
    type: "monthly" | "annual"
    features: string[]
    price: number
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
      colorPalette: ""
    },
    plan: {
      type: "monthly",
      features: [],
      price: 0
    }
  })

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }))
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
          <CustomizationStep
            customization={data.customization}
            onChange={(customization) => updateData({ customization })}
            onNext={nextStep}
            onPrev={prevStep}
          />
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
      </div>
    </div>
  )
}
