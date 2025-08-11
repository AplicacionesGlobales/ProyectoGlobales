"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HexColorPicker } from "react-colorful"
import { FileImage, Palette, Upload, Check, Eye } from "lucide-react"

interface CustomizationStepProps {
  formData: {
    paletaColores: string
    coloresPersonalizados: string[]
    logotipo: File | null
    isotipo: File | null
    imagotipo: File | null
  }
  onInputChange: (field: string, value: any) => void
  onCustomColorChange: (index: number, color: string) => void
  onFileChange: (field: string, file: File | null) => void
}

const colorPalettes = [
  {
    id: "modern",
    name: "Moderno",
    colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    preview: "bg-gradient-to-r from-purple-500 to-pink-500",
    isCustom: false,
  },
  {
    id: "professional",
    name: "Profesional",
    colors: ["#1F2937", "#374151", "#6B7280", "#9CA3AF", "#E5E7EB"],
    preview: "bg-gradient-to-r from-gray-800 to-gray-300",
    isCustom: false,
  },
  {
    id: "nature",
    name: "Naturaleza",
    colors: ["#065F46", "#047857", "#059669", "#10B981", "#34D399"],
    preview: "bg-gradient-to-r from-green-800 to-green-400",
    isCustom: false,
  },
  {
    id: "sunset",
    name: "Atardecer",
    colors: ["#92400E", "#D97706", "#F59E0B", "#FCD34D", "#FEF3C7"],
    preview: "bg-gradient-to-r from-yellow-800 to-yellow-200",
    isCustom: false,
  },
  {
    id: "ocean",
    name: "Océano",
    colors: ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
    preview: "bg-gradient-to-r from-blue-800 to-blue-200",
    isCustom: false,
  },
  {
    id: "custom",
    name: "Personalizada",
    colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    preview: "bg-gradient-to-r from-purple-500 to-pink-500",
    isCustom: true,
  },
]

const logoTypes = [
  {
    key: "logotipo",
    title: "Logotipo",
    description: "Solo el nombre de la marca en texto, sin ícono",
    usage: "Uso: facturas, encabezados, correos",
    format: "Formato horizontal • PNG con fondo transparente",
  },
  {
    key: "isotipo",
    title: "Isotipo",
    description: "Solo el ícono o símbolo, sin texto",
    usage: "Uso: favicon, iconos pequeños, redes sociales",
    format: "Formato cuadrado • PNG con fondo transparente",
  },
  {
    key: "imagotipo",
    title: "Imagotipo",
    description: "Ícono y texto juntos",
    usage: "Uso: logo principal, pantalla inicial, marketing",
    format: "Formato libre • PNG con fondo transparente",
  },
]

export function CustomizationStepNew({
  formData,
  onInputChange,
  onCustomColorChange,
  onFileChange,
}: CustomizationStepProps) {
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null)
  const [previewFiles, setPreviewFiles] = useState<Record<string, string>>({})

  const handleFileUpload = (logoType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreviewFiles(prev => ({ ...prev, [logoType]: previewUrl }))
      
      // Call parent handler
      onFileChange(logoType, file)
    }
  }

  const removeFile = (logoType: string) => {
    // Clean up preview URL
    if (previewFiles[logoType]) {
      URL.revokeObjectURL(previewFiles[logoType])
      setPreviewFiles(prev => {
        const newPreviews = { ...prev }
        delete newPreviews[logoType]
        return newPreviews
      })
    }
    
    // Call parent handler
    onFileChange(logoType, null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Personaliza tu app</h2>
        <p className="text-gray-600">Elige los colores y sube tus logos para crear tu identidad de marca</p>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colors" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Colores</span>
          </TabsTrigger>
          <TabsTrigger value="logos" className="flex items-center space-x-2">
            <FileImage className="h-4 w-4" />
            <span>Logos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Paleta de Colores (5 colores) *</Label>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona una paleta predefinida o crea tu propia combinación personalizada
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorPalettes.map((palette) => (
                <Card
                  key={palette.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.paletaColores === palette.id ? "ring-2 ring-purple-500" : ""
                  }`}
                  onClick={() => onInputChange("paletaColores", palette.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${palette.preview}`}></div>
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center">
                          {palette.isCustom && <Palette className="mr-2 h-4 w-4" />}
                          {palette.name}
                        </h3>
                        <div className="flex space-x-1 mt-2">
                          {palette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      {formData.paletaColores === palette.id && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {formData.paletaColores === "custom" && (
              <Card className="border-2 border-purple-500 mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-6 flex items-center">
                    <Palette className="mr-2 h-5 w-5" />
                    Colores Personalizados
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {formData.coloresPersonalizados.map((color, index) => (
                      <div key={index} className="space-y-3">
                        <Label className="font-medium">Color {index + 1}</Label>
                        <div className="space-y-3">
                          {/* Color preview and picker trigger */}
                          <div
                            className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-purple-400 transition-colors relative"
                            style={{ backgroundColor: color }}
                            onClick={() => setActiveColorIndex(activeColorIndex === index ? null : index)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Palette className="h-4 w-4 text-white drop-shadow-sm" />
                            </div>
                          </div>
                          
                          {/* HEX input */}
                          <Input
                            value={color}
                            onChange={(e) => onCustomColorChange(index, e.target.value)}
                            placeholder="#8B5CF6"
                            className="text-center font-mono"
                          />
                          
                          {/* Color picker */}
                          {activeColorIndex === index && (
                            <div className="absolute z-10 mt-2">
                              <div className="bg-white p-3 rounded-lg shadow-lg border">
                                <HexColorPicker
                                  color={color}
                                  onChange={(newColor) => onCustomColorChange(index, newColor)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Preview gradient */}
                  <div className="mt-6">
                    <Label className="font-medium mb-2 block">Vista Previa</Label>
                    <div
                      className="w-full h-16 rounded-lg border-2 border-gray-200"
                      style={{
                        background: `linear-gradient(135deg, ${formData.coloresPersonalizados.join(", ")})`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logos" className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Logos de tu Marca</Label>
            <p className="text-sm text-gray-600 mb-6">
              Sube los diferentes tipos de logos que usaremos en tu app. Se recomiendan archivos PNG con fondo transparente.
            </p>

            <div className="space-y-6">
              {logoTypes.map((logoType) => (
                <Card key={logoType.key} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                      {/* Logo info */}
                      <div className="lg:flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{logoType.title}</h3>
                            <p className="text-gray-600">{logoType.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Opcional
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>{logoType.usage}</p>
                          <p className="font-medium">{logoType.format}</p>
                        </div>
                      </div>

                      {/* Upload area */}
                      <div className="lg:w-64">
                        {previewFiles[logoType.key] || formData[logoType.key as keyof typeof formData] ? (
                          <div className="relative">
                            <img
                              src={previewFiles[logoType.key]}
                              alt={`${logoType.title} preview`}
                              className="w-full h-32 object-contain bg-gray-50 rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeFile(logoType.key)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ) : (
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(logoType.key, e)}
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer">
                              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Subir {logoType.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG hasta 5MB
                              </p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Brand preview */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Vista Previa de tu Marca</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Color preview */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white shadow-md"
                style={{
                  background: formData.paletaColores === "custom" 
                    ? `linear-gradient(135deg, ${formData.coloresPersonalizados.slice(0, 3).join(", ")})`
                    : `linear-gradient(135deg, ${colorPalettes.find(p => p.id === formData.paletaColores)?.colors.slice(0, 3).join(", ") || "#8B5CF6, #EC4899, #F59E0B"})`
                }}
              />
              <p className="text-xs text-gray-600">Colores</p>
            </div>

            {/* Logo previews */}
            {logoTypes.map((logoType) => (
              <div key={`preview-${logoType.key}`} className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200 bg-white flex items-center justify-center">
                  {previewFiles[logoType.key] ? (
                    <img
                      src={previewFiles[logoType.key]}
                      alt={`${logoType.title} preview`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <FileImage className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{logoType.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
