"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Palette, 
  Check,
  X,
  Image,
  Sparkles,
  Eye
} from "lucide-react"

const colorPalettes = [
  {
    id: "purple",
    name: "Púrpura Elegante",
    colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"],
    preview: "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500",
    description: "Moderno y sofisticado"
  },
  {
    id: "blue",
    name: "Azul Profesional",
    colors: ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B"],
    preview: "bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500",
    description: "Confiable y corporativo"
  },
  {
    id: "green",
    name: "Verde Natural",
    colors: ["#10B981", "#059669", "#34D399", "#6EE7B7", "#A7F3D0"],
    preview: "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-300",
    description: "Fresco y orgánico"
  },
  {
    id: "orange",
    name: "Naranja Vibrante",
    colors: ["#F59E0B", "#D97706", "#FCD34D", "#FDE68A", "#FEF3C7"],
    preview: "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200",
    description: "Energético y cálido"
  },
  {
    id: "pink",
    name: "Rosa Moderno",
    colors: ["#EC4899", "#BE185D", "#F472B6", "#FBCFE8", "#FDF2F8"],
    preview: "bg-gradient-to-r from-pink-600 via-pink-400 to-pink-200",
    description: "Creativo y juvenil"
  },
  {
    id: "slate",
    name: "Gris Minimalista",
    colors: ["#475569", "#334155", "#64748B", "#94A3B8", "#CBD5E1"],
    preview: "bg-gradient-to-r from-slate-600 via-slate-400 to-slate-200",
    description: "Elegante y neutral"
  },
  {
    id: "indigo",
    name: "Índigo Profundo",
    colors: ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"],
    preview: "bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-200",
    description: "Premium y exclusivo"
  },
  {
    id: "teal",
    name: "Turquesa Océano",
    colors: ["#14B8A6", "#0D9488", "#5EEAD4", "#99F6E4", "#CCFBF1"],
    preview: "bg-gradient-to-r from-teal-600 via-teal-400 to-teal-200",
    description: "Refrescante y moderno"
  },
  {
    id: "rose",
    name: "Rosa Coral",
    colors: ["#F43F5E", "#E11D48", "#FB7185", "#FDA4AF", "#FECDD3"],
    preview: "bg-gradient-to-r from-rose-600 via-rose-400 to-rose-200",
    description: "Vibrante y acogedor"
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
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleColorChange = (paletteId: string) => {
    onChange({
      ...customization,
      colorPalette: paletteId
    })
    // Mostrar preview automáticamente al seleccionar color
    if (!showPreview && paletteId) {
      setShowPreview(true)
    }
  }

  const validateFile = (file: File) => {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    
    if (!validTypes.includes(file.type)) {
      setUploadError('Por favor sube una imagen PNG, JPG o SVG')
      return false
    }
    
    if (file.size > maxSize) {
      setUploadError('La imagen debe ser menor a 2MB')
      return false
    }
    
    setUploadError(null)
    return true
  }

  const handleLogoChange = (file: File) => {
    if (validateFile(file)) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleLogoChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleLogoChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    onChange({
      ...customization,
      logo: undefined
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isValid = customization.colorPalette !== ""
  const selectedPalette = colorPalettes.find(p => p.id === customization.colorPalette)

  return (
    <div className="space-y-6">
      {/* Header con icono */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
        >
          <Palette className="text-white" size={40} />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Personaliza tu App
        </h2>
        <p className="mt-2 text-gray-600">
          Dale identidad única a tu aplicación con colores y tu logo
        </p>
      </div>

      <div className="space-y-8">
        {/* Color Palette Selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-500" size={20} />
            <label className="text-sm font-semibold text-gray-700">
              Selecciona tu paleta de colores
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorPalettes.map((palette, index) => (
              <motion.div
                key={palette.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                    customization.colorPalette === palette.id
                      ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleColorChange(palette.id)}
                >
                  <div className="space-y-3">
                    {/* Preview gradient */}
                    <div className={`h-16 rounded-lg ${palette.preview} shadow-inner relative overflow-hidden`}>
                      {customization.colorPalette === palette.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                        >
                          <Check className="text-purple-500" size={16} />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Palette info */}
                    <div>
                      <h3 className="font-semibold text-gray-900">{palette.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{palette.description}</p>
                      
                      {/* Color dots */}
                      <div className="flex space-x-1 mt-3">
                        {palette.colors.map((color, colorIndex) => (
                          <motion.div
                            key={colorIndex}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 + colorIndex * 0.05 }}
                            className="w-6 h-6 rounded-full shadow-sm border-2 border-white"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image className="text-blue-500" size={20} />
            <label className="text-sm font-semibold text-gray-700">
              Logo de tu empresa
              <span className="text-gray-400 ml-1">(opcional)</span>
            </label>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-8
              transition-all duration-200 cursor-pointer
              ${isDragging 
                ? 'border-purple-500 bg-purple-50' 
                : logoPreview 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50'
              }
            `}
            onClick={() => !logoPreview && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {logoPreview ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg shadow-md overflow-hidden p-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Logo cargado exitosamente</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {customization.logo?.name || 'imagen.png'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLogo()
                  }}
                  className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X className="text-red-600" size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-700 font-medium mb-1">
                  {isDragging ? 'Suelta tu imagen aquí' : 'Arrastra tu logo aquí'}
                </p>
                <p className="text-sm text-gray-500 mb-3">o</p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-gray-400 mt-3">
                  PNG, JPG o SVG • Máximo 2MB
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-2 flex items-center gap-1"
            >
              <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
              {uploadError}
            </motion.p>
          )}
        </div>

        {/* Live Preview */}
        <AnimatePresence>
          {(customization.colorPalette || logoPreview) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="text-purple-500" size={20} />
                    Vista previa en vivo
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-gray-500"
                  >
                    {showPreview ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>

                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Mobile Preview */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm mx-auto">
                      <div className={`h-20 ${selectedPalette?.preview || 'bg-gray-200'} relative`}>
                        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                        <div className="relative flex items-center justify-between h-full px-6">
                          {logoPreview ? (
                            <div className="bg-white rounded-lg p-2 shadow-md">
                              <img src={logoPreview} alt="Logo" className="h-10 w-auto object-contain" />
                            </div>
                          ) : (
                            <div className="bg-white bg-opacity-90 rounded-lg px-4 py-2">
                              <span className="font-bold text-gray-800">Tu Logo</span>
                            </div>
                          )}
                          <div className="text-white">
                            <p className="text-sm opacity-90">Bienvenido a</p>
                            <p className="font-bold text-lg">Mi App</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-3">
                          <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div 
                              className="h-20 rounded-lg opacity-20"
                              style={{ backgroundColor: selectedPalette?.colors[0] }}
                            ></div>
                            <div 
                              className="h-20 rounded-lg opacity-20"
                              style={{ backgroundColor: selectedPalette?.colors[1] }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                      Así se verá tu aplicación con los colores seleccionados
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!isValid}
          className={`
            px-8 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold
            ${isValid 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continuar
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}