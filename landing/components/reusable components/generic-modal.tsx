// components/ui/generic-modal.tsx
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface ModalAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  show?: boolean
}

interface GenericModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  actions?: ModalAction[]
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  error?: string | null
  success?: string | null
  className?: string
  closeOnOutsideClick?: boolean
  closable?: boolean
  showHeader?: boolean
  showFooter?: boolean
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md', 
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-4xl'
}

export function GenericModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions = [],
  size = 'md',
  error,
  success,
  className = '',
  closeOnOutsideClick = true,
  closable = true,
  showHeader = true,
  showFooter = true
}: GenericModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !closable) return
    onOpenChange(newOpen)
  }

  const handleClose = () => {
    if (closable) {
      onOpenChange(false)
    }
  }

  const visibleActions = actions.filter(action => action.show !== false)

  return (
    <Dialog 
      open={open} 
      onOpenChange={closeOnOutsideClick ? handleOpenChange : undefined}
    >
      <DialogContent 
        className={`${sizeClasses[size]} ${className} p-0`}
        onInteractOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
        // Removemos el botón de cerrar por defecto del DialogContent
        onPointerDownOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
      >
        {/* Header personalizado */}
        {showHeader && (
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-lg font-semibold">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-sm text-muted-foreground">
                    {description}
                  </DialogDescription>
                )}
              </div>
              {closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full shrink-0 ml-2"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar</span>
                </Button>
              )}
            </div>
          </DialogHeader>
        )}

        {/* Contenido principal */}
        <div className="px-6 py-4">
          {/* Error y Success Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Contenido del modal */}
          {children}
        </div>

        {/* Footer con acciones */}
        {showFooter && visibleActions.length > 0 && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pb-6 pt-4 border-t bg-gray-50/50">
            {visibleActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="w-full sm:w-auto"
              >
                {action.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Cargando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </div>
                )}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Hook para manejar modales
export function useModal(initialOpen: boolean = false) {
  const [open, setOpen] = React.useState(initialOpen)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const openModal = React.useCallback(() => {
    setOpen(true)
    setError(null)
    setSuccess(null)
  }, [])

  const closeModal = React.useCallback(() => {
    setOpen(false)
    setError(null)
    setSuccess(null)
    setLoading(false)
  }, [])

  const setModalLoading = React.useCallback((isLoading: boolean) => {
    setLoading(isLoading)
  }, [])

  const setModalError = React.useCallback((errorMessage: string | null) => {
    setError(errorMessage)
  }, [])

  const setModalSuccess = React.useCallback((successMessage: string | null) => {
    setSuccess(successMessage)
  }, [])

  const clearMessages = React.useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  return {
    open,
    loading,
    error,
    success,
    openModal,
    closeModal,
    setModalLoading,
    setModalError,
    setModalSuccess,
    clearMessages
  }
}