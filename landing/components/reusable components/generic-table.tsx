// components/ui/generic-table.tsx
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface TableAction<T> {
  type: 'view' | 'edit' | 'delete' | 'custom'
  label?: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'outline' | 'destructive' | 'default'
  show?: (item: T) => boolean
}

interface GenericTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: TableAction<T>[]
  loading?: boolean
  title?: string
  description?: string
  emptyMessage?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage?: number
    totalItems?: number
  }
  onRefresh?: () => void
  className?: string
}

export function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  actions = [],
  loading = false,
  title,
  description,
  emptyMessage = "No hay datos disponibles",
  emptyAction,
  pagination,
  onRefresh,
  className = ""
}: GenericTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const defaultActions: TableAction<T>[] = [
    {
      type: 'view',
      icon: <Eye className="h-3 w-3" />,
      onClick: () => {},
      variant: 'outline'
    }
  ]

  const finalActions = actions.length > 0 ? actions : defaultActions

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando datos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || description || onRefresh) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="flex items-center gap-2">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
              📊
            </div>
            <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
            {emptyAction && (
              <Button onClick={emptyAction.onClick}>
                {emptyAction.label}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {columns.map((column, index) => (
                        <th
                          key={index}
                          className={`text-left py-3 px-4 font-medium text-sm text-muted-foreground ${
                            column.width ? `w-${column.width}` : ''
                          } ${column.sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                          onClick={() => column.sortable && typeof column.key === 'string' && handleSort(column.key)}
                        >
                          <div className="flex items-center gap-1">
                            {column.label}
                            {column.sortable && sortField === column.key && (
                              <span className="text-xs">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      {finalActions.length > 0 && (
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground w-32">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, rowIndex) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                        {columns.map((column, colIndex) => {
                          const value = typeof column.key === 'string' 
                            ? getNestedValue(item, column.key)
                            : (item as any)[column.key]
                          
                          return (
                            <td key={colIndex} className="py-3 px-4">
                              {column.render ? column.render(value, item) : (
                                <span className="text-sm">{value}</span>
                              )}
                            </td>
                          )
                        })}
                        {finalActions.length > 0 && (
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {finalActions.map((action, actionIndex) => {
                                if (action.show && !action.show(item)) return null
                                
                                return (
                                  <Button
                                    key={actionIndex}
                                    variant={action.variant || 'outline'}
                                    size="sm"
                                    onClick={() => action.onClick(item)}
                                    title={action.label}
                                  >
                                    {action.icon}
                                  </Button>
                                )
                              })}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    {columns.slice(0, 3).map((column, index) => {
                      const value = typeof column.key === 'string' 
                        ? getNestedValue(item, column.key)
                        : (item as any)[column.key]
                      
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {column.label}:
                          </span>
                          <div className="text-sm">
                            {column.render ? column.render(value, item) : value}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {finalActions.length > 0 && (
                    <div className="flex gap-1 mt-3 pt-3 border-t">
                      {finalActions.map((action, actionIndex) => {
                        if (action.show && !action.show(item)) return null
                        
                        return (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={() => action.onClick(item)}
                          >
                            {action.icon}
                            {action.label && <span className="ml-1">{action.label}</span>}
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  {pagination.totalItems && (
                    <>
                      Mostrando {((pagination.currentPage - 1) * (pagination.itemsPerPage || 20)) + 1} - {Math.min(pagination.currentPage * (pagination.itemsPerPage || 20), pagination.totalItems)} de {pagination.totalItems} resultados
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}