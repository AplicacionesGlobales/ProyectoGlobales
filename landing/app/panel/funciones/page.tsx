// landing\app\panel\funciones\page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Zap, 
  Plus, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  Briefcase,
  Crown,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { functionsService, BrandFunction, AvailableFeature, FunctionStats } from "@/services/functionsService"
import { 
  FunctionCategory, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  FUNCTION_TEMPLATES,
  functionUtils,
  FunctionFormData,
  COMMON_DURATIONS,
  PRICE_RANGES
} from "@/types/functions.types"

interface BrandData {
  id: number
  name: string
  businessType?: string
}

export default function FuncionesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [functions, setFunctions] = useState<BrandFunction[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<AvailableFeature[]>([])
  const [stats, setStats] = useState<FunctionStats | null>(null)
  
  // Estados del UI
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FunctionCategory | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFunction, setEditingFunction] = useState<BrandFunction | null>(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState<FunctionFormData>({
    title: '',
    description: '',
    currentPrice: 0,
    duration: 30,
    isActive: true,
    category: FunctionCategory.ESSENTIAL
  })
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos del brand
      const brandDataStr = localStorage.getItem('brand_data')
      if (!brandDataStr) {
        setError('No se encontraron datos del brand')
        return
      }

      const brand = JSON.parse(brandDataStr)
      setBrandData(brand)

      // Cargar funciones, features disponibles y estadísticas en paralelo
      const [functionsResponse, featuresResponse, statsResponse] = await Promise.all([
        functionsService.getBrandFunctions(brand.id),
        functionsService.getAvailableFeatures(brand.businessType),
        functionsService.getFunctionStats(brand.id)
      ])

      // Procesar funciones
      if (functionsResponse.success && functionsResponse.data) {
        setFunctions(functionUtils.sortFunctions(functionsResponse.data))
      } else {
        console.warn('No functions found or error:', functionsResponse.errors)
        setFunctions([])
      }

      // Procesar features disponibles
      if (featuresResponse.success && featuresResponse.data) {
        setAvailableFeatures(featuresResponse.data)
      } else {
        console.warn('No available features found:', featuresResponse.errors)
        setAvailableFeatures([])
      }

      // Procesar estadísticas
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }