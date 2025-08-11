"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Upload, Palette, Image, FileText, Layers, X, Check } from "lucide-react"

interface CustomizationStepProps {
  customization: {
    colorPalette: {
      primary: string
      secondary: string
      accent: string
      neutral: string
      success: string
    }
    logos: {
      logotipo?: File
      isotipo?: File
      imagotipo?: File
    }
  }
  onChange: (customization: any) => void
  onNext: () => void
  onPrev: () => void
}

const presetPalettes = [
  {
    id: "modern",
    name: "Moderno",
    colors: {
      primary: "#1a73e8",
      secondary: "#34a853", 
      accent: "#fbbc04",
      neutral: "#9aa0a6",
      success: "#137333"
    }
  },
  {
    id: "warm",
    name: "Cálido",
    colors: {
      primary: "#f57c00",
      secondary: "#ff7043",
      accent: "#ffc107",
      neutral: "#8d6e63",
      success: "#689f38"
    }
  },
  {
    id: "cool",
    name: "Fresco",
    colors: {
      primary: "#00acc1",
      secondary: "#26a69a",
      accent: "#42a5f5",
      neutral: "#78909c",
      success: "#66bb6a"
    }
  },
  {
    id: "elegant",
    name: "Elegante",
    colors: {
      primary: "#673ab7",
      secondary: "#9c27b0",
      accent: "#e91e63",
      neutral: "#607d8b",
      success: "#4caf50"
    }
  }
]

const logoTypes = [
  {
    id: "logotipo",
    name: "Logotipo",
    description: "Solo el nombre de la marca en texto, sin ícono",
    usage: "Facturas, encabezados, correos",
    icon: FileText,
    example: "MI EMPRESA"
  },
  {
    id: "isotipo", 
    name: "Isotipo",
    description: "Solo el símbolo o ícono de la marca, sin texto",
    usage: "Iconos de app, favicon, redes sociales",
    icon: Image,
    example: "🏢"
  },
  {
    id: "imagotipo",
    name: "Imagotipo", 
    description: "Símbolo + nombre de la marca juntos",
    usage: "Login, pantallas públicas, publicidad",
    icon: Layers,
    example: "🏢 MI EMPRESA"
  }
]

export function CustomizationStep({ customization, onChange, onNext, onPrev }: CustomizationStepProps) {
  const [activeTab, setActiveTab] = useState("colors")
  const [customColors, setCustomColors] = useState(customization.colorPalette || presetPalettes[0].colors)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handlePresetSelect = (preset: typeof presetPalettes[0]) => {
    setCustomColors(preset.colors)
    setSelectedPreset(preset.id)
    onChange({
      ...customization,
      colorPalette: preset.colors
    })
  }

  const handleCustomColorChange = (colorKey: string, value: string) => {
    const newColors = { ...customColors, [colorKey]: value }
    setCustomColors(newColors)
    setSelectedPreset(null) // Deselect preset when manually changing
    onChange({
      ...customization,
      colorPalette: newColors
    })
  }

  const handleLogoUpload = (logoType: string, file: File | null) => {
    const newLogos = { ...customization.logos }
    if (file) {
      newLogos[logoType as keyof typeof newLogos] = file
    } else {
      delete newLogos[logoType as keyof typeof newLogos]
    }
    
    onChange({
      ...customization,
      logos: newLogos
    })
  }

  const ColorPicker = ({ label, colorKey, value }: { label: string, colorKey: string, value: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-3 items-center">
        <Input
          type="color"
          value={value}
          onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
          className="w-12 h-12 p-1 border-2 rounded cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
          className="font-mono text-sm"
          placeholder="#000000"
        />
        <div 
          className="w-8 h-8 rounded border-2 border-gray-200" 
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  )

  const LogoUploader = ({ logoType }: { logoType: typeof logoTypes[0] }) => {
    const currentFile = customization.logos[logoType.id as keyof typeof customization.logos]
    
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <logoType.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{logoType.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{logoType.description}</p>
              <Badge variant="outline" className="text-xs mb-3">
                {logoType.usage}
              </Badge>
              <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <div className="text-2xl mb-2">{logoType.example}</div>
                <p className="text-xs text-gray-500">Ejemplo visual</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {currentFile ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">{currentFile.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLogoUpload(logoType.id, null)}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleLogoUpload(logoType.id, file)
                  }}
                  className="hidden"
                  id={`logo-${logoType.id}`}
                />
                <Label 
                  htmlFor={`logo-${logoType.id}`}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Subir {logoType.name}
                </Label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG o SVG. Máximo 2MB
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  const isValid = true // Always valid, customization is optional

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Personaliza tu marca</h2>
        <p className="mt-2 text-gray-600">
          Define los colores y logos que representarán tu aplicación
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="w-4 h-4" />
            Colores
          </TabsTrigger>
          <TabsTrigger value="logos" className="gap-2">
            <Upload className="w-4 h-4" />
            Logos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6 mt-6">
          {/* Preset Palettes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paletas predefinidas</h3>
            <div className="grid grid-cols-2 gap-4">
              {presetPalettes.map((palette) => (
                <Card 
                  key={palette.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPreset === palette.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handlePresetSelect(palette)}
                >
                  <div className="space-y-3">
                    <h4 className="font-medium">{palette.name}</h4>
                    <div className="flex gap-2">
                      {Object.values(palette.colors).map((color, index) => (
                        <div 
                          key={index}
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personalizar colores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker label="Color Primario" colorKey="primary" value={customColors.primary} />
              <ColorPicker label="Color Secundario" colorKey="secondary" value={customColors.secondary} />
              <ColorPicker label="Color de Acento" colorKey="accent" value={customColors.accent} />
              <ColorPicker label="Color Neutral" colorKey="neutral" value={customColors.neutral} />
              <ColorPicker label="Color de Éxito" colorKey="success" value={customColors.success} />
            </div>
          </div>

          {/* Color Preview */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Vista previa</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                {Object.entries(customColors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border border-gray-200 mb-2"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-gray-600 capitalize">{key}</p>
                  </div>
                ))}
              </div>
              
              {/* Example UI with colors */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div 
                  className="h-8 rounded flex items-center px-3 text-white font-medium"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Botón Primario
                </div>
                <div 
                  className="h-8 rounded flex items-center px-3 text-white font-medium"
                  style={{ backgroundColor: customColors.secondary }}
                >
                  Botón Secundario
                </div>
                <div 
                  className="h-2 rounded"
                  style={{ backgroundColor: customColors.accent }}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="logos" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Sube los diferentes tipos de logos para tu marca. Todos son opcionales.
              </p>
            </div>
            {logoTypes.map((logoType) => (
              <LogoUploader key={logoType.id} logoType={logoType} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="gap-2"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
