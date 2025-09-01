import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, LucideIcon } from "lucide-react"

// Tipos genéricos para las columnas
export interface ColumnConfig<T = any> {
  key: string
  title: string
  width?: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

// Configuración de acciones por fila
export interface RowAction<T = any> {
  key: string
  label: string
  icon?: LucideIcon
  onClick: (item: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: (item: T) => boolean
  hidden?: (item: T) => boolean
}

// Configuración del avatar/imagen
export interface AvatarConfig<T = any> {
  show: boolean
  getInitials?: (item: T) => string
  getImageUrl?: (item: T) => string | undefined
  backgroundColor?: (item: T) => string
  className?: string
}

export interface DataTableProps<T = any> {
  // Datos y configuración básica
  data: T[]
  columns: ColumnConfig<T>[]
  keyExtractor: (item: T) => string | number
  
  // Header de la tabla
  title?: string
  titleIcon?: LucideIcon
  subtitle?: string
  showCount?: boolean
  
  // Estados de carga
  loading?: boolean
  loadingText?: string
  
  // Estados vacíos
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    text: string
    onClick: () => void
    icon?: LucideIcon
  }
  
  // Configuración del avatar
  avatar?: AvatarConfig<T>
  
  // Acciones por fila
  actions?: RowAction<T>[]
  
  // Configuración adicional
  hover?: boolean // Efecto hover en las filas
  className?: string
  cardClassName?: string
  
  // Slot para contenido adicional en el header
  headerExtra?: React.ReactNode
  
  // Configuración de paginación (si es necesaria en el futuro)
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export const DataTable = <T,>({
  data,
  columns,
  keyExtractor,
  title,
  titleIcon: TitleIcon,
  subtitle,
  showCount = true,
  loading = false,
  loadingText = "Cargando...",
  emptyIcon: EmptyIcon,
  emptyTitle = "No hay datos",
  emptyDescription = "No se encontraron registros para mostrar",
  emptyAction,
  avatar,
  actions = [],
  hover = true,
  className = "",
  cardClassName = "",
  headerExtra
}: DataTableProps<T>) => {
  const renderCellContent = (item: T, column: ColumnConfig<T>) => {
    if (column.render) {
      return column.render(item)
    }
    
    // Renderizado por defecto usando el key como path
    const value = (item as any)[column.key]
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }
    
    return String(value)
  }

  const renderAvatar = (item: T) => {
    if (!avatar?.show) return null
    
    const initials = avatar.getInitials?.(item) || "?"
    const imageUrl = avatar.getImageUrl?.(item)
    const bgColor = avatar.backgroundColor?.(item) || "bg-blue-500"
    
    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-medium ${avatar.className || ""}`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              // Fallback a iniciales si la imagen falla
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextSibling!.textContent = initials
            }}
          />
        ) : (
          initials
        )}
      </div>
    )
  }

  const renderActions = (item: T) => {
    const visibleActions = actions.filter(action => !action.hidden?.(item))
    
    if (visibleActions.length === 0) return null
    
    return (
      <div className="flex items-center gap-2">
        {visibleActions.map(action => {
          const IconComponent = action.icon
          const isDisabled = action.disabled?.(item)
          
          return (
            <Button
              key={action.key}
              variant={action.variant || "outline"}
              size="sm"
              onClick={() => !isDisabled && action.onClick(item)}
              disabled={isDisabled}
              title={action.label}
            >
              {IconComponent && <IconComponent className="h-3 w-3" />}
              {!IconComponent && action.label}
            </Button>
          )
        })}
      </div>
    )
  }

  // Construir el estilo de grid dinámicamente
  const gridColumns = [
    ...(avatar?.show ? ['auto'] : []),
    ...columns.map(col => col.width || '1fr'),
    ...(actions.length > 0 ? ['auto'] : [])
  ].join(' ')

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {TitleIcon && <TitleIcon className="h-5 w-5" />}
              {title}
              {showCount && (
                <span className="text-muted-foreground">({data.length})</span>
              )}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {headerExtra}
        </div>
      </CardHeader>
      
      <CardContent className={className}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>{loadingText}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            {EmptyIcon && <EmptyIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />}
            <h3 className="text-lg font-medium mb-2">{emptyTitle}</h3>
            <p className="text-muted-foreground mb-4">{emptyDescription}</p>
            {emptyAction && (
              <Button onClick={emptyAction.onClick} variant="outline">
                {emptyAction.icon && <emptyAction.icon className="mr-2 h-4 w-4" />}
                {emptyAction.text}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Header de la tabla */}
            <div 
              className="grid gap-4 px-4 py-3 bg-gray-50/50 border-b font-medium text-sm text-gray-700 items-center"
              style={{ gridTemplateColumns: gridColumns }}
            >
              {avatar?.show && (
                <div className="flex justify-start">
                  <div className="w-10 h-10 flex items-center">
                    {/* Espacio para alinear con avatar */}
                  </div>
                </div>
              )}
              {columns.map((column) => (
                <div key={column.key} className={`${column.className || ''} text-sm flex items-center`}>
                  {column.title}
                </div>
              ))}
              {actions.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-sm">Acciones</div>
                </div>
              )}
            </div>

            {/* Filas de datos */}
            <div className="divide-y">
              {data.map((item) => (
                <div
                  key={keyExtractor(item)}
                  className={`grid gap-4 px-4 py-3 items-center ${hover ? 'hover:bg-gray-50/50 transition-colors' : ''}`}
                  style={{ gridTemplateColumns: gridColumns }}
                >
                  {avatar?.show && (
                    <div className="flex justify-start">
                      {renderAvatar(item)}
                    </div>
                  )}
                  
                  {columns.map((column) => (
                    <div key={column.key} className={`${column.className || ''} text-sm`}>
                      {renderCellContent(item, column)}
                    </div>
                  ))}
                  
                  {actions.length > 0 && (
                    <div className="flex justify-end">
                      {renderActions(item)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}