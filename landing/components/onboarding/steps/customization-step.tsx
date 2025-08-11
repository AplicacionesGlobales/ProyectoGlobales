"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Upload, Palette } from "lucide-react"

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
    colors: ["#10B981", "#059669", "#34D399", "#6EE7B7", "#A7F3D0"],
    preview: "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-300",
  },
  {
    id: "orange",
    name: "Naranja Vibrante",
    colors: ["#F59E0B", "#D97706", "#FCD34D", "#FDE68A", "#FEF3C7"],
    preview: "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200",
  },
  {
    id: "pink",
    name: "Rosa Moderno",
    colors: ["#EC4899", "#BE185D", "#F472B6", "#FBCFE8", "#FDF2F8"],
    preview: "bg-gradient-to-r from-pink-600 via-pink-400 to-pink-200",
  },
  {
    id: "slate",
    name: "Gris Minimalista",
    colors: ["#475569", "#334155", "#64748B", "#94A3B8", "#CBD5E1"],
    preview: "bg-gradient-to-r from-slate-600 via-slate-400 to-slate-200",
  },
]

interface CustomizationStepProps {
  customization: {
    colorPalette: string
    logo?: File
  }
  onChange: (customization: any) => void
  onNext: () => void
  onPrev: () => void
}

export function CustomizationStep({ customization, onChange, onNext, onPrev }: CustomizationStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleColorChange = (paletteId: string) => {
    onChange({
      ...customization,
      colorPalette: paletteId
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange({
        ...customization,
        logo: file
      })
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isValid = customization.colorPalette !== ""

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Personaliza tu App</h2>
        <p className="mt-2 text-gray-600">
          Elige los colores y sube tu logo para darle identidad a tu aplicación
        </p>
      </div>

      <div className="space-y-6">
        {/* Color Palette Selection */}
        <div>
          <Label className="text-base font-medium mb-4 block">
            <Palette className="inline-block w-4 h-4 mr-2" />
            Selecciona tu paleta de colores
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorPalettes.map((palette) => (
              <Card
                key={palette.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  customization.colorPalette === palette.id
                    ? "ring-2 ring-purple-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleColorChange(palette.id)}
              >
                <div className="space-y-3">
                  <div className={`h-12 rounded-lg ${palette.preview}`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{palette.name}</h3>
                    <div className="flex space-x-1 mt-2">
                      {palette.colors.slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <Label className="text-base font-medium mb-4 block">
            <Upload className="inline-block w-4 h-4 mr-2" />
            Logo de tu empresa (opcional)
          </Label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formatos: PNG, JPG, SVG. Tamaño máximo: 2MB
              </p>
            </div>
            {logoPreview && (
              <div className="w-16 h-16 border rounded-lg overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {customization.colorPalette && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Vista previa</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`h-16 ${colorPalettes.find(p => p.id === customization.colorPalette)?.preview || 'bg-gray-200'}`}>
                <div className="flex items-center justify-between h-full px-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div className="text-white font-bold">Tu Logo</div>
                  )}
                  <div className="text-white text-sm">Mi App</div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-gray-600 text-sm">Así se verá el header de tu aplicación</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="flex items-center gap-2">
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
