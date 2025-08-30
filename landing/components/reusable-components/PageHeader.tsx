import React from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

export interface PageHeaderProps {
  // Contenido principal
  title: string
  subtitle?: string
  
  // Botón de acción principal (opcional)
  primaryAction?: {
    text: string
    onClick: () => void
    icon?: LucideIcon
    disabled?: boolean
    loading?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }
  
  // Acciones secundarias (opcional)
  secondaryActions?: Array<{
    text: string
    onClick: () => void
    icon?: LucideIcon
    disabled?: boolean
    loading?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
  
  // Contenido personalizado adicional
  children?: React.ReactNode
  
  // Estilos
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryActions = [],
  children,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Lado izquierdo - Título y subtítulo */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
        {children}
      </div>

      {/* Lado derecho - Acciones */}
      <div className="flex items-center gap-2">
        {/* Acciones secundarias */}
        {secondaryActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Button
              key={index}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
            >
              {action.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : (
                IconComponent && <IconComponent className="mr-2 h-4 w-4" />
              )}
              {action.text}
            </Button>
          )
        })}

        {/* Acción principal */}
        {primaryAction && (
          <Button
            variant={primaryAction.variant || "default"}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || primaryAction.loading}
          >
            {primaryAction.loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              primaryAction.icon && <primaryAction.icon className="mr-2 h-4 w-4" />
            )}
            {primaryAction.text}
          </Button>
        )}
      </div>
    </div>
  )
}