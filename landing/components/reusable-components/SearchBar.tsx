import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Filter, SortAsc, SortDesc } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"

export interface SortOption {
  key: string
  label: string
}

export interface FilterOption {
  key: string
  label: string
  count?: number
}

export interface SearchBarProps {
  // Configuración básica del buscador
  value: string
  onChange: (value: string) => void
  placeholder?: string
  
  // Configuración de filtros (opcional)
  enableFilters?: boolean
  filterOptions?: FilterOption[]
  activeFilters?: string[]
  onFilterChange?: (filters: string[]) => void
  
  // Configuración de ordenamiento (opcional)
  enableSort?: boolean
  sortOptions?: SortOption[]
  currentSort?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (sortKey: string, direction: 'asc' | 'desc') => void
  
  // Acciones adicionales (opcional)
  additionalActions?: Array<{
    text: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
  
  // Estilos y comportamiento
  className?: string
  showCard?: boolean // Si mostrar el Card wrapper o solo el contenido
  disabled?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  enableFilters = false,
  filterOptions = [],
  activeFilters = [],
  onFilterChange,
  enableSort = false,
  sortOptions = [],
  currentSort,
  sortDirection = 'asc',
  onSortChange,
  additionalActions = [],
  className = "",
  showCard = true,
  disabled = false
}) => {
  const handleClearSearch = () => {
    onChange('')
  }

  const handleFilterToggle = (filterKey: string) => {
    if (!onFilterChange) return
    
    const newFilters = activeFilters.includes(filterKey)
      ? activeFilters.filter(f => f !== filterKey)
      : [...activeFilters, filterKey]
    
    onFilterChange(newFilters)
  }

  const handleSortSelect = (sortKey: string) => {
    if (!onSortChange) return
    
    // Si es el mismo sort, cambiar dirección
    const newDirection = currentSort === sortKey && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(sortKey, newDirection)
  }

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Buscador principal */}
      <div className="relative flex-1">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9"
          disabled={disabled}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="h-4 w-4 p-0 absolute right-3 top-3"
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filtros */}
      {enableFilters && filterOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={disabled}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFilters.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white rounded-full px-1 text-xs">
                  {activeFilters.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => handleFilterToggle(option.key)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  <div className="flex items-center gap-1">
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                    {activeFilters.includes(option.key) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Ordenamiento */}
      {enableSort && sortOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={disabled}>
              {sortDirection === 'asc' ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => handleSortSelect(option.key)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {currentSort === option.key && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Acciones adicionales */}
      {additionalActions.map((action, index) => {
        const IconComponent = action.icon
        return (
          <Button
            key={index}
            variant={action.variant || "outline"}
            onClick={action.onClick}
            disabled={disabled}
          >
            {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
            {action.text}
          </Button>
        )
      })}
    </div>
  )

  if (!showCard) {
    return content
  }

  return (
    <Card>
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  )
}