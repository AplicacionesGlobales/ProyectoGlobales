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

const steps = [
  { id: 1, title: "Información Personal", description: "Cuéntanos sobre ti" },
  { id: 2, title: "Tu Servicio", description: "Detalles de tu negocio de citas" },
  { id: 3, title: "Funciones", description: "¿Qué necesitas en tu app?" },
  { id: 4, title: "Personalización", description: "Colores y diseño" },
  { id: 5, title: "Plan", description: "Elige tu modalidad" },
  { id: 6, title: "Confirmación", description: "¡Casi listo!" },
  { id: 7, title: "Pago", description: "Procesar suscripción" },
]

const businessTypes = [
  { id: "fotografo", name: "Fotógrafo", emoji: "📸", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "camarografo", name: "Camarógrafo", emoji: "🎥", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "medico", name: "Médico/Dentista", emoji: "🦷", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "estilista", name: "Estilista/Barbero", emoji: "💇", services: ["citas", "archivos", "pagos"] },
  { id: "consultor", name: "Consultor", emoji: "💼", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "masajista", name: "Masajista/Spa", emoji: "💆", services: ["citas", "ubicaciones", "pagos"] },
  {
    id: "entrenador",
    name: "Entrenador Personal",
    emoji: "🏋️",
    services: ["citas", "ubicaciones", "archivos", "pagos"],
  },
  { id: "otro", name: "Otro Servicio", emoji: "🏢", services: [] },
]

const services = [
  {
    id: "citas",
    name: "Gestión de Citas Avanzada",
    emoji: "📅",
    description: "Sistema completo de reservas con tipos de citas personalizables y recordatorios automáticos",
    price: 20,
  },
  {
    id: "ubicaciones",
    name: "Ubicaciones en Mapa",
    emoji: "📍",
    description: "Permite a clientes marcar ubicaciones exactas en el mapa para servicios a domicilio",
    price: 15,
  },
  {
    id: "archivos",
    name: "Gestión de Archivos",
    emoji: "📁",
    description: "Comparte portfolios, contratos, resultados y documentos organizados por cita",
    price: 18,
  },
  {
    id: "pagos",
    name: "Pagos Integrados",
    emoji: "💳",
    description: "Acepta pagos directamente en la app. Los pagos se depositan a tu cuenta todos los martes.",
    price: 25,
  },
  {
    id: "tipos-citas",
    name: "Tipos de Citas Personalizables",
    emoji: "🎨",
    description: "Define diferentes servicios con duraciones, precios y requisitos específicos",
    price: 12,
  },
  {
    id: "reportes",
    name: "Reportes y Analytics",
    emoji: "📊",
    description: "Estadísticas de reservas, ingresos, clientes frecuentes y patrones de negocio",
    price: 15,
  },
]

const colorPalettes = [
  {
    id: "purple",
    name: "Púrpura Elegante",
    colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    preview: "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500",
  },
  {
    id: "blue",
    name: "Azul Profesional",
    colors: ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B"],
    preview: "bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500",
  },
  {
    id: "green",
    name: "Verde Natural",
    colors: ["#10B981", "#34D399", "#06B6D4", "#3B82F6", "#8B5CF6"],
    preview: "bg-gradient-to-r from-emerald-500 via-green-400 to-cyan-500",
  },
  {
    id: "orange",
    name: "Naranja Vibrante",
    colors: ["#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#3B82F6"],
    preview: "bg-gradient-to-r from-amber-500 via-red-500 to-pink-500",
  },
  {
    id: "dark",
    name: "Elegante Oscuro",
    colors: ["#1F2937", "#6B7280", "#374151", "#4B5563", "#9CA3AF"],
    preview: "bg-gradient-to-r from-gray-800 via-gray-600 to-gray-500",
  },
  {
    id: "custom",
    name: "Personalizada",
    colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    preview: "bg-gradient-to-r from-purple-500 to-pink-500",
    isCustom: true,
  },
]

export default function RegistroPage() {
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
    serviciosSeleccionados: [],

    // Paso 4: Personalización
    paletaColores: "",
    coloresPersonalizados: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    logotipo: null,
    isotipo: null,
    imagotipo: null,

    // Paso 5: Plan
    tipoPlan: "",

    // Paso 6: Datos de pago
    numeroCuenta: "",
  })

  const calculatePrice = (servicios, tipoPlan) => {
    if (tipoPlan === "web") {
      // Para web, no hay costo base ni servicios adicionales, solo comisiones por transacción
      return 0
    }

    const basePrice = { app: 59, completo: 60 }
    const serviceCost = servicios.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
    return (basePrice[tipoPlan] || 0) + serviceCost
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      serviciosSeleccionados: prev.serviciosSeleccionados.includes(serviceId)
        ? prev.serviciosSeleccionados.filter((id) => id !== serviceId)
        : [...prev.serviciosSeleccionados, serviceId],
    }))
  }

  const handleBusinessTypeSelect = (businessType) => {
    const selectedBusiness = businessTypes.find((b) => b.id === businessType)
    setFormData((prev) => ({
      ...prev,
      tipoNegocio: businessType,
      serviciosSeleccionados: selectedBusiness?.services || [],
    }))
  }

  const handleCustomColorChange = (index, color) => {
    const newColors = [...formData.coloresPersonalizados]
    newColors[index] = color
    setFormData((prev) => ({ ...prev, coloresPersonalizados: newColors }))
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
                      key={business.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.tipoNegocio === business.id ? "ring-2 ring-purple-500 bg-purple-50" : ""
                      }`}
                      onClick={() => handleBusinessTypeSelect(business.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{business.emoji}</div>
                        <div className="text-sm font-medium">{business.name}</div>
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
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.serviciosSeleccionados.includes(service.id) ? "ring-2 ring-purple-500 bg-purple-50" : ""
                  }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{service.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{service.name}</h3>
                          <div className="text-sm font-semibold text-purple-600">+${service.price}/mes</div>
                        </div>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      {formData.serviciosSeleccionados.includes(service.id) && (
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
                      {formData.serviciosSeleccionados.reduce((total, serviceId) => {
                        const service = services.find((s) => s.id === serviceId)
                        return total + (service?.price || 0)
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Personaliza tu app</h2>
              <p className="text-gray-600">Elige los colores y sube tus logos</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Paleta de Colores (5 colores) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {colorPalettes.map((palette) => (
                    <Card
                      key={palette.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.paletaColores === palette.id ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => handleInputChange("paletaColores", palette.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg ${palette.preview}`}></div>
                          <div>
                            <h3 className="font-semibold flex items-center">
                              {palette.isCustom && <Palette className="mr-2 h-4 w-4" />}
                              {palette.name}
                            </h3>
                            <div className="flex space-x-1 mt-1">
                              {palette.colors.map((color, index) => (
                                <div key={index} className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                              ))}
                            </div>
                          </div>
                          {formData.paletaColores === palette.id && (
                            <Check className="h-5 w-5 text-purple-600 ml-auto" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {formData.paletaColores === "custom" && (
                  <Card className="border-2 border-purple-500 mt-4">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Palette className="mr-2 h-5 w-5" />
                        Colores Personalizados (5 colores)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {formData.coloresPersonalizados.map((color, index) => (
                          <div key={index}>
                            <Label htmlFor={`color${index}`}>Color {index + 1}</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <input
                                type="color"
                                id={`color${index}`}
                                value={color}
                                onChange={(e) => handleCustomColorChange(index, e.target.value)}
                                className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                              />
                              <Input
                                value={color}
                                onChange={(e) => handleCustomColorChange(index, e.target.value)}
                                placeholder="#8B5CF6"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Label>Vista Previa</Label>
                        <div
                          className="w-full h-12 rounded-lg mt-2"
                          style={{
                            background: `linear-gradient(to right, ${formData.coloresPersonalizados.join(", ")})`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Logos de tu Marca</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Sube los diferentes tipos de logos que usaremos en tu app. Preferiblemente con fondo transparente
                  (PNG).
                </p>

                <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <Label className="font-medium">Logotipo</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Solo el nombre de la marca en texto, sin ícono. Uso: facturas, encabezados, correos.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                      <FileImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600 mb-2">Formato horizontal • PNG con fondo transparente</p>
                      <Button variant="outline" size="sm">
                        Subir Logotipo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Isotipo</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Solo el símbolo o ícono de la marca, sin texto. Uso: iconos de app, favicon, redes sociales.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                      <FileImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600 mb-2">Cuadrado 1024x1024 • PNG con fondo transparente</p>
                      <Button variant="outline" size="sm">
                        Subir Isotipo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Imagotipo</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Símbolo + nombre de la marca juntos, pero que puedan funcionar por separado. Uso: login, pantallas
                      públicas, publicidad.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                      <FileImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600 mb-2">Formato horizontal • PNG con fondo transparente</p>
                      <Button variant="outline" size="sm">
                        Subir Imagotipo
                      </Button>
                    </div>
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-600 mt-0.5">💡</div>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">Consejos para mejores resultados:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Usa archivos PNG con fondo transparente</li>
                          <li>• Asegúrate de que los logos se vean bien en fondos claros y oscuros</li>
                          <li>• El isotipo debe ser cuadrado para iconos de app</li>
                          <li>• Resolución mínima recomendada: 512x512 para isotipo, 1024x256 para logotipo</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Elige tu plan</h2>
              <p className="text-gray-600">El precio se ajusta según las funciones que seleccionaste</p>
            </div>

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
                              ${calculatePrice(formData.serviciosSeleccionados, "app")}
                              <span className="text-sm font-normal text-gray-600">/mes</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Base: $59 + Funciones: $
                              {formData.serviciosSeleccionados.reduce((total, serviceId) => {
                                const service = services.find((s) => s.id === serviceId)
                                return total + (service?.price || 0)
                              }, 0)}
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
                              ${calculatePrice(formData.serviciosSeleccionados, "completo")}
                              <span className="text-sm font-normal text-gray-600">/mes</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Base: $60 + Funciones: $
                              {formData.serviciosSeleccionados.reduce((total, serviceId) => {
                                const service = services.find((s) => s.id === serviceId)
                                return total + (service?.price || 0)
                              }, 0)}
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
                  <div className="text-gray-500">{step.description}</div>
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
