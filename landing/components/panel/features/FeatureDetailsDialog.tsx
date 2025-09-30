"use client"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Zap, Star, Crown, CheckCircle, XCircle } from "lucide-react"
import { Feature } from "@/api/types"
import { CATEGORY_COLORS, CATEGORY_LABELS, formatCurrency } from "./utils/featureUtils"

interface FeatureDetailsDialogProps {
  feature: Feature | null
  isOpen: boolean
  isActive: boolean
  onClose: () => void
}

export function FeatureDetailsDialog({ 
  feature, 
  isOpen, 
  isActive,
  onClose 
}: FeatureDetailsDialogProps) {
  if (!feature) return null

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Activa
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="text-gray-500">
        <XCircle className="w-3 h-3 mr-1" />
        Inactiva
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {feature.title}
          </DialogTitle>
          <DialogDescription>
            Información detallada de la funcionalidad
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Descripción</Label>
            <p className="text-sm text-gray-600 mt-1">
              {feature.description}
            </p>
          </div>
          
          {feature.subtitle && (
            <div>
              <Label className="text-sm font-medium">Detalles adicionales</Label>
              <p className="text-sm text-gray-600 mt-1">
                {feature.subtitle}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Categoría</Label>
            <Badge 
              variant="outline" 
              className={CATEGORY_COLORS[feature.category as keyof typeof CATEGORY_COLORS]}
            >
              {CATEGORY_LABELS[feature.category as keyof typeof CATEGORY_LABELS]}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Precio mensual</Label>
            <span className="font-medium">
              {feature.price > 0 ? formatCurrency(feature.price) : 'Gratis'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Estado actual</Label>
            {getStatusBadge()}
          </div>

          {feature.isRecommended && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Recomendado</span>
              </div>
            </div>
          )}

          {feature.isPopular && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 text-purple-800">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Popular</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}