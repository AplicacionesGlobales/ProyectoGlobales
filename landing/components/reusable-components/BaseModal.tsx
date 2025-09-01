import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, RefreshCw } from "lucide-react"

export interface BaseModalProps {
  // Estados de control
  isOpen: boolean
  onClose: () => void
  
  // Contenido del modal
  title: string
  description?: string
  children: React.ReactNode
  
  // Configuración de botones
  showFooter?: boolean
  primaryButton?: {
    text: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }
  secondaryButton?: {
    text: string
    onClick: () => void
    disabled?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }
  
  // Configuración de tamaño y estilo
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
  maxHeight?: string
  className?: string
  
  // Configuración de comportamiento
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  
  // Icon para el título (opcional)
  titleIcon?: React.ReactNode
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md", 
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl", 
  "4xl": "sm:max-w-4xl",
  full: "sm:max-w-full"
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  showFooter = true,
  primaryButton,
  secondaryButton,
  size = "md",
  maxHeight = "90vh",
  className = "",
  closeOnOverlayClick = true,
  showCloseButton = true,
  titleIcon
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && closeOnOverlayClick) {
      onClose()
    }
  }

  const contentClasses = `${sizeClasses[size]} ${className}`
  const contentStyle = { maxHeight }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={`${contentClasses} flex flex-col`}
        style={{ maxHeight: maxHeight }}
        onInteractOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault()
          }
        }}
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {titleIcon}
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (primaryButton || secondaryButton) && (
          <DialogFooter>
            {secondaryButton && (
              <Button
                variant={secondaryButton.variant || "outline"}
                onClick={secondaryButton.onClick}
                disabled={secondaryButton.disabled}
              >
                {secondaryButton.text}
              </Button>
            )}
            {primaryButton && (
              <Button
                variant={primaryButton.variant || "default"}
                onClick={primaryButton.onClick}
                disabled={primaryButton.disabled || primaryButton.loading}
              >
                {primaryButton.loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {primaryButton.text}
                  </>
                ) : (
                  primaryButton.text
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}