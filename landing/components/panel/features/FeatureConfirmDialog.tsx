"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Minus, RefreshCw } from "lucide-react"
import { Feature } from "@/api/types"
import { formatCurrency } from "./utils/featureUtils"

interface FeatureConfirmDialogProps {
  feature: Feature | null
  isCurrentlyActive: boolean
  isOpen: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function FeatureConfirmDialog({ 
  feature, 
  isCurrentlyActive, 
  isOpen, 
  loading,
  onConfirm, 
  onCancel 
}: FeatureConfirmDialogProps) {
  if (!feature) return null

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCurrentlyActive ? 'Desactivar' : 'Activar'} Funcionalidad
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas{' '}
            {isCurrentlyActive ? 'desactivar' : 'activar'} la 
            funcionalidad "{feature.title}"?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isCurrentlyActive ? (
            <Alert>
              <Minus className="h-4 w-4" />
              <AlertDescription>
                Al desactivar esta funcionalidad, ya no estará disponible 
                para tu negocio y se dejará de facturar.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Plus className="h-4 w-4" />
              <AlertDescription>
                Al activar esta funcionalidad, estará disponible para tu negocio
                {feature.price > 0 && (
                  <span> y se agregará {formatCurrency(feature.price)} a tu facturación mensual</span>
                )}.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={isCurrentlyActive ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            {isCurrentlyActive ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}