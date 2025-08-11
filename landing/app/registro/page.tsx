"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Upload, Check, Smartphone, Monitor, FileImage, Clock, Palette } from "lucide-react"
import Link from "next/link"
import { CustomizationStepNew } from "@/components/customization-step-new"
import { Icon } from "@/lib/icons"
import { useLandingData } from "@/hooks/use-landing-data"

const steps = [
  { id: 1, title: "Información Personal", description: "Cuéntanos sobre ti" },
  { id: 2, title: "Tu Servicio", description: "Detalles de tu negocio de citas" },
  { id: 3, title: "Funciones", description: "¿Qué necesitas en tu app?" },
  { id: 4, title: "Personalización", description: "Colores y diseño" },
  { id: 5, title: "Plan", description: "Elige tu modalidad" },
  { id: 6, title: "Confirmación", description: "¡Casi listo!" },
  { id: 7, title: "Pago", description: "Procesar suscripción" },
]

export default function RegistroPage() {
  const { config, businessTypes, features, plans, loading, error, calculateTotalPrice } = useLandingData()
  
  // Console logs para debug
  console.log('RegistroPage - Data state:', {
    config,
    businessTypes: businessTypes?.length,
    features: features?.length,
    plans: plans?.length,
    loading,
    error
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Información Personal
    nombre: "",
    email: "",
    telefono: "",
    cedula: null,

    // Paso 2: Tu Servicio
    nombreNegocio: "",
    tipoNegocio: "",
    descripcion: "",
    ubicacion: "",

    // Paso 3: Funciones
    serviciosSeleccionados: [] as string[],

    // Paso 4: Personalización
    paletaColores: "",
    coloresPersonalizados: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    logotipo: null as File | null,
    isotipo: null as File | null,
    imagotipo: null as File | null,

    // Paso 5: Plan
    tipoPlan: "" as "app" | "completo" | "web" | "",
    billingCycle: "monthly" as "monthly" | "annual",

    // Paso 6: Datos de pago
    numeroCuenta: "",
  })

  const calculatePrice = (servicios: string[], tipoPlan: "app" | "completo" | "web" | "", billingCycle: "monthly" | "annual" = "monthly") => {
    if (tipoPlan === "web" || tipoPlan === "") {
      return 0;
    }

    const basePrice: Record<"app" | "completo", number> = { app: 59, completo: 60 }
    const serviceCost = servicios.reduce((total, featureKey) => {
      const feature = features.find((f) => f.key === featureKey)
      return total + (feature?.price || 0)
    }, 0)
    
    const monthlyTotal = basePrice[tipoPlan] + serviceCost;
    return billingCycle === "annual" ? monthlyTotal * 12 : monthlyTotal;
  }

  const nextStep = () => {
    if (currentStep === 5 && formData.tipoPlan === "web") {
      // Si es solo web, saltar el paso de pago y ir directo a confirmación
      setCurrentStep(6)
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep === 6 && formData.tipoPlan === "web") {
      // Si es solo web y está en confirmación, volver al paso 5
      setCurrentStep(5)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviciosSeleccionados: prev.serviciosSeleccionados.includes(serviceId)
        ? prev.serviciosSeleccionados.filter((id) => id !== serviceId)
        : [...prev.serviciosSeleccionados, serviceId],
    }))
  }

  const handleBusinessTypeSelect = (businessType: string) => {
    const selectedBusiness = businessTypes.find((b) => b.key === businessType)
    setFormData((prev) => ({
      ...prev,
      tipoNegocio: businessType,
      serviciosSeleccionados: selectedBusiness?.recommendedFeatures?.map(f => f.key) || [],
    }))
  }

  const handleCustomColorChange = (index: number, color: string) => {
    const newColors = [...formData.coloresPersonalizados]
    newColors[index] = color
    setFormData((prev) => ({ ...prev, coloresPersonalizados: newColors }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando formulario de registro...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error al cargar los datos: {error}</p>
              <Button onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">¡Hola! Cuéntanos sobre ti</h2>
              <p className="text-gray-600">Necesitamos algunos datos básicos para comenzar</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono/WhatsApp *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <Label htmlFor="cedula">Foto de Cédula *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Sube una foto clara de tu cédula</p>
                  <Button variant="outline" size="sm">
                    Seleccionar Archivo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Cuéntanos sobre tu servicio de citas</h2>
              <p className="text-gray-600">Esto nos ayuda a personalizar tu app</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="nombreNegocio">Nombre de tu Negocio *</Label>
                <Input
                  id="nombreNegocio"
                  value={formData.nombreNegocio}
                  onChange={(e) => handleInputChange("nombreNegocio", e.target.value)}
                  placeholder="Ej: Estudio Fotográfico Luna"
                />
              </div>

              <div>
                <Label>Tipo de Servicio *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {businessTypes.map((business) => (
                    <Card
                      key={business.key}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.tipoNegocio === business.key ? "ring-2 ring-purple-500 bg-purple-50" : ""
                      }`}
                      onClick={() => handleBusinessTypeSelect(business.key)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="mb-2">
                          <Icon name={business.icon} size={24} className="text-blue-600" />
                        </div>
                        <div className="text-sm font-medium">{business.title}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción de tu Servicio</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Describe brevemente qué servicios ofreces, tu especialidad..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación Base</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                  placeholder="Ciudad, País (o si trabajas a domicilio)"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">¿Qué funciones necesitas?</h2>
              <p className="text-gray-600">
                Selecciona todas las que apliquen para tu servicio de citas. El precio se ajusta según tus necesidades.
              </p>
            </div>

            <div className="grid gap-4">
              {features.map((feature) => (
                <Card
                  key={feature.key}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.serviciosSeleccionados.includes(feature.key) ? "ring-2 ring-purple-500 bg-purple-50" : ""
                  }`}
                  onClick={() => handleServiceToggle(feature.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <Icon name={feature.key} size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{feature.title}</h3>
                          <div className="text-sm font-semibold text-purple-600">+${feature.price}/mes</div>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                      {formData.serviciosSeleccionados.includes(feature.key) && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Costo adicional por funciones:</span>
                    <span className="text-lg font-bold text-purple-600">
                      +$
                      {formData.serviciosSeleccionados.reduce((total, featureKey) => {
                        const feature = features.find((f) => f.key === featureKey)
                        return total + (feature?.price || 0)
                      }, 0)}
                      /mes
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 4:
        return (
          <CustomizationStepNew
            formData={formData}
            onInputChange={handleInputChange}
            onCustomColorChange={handleCustomColorChange}
            onFileChange={handleFileChange}
          />
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Elige tu plan</h2>
              <p className="text-gray-600">El precio se ajusta según las funciones que seleccionaste</p>
            </div>

            {/* Selector de ciclo de facturación */}
            {formData.tipoPlan && formData.tipoPlan !== "web" && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Ciclo de Facturación</h3>
                  <RadioGroup 
                    value={formData.billingCycle} 
                    onValueChange={(value) => handleInputChange("billingCycle", value)}
                    className="flex space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Mensual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="annual" id="annual" />
                      <Label htmlFor="annual" className="flex items-center">
                        Anual 
                        <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                          Ahorra 2 meses
                        </Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            <RadioGroup value={formData.tipoPlan} onValueChange={(value) => handleInputChange("tipoPlan", value)}>
              <div className="grid gap-4">
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${formData.tipoPlan === "web" ? "ring-2 ring-purple-500" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="web" id="web" />
                      <Monitor className="h-8 w-8 text-purple-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Solo Web</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              $0<span className="text-sm font-normal text-gray-600">/mes</span>
                            </div>
                            <div className="text-xs text-gray-500">Solo pagas por transacción</div>
                          </div>
                        </div>
                        <p className="text-gray-600">Sitio web responsive para gestión de citas</p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Sin Mensualidad</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${formData.tipoPlan === "app" ? "ring-2 ring-purple-500" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="app" id="app" />
                      <Smartphone className="h-8 w-8 text-purple-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Solo App Móvil</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${calculatePrice(formData.serviciosSeleccionados, "app", formData.billingCycle)}
                              <span className="text-sm font-normal text-gray-600">
                                {formData.billingCycle === "annual" ? "/año" : "/mes"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formData.billingCycle === "annual" ? (
                                <>
                                  Mensual: ${calculatePrice(formData.serviciosSeleccionados, "app", "monthly")}/mes
                                  <br />
                                  <span className="text-green-600 font-medium">
                                    Ahorras ${calculatePrice(formData.serviciosSeleccionados, "app", "monthly") * 2}/año
                                  </span>
                                </>
                              ) : (
                                <>
                                  Base: $59 + Funciones: $
                                  {formData.serviciosSeleccionados.reduce((total, featureKey) => {
                                    const feature = features.find((f) => f.key === featureKey)
                                    return total + (feature?.price || 0)
                                  }, 0)}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">App nativa en App Store y Google Play</p>
                        <Badge className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600">Más Popular</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${formData.tipoPlan === "completo" ? "ring-2 ring-purple-500" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="completo" id="completo" />
                      <div className="flex space-x-1">
                        <Monitor className="h-6 w-6 text-purple-600" />
                        <Smartphone className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Web + App Completa</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${calculatePrice(formData.serviciosSeleccionados, "completo", formData.billingCycle)}
                              <span className="text-sm font-normal text-gray-600">
                                {formData.billingCycle === "annual" ? "/año" : "/mes"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formData.billingCycle === "annual" ? (
                                <>
                                  Mensual: ${calculatePrice(formData.serviciosSeleccionados, "completo", "monthly")}/mes
                                  <br />
                                  <span className="text-green-600 font-medium">
                                    Ahorras ${calculatePrice(formData.serviciosSeleccionados, "completo", "monthly") * 2}/año
                                  </span>
                                </>
                              ) : (
                                <>
                                  Base: $60 + Funciones: $
                                  {formData.serviciosSeleccionados.reduce((total, featureKey) => {
                                    const feature = features.find((f) => f.key === featureKey)
                                    return total + (feature?.price || 0)
                                  }, 0)}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">La solución completa para tu servicio de citas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">¡Último paso!</h2>
              <p className="text-gray-600">Datos para recibir tus pagos semanales</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="numeroCuenta">Número de Cuenta para Depósitos *</Label>
                <Input
                  id="numeroCuenta"
                  value={formData.numeroCuenta}
                  onChange={(e) => handleInputChange("numeroCuenta", e.target.value)}
                  placeholder="Número de cuenta bancaria"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A esta cuenta te depositaremos tus ganancias todos los martes de cada semana
                </p>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mt-4">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-blue-600 mt-1">💰</div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Modelo de Precios y Pagos</h3>
                      <div className="text-sm text-blue-700 space-y-2">
                        {formData.tipoPlan === "web" ? (
                          <div>
                            <p className="font-medium">Plan Web:</p>
                            <p>• Sin mensualidad - $0/mes</p>
                            <p>• 3.8% + $0.40 de comisión por cada transacción realizada</p>
                            <p>• Pagos depositados los martes de cada semana</p>
                            <p>• Todas las funciones incluidas sin costo adicional</p>
                          </div>
                        ) : formData.tipoPlan === "app" ? (
                          <div>
                            <p className="font-medium">Plan App Móvil:</p>
                            <p>• Mensualidad: ${calculatePrice(formData.serviciosSeleccionados, "app")}</p>
                            <p>• 3.8% + $0.40 de comisión por cada transacción</p>
                            <p>• Pagos depositados los martes de cada semana</p>
                            <p>• Funciones adicionales incluidas en la mensualidad</p>
                          </div>
                        ) : formData.tipoPlan === "completo" ? (
                          <div>
                            <p className="font-medium">Plan Completo:</p>
                            <p>• Mensualidad: ${calculatePrice(formData.serviciosSeleccionados, "completo")}</p>
                            <p>• 3.8% + $0.40 de comisión por cada transacción</p>
                            <p>• Pagos depositados los martes de cada semana</p>
                            <p>• Todas las funciones incluidas en la mensualidad</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">¿Qué sigue?</h3>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Revisaremos tu información en 24 horas</li>
                        <li>• Te contactaremos para confirmar detalles</li>
                        <li>• Configuraremos tu plataforma personalizada</li>
                        <li>• En 10 días estará lista y publicada</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {formData.tipoPlan && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-purple-800 mb-4">Resumen de tu Plan</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan seleccionado:</span>
                        <span className="font-semibold">
                          {formData.tipoPlan === "web"
                            ? "Solo Web"
                            : formData.tipoPlan === "app"
                              ? "Solo App Móvil"
                              : "Web + App Completa"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Funciones incluidas:</span>
                        <span className="font-semibold">{formData.serviciosSeleccionados.length}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-purple-600 pt-2 border-t">
                        <span>{formData.tipoPlan === "web" ? "Costo mensual:" : "Total mensual:"}</span>
                        <span>
                          {formData.tipoPlan === "web"
                            ? "$0/mes + 5% por transacción"
                            : `$${calculatePrice(formData.serviciosSeleccionados, formData.tipoPlan)}/mes`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Procesar Pago de Suscripción</h2>
              <p className="text-gray-600">Completa el pago de tu primera mensualidad para activar tu app</p>
            </div>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-purple-800 mb-4">Resumen del Pago</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-semibold">
                      {formData.tipoPlan === "app" ? "Solo App Móvil" : "Web + App Completa"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Funciones incluidas:</span>
                    <span className="font-semibold">{formData.serviciosSeleccionados.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-purple-600 pt-2 border-t">
                    <span>Primera mensualidad:</span>
                    <span>${calculatePrice(formData.serviciosSeleccionados, formData.tipoPlan)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="text-lg tracking-wider" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Fecha de Vencimiento *</Label>
                  <Input id="expiry" placeholder="MM/AA" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input id="cvv" placeholder="123" type="password" maxLength={4} />
                </div>
              </div>

              <div>
                <Label htmlFor="cardName">Nombre en la Tarjeta *</Label>
                <Input id="cardName" placeholder="Como aparece en tu tarjeta" />
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <div className="text-green-600">🔒</div>
                    <span className="text-sm font-medium">Pago seguro procesado con encriptación SSL</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <ArrowLeft className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              WhiteLabel
            </span>
          </Link>
          <div className="text-sm text-gray-600">
            Paso {currentStep} de {steps.length}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${step.id <= currentStep ? "text-purple-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                    step.id < currentStep
                      ? "bg-purple-600 text-white"
                      : step.id === currentStep
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="text-xs text-center hidden md:block">
                  <div className="font-medium">{step.title}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>

          <Button
            onClick={
              currentStep === steps.length
                ? () => alert("¡Registro completado!")
                : currentStep === 7
                  ? () => alert("¡Pago procesado! Tu app estará lista en 10 días.")
                  : nextStep
            }
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
          >
            <span>
              {currentStep === steps.length ? "Finalizar Registro" : currentStep === 7 ? "Procesar Pago" : "Siguiente"}
            </span>
            {currentStep !== steps.length && currentStep !== 7 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
