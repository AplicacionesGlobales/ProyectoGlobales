"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Lock, Check } from "lucide-react"

interface PaymentStepProps {
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
  onComplete: () => void
  onPrev: () => void
}

export function PaymentStep({ data, onComplete, onPrev }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleCardChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsProcessing(false)
    setIsComplete(true)
    
    // Complete after showing success
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/').substr(0, 5)
  }

  if (isComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Pago Procesado!</h2>
          <p className="mt-2 text-gray-600">
            Tu aplicación está siendo configurada. Recibirás un email con los detalles de acceso.
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            Tiempo estimado de entrega: <strong>10 días hábiles</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Finalizar Pago</h2>
        <p className="mt-2 text-gray-600">
          Ingresa los datos de tu tarjeta para completar la suscripción
        </p>
      </div>

      {/* Order Summary */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Resumen de la orden</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Plan {data.plan.type === "monthly" ? "Mensual" : "Anual"}</span>
            <span>${data.plan.price}/mes</span>
          </div>
          <div className="flex justify-between">
            <span>Funciones adicionales ({data.selectedFeatures.length})</span>
            <span>Incluidas</span>
          </div>
          {data.plan.type === "annual" && (
            <div className="flex justify-between text-green-600">
              <span>Descuento anual</span>
              <span>-20%</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total a pagar hoy:</span>
            <span>${data.plan.price}{data.plan.type === "annual" ? " x 12 meses" : ""}</span>
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <div>
        <Label className="text-base font-medium mb-4 block">Método de pago</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta de crédito/débito</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Card Details */}
      {paymentMethod === "card" && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">Nombre en la tarjeta</Label>
              <Input
                id="cardName"
                value={cardData.name}
                onChange={handleCardChange("name")}
                placeholder="Juan Pérez"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Número de tarjeta</Label>
              <Input
                id="cardNumber"
                value={formatCardNumber(cardData.number)}
                onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value.replace(/\s/g, '') }))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Fecha de vencimiento</Label>
                <Input
                  id="expiry"
                  value={formatExpiry(cardData.expiry)}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value.replace(/\D/g, '') }))}
                  placeholder="MM/AA"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cardData.cvv}
                  onChange={handleCardChange("cvv")}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="w-4 h-4" />
        <span>Tu información está protegida con cifrado SSL de 256 bits</span>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="flex items-center gap-2" disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button 
          onClick={handlePayment} 
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          disabled={!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pagar ${data.plan.price}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
