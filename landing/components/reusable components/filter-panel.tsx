// components/ui/filter-panel.tsx
//use client


import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Filter, X, Calendar, Tag, RefreshCw, ChevronDown, Check } from "lucide-react"

export interface TagFilter {
  id: string
  label: string
  color?: string
  count?: number
}

export interface DateFilter {
  field: string
  label: string
  from?: string
  to?: string
}

export interface CustomFilter {
  field: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'boolean'
  options?: { value: string; label: string; count?: number }[]
  value?: any
}

export interface ActiveFilter {
  type: 'tag' | 'date' | 'custom'
  field: string
  value: any
  label: string
}

interface FilterPanelProps {
  tagFilters?: TagFilter[]
  dateFilters?: DateFilter[]
  customFilters?: CustomFilter[]
  activeFilters?: ActiveFilter[]
  onFiltersChange?: (filters: ActiveFilter[]) => void
  onReset?: () => void
  title?: string
  description?: string
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function FilterPanel({
  tagFilters = [],
  dateFilters = [],
  customFilters = [],
  activeFilters = [],
  onFiltersChange,
  onReset,
  title = "Filtros",
  description,
  className = "",
  collapsible = false,
  defaultCollapsed = false
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [tempFilters, setTempFilters] = useState<ActiveFilter[]>(activeFilters)
  const [dateRanges, setDateRanges] = useState<Record<string, { from: string; to: string }>>({})

  const handleTagToggle = (tag: TagFilter) => {
    const existingIndex = tempFilters.findIndex(
      f => f.type === 'tag' && f.field === tag.id
    )

    let updatedFilters: ActiveFilter[]
    if (existingIndex >= 0) {
      updatedFilters = tempFilters.filter((_, index) => index !== existingIndex)
    } else {
      const newFilter: ActiveFilter = {
        type: 'tag',
        field: tag.id,
        value: tag.id,
        label: tag.label
      }
      updatedFilters = [...tempFilters, newFilter]
    }

    setTempFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const handleDateRangeChange = (dateFilter: DateFilter, field: 'from' | 'to', value: string) => {
    const currentRange = dateRanges[dateFilter.field] || { from: '', to: '' }
    const newRange = { ...currentRange, [field]: value }
    
    setDateRanges(prev => ({
      ...prev,
      [dateFilter.field]: newRange
    }))

    // Remove existing date filter for this field
    const withoutThisDateFilter = tempFilters.filter(
      f => !(f.type === 'date' && f.field === dateFilter.field)
    )

    // Add new date filter if both dates are set
    if (newRange.from || newRange.to) {
      const newFilter: ActiveFilter = {
        type: 'date',
        field: dateFilter.field,
        value: newRange,
        label: `${dateFilter.label}: ${newRange.from || '...'} - ${newRange.to || '...'}`
      }
      const updatedFilters = [...withoutThisDateFilter, newFilter]
      setTempFilters(updatedFilters)
      onFiltersChange?.(updatedFilters)
    } else {
      setTempFilters(withoutThisDateFilter)
      onFiltersChange?.(withoutThisDateFilter)
    }
  }

  const handleCustomFilterChange = (customFilter: CustomFilter, value: any) => {
    // Remove existing custom filter for this field
    const withoutThisCustomFilter = tempFilters.filter(
      f => !(f.type === 'custom' && f.field === customFilter.field)
    )

    // Treat "all" as empty value (no filter)
    if (value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : value !== '')) {
      let displayValue = value
      if (customFilter.type === 'multiselect' && Array.isArray(value)) {
        displayValue = value.map(v => 
          customFilter.options?.find(opt => opt.value === v)?.label || v
        ).join(', ')
      } else if (customFilter.type === 'select') {
        displayValue = customFilter.options?.find(opt => opt.value === value)?.label || value
      }

      const newFilter: ActiveFilter = {
        type: 'custom',
        field: customFilter.field,
        value: value,
        label: `${customFilter.label}: ${displayValue}`
      }
      const updatedFilters = [...withoutThisCustomFilter, newFilter]
      setTempFilters(updatedFilters)
      onFiltersChange?.(updatedFilters)
    } else {
      setTempFilters(withoutThisCustomFilter)
      onFiltersChange?.(withoutThisCustomFilter)
    }
  }

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = tempFilters.filter((_, i) => i !== index)
    setTempFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)

    // Reset related state
    const removedFilter = tempFilters[index]
    if (removedFilter.type === 'date') {
      setDateRanges(prev => {
        const newRanges = { ...prev }
        delete newRanges[removedFilter.field]
        return newRanges
      })
    }
  }

  const handleResetAll = () => {
    setTempFilters([])
    setDateRanges({})
    onFiltersChange?.([])
    onReset?.()
  }

  const isTagActive = (tagId: string): boolean => {
    return tempFilters.some(f => f.type === 'tag' && f.field === tagId)
  }

  const getCustomFilterValue = (field: string): any => {
    const filter = tempFilters.find(f => f.type === 'custom' && f.field === field)
    return filter?.value
  }

  if (collapsible && isCollapsed) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">{title}</span>
              {tempFilters.length > 0 && (
                <Badge variant="secondary">
                  {tempFilters.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {title}
              {tempFilters.length > 0 && (
                <Badge variant="secondary">
                  {tempFilters.length}
                </Badge>
              )}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            {tempFilters.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleResetAll}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronDown className="h-4 w-4 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Filters */}
        {tempFilters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros Activos</Label>
            <div className="flex flex-wrap gap-2">
              {tempFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveFilter(index)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Tag Filters */}
        {tagFilters.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Etiquetas
            </Label>
            <div className="flex flex-wrap gap-2">
              {tagFilters.map((tag) => (
                <Button
                  key={tag.id}
                  variant={isTagActive(tag.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs ${tag.color ? `border-${tag.color}-200 text-${tag.color}-700` : ''}`}
                >
                  {tag.label}
                  {tag.count !== undefined && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      {tag.count}
                    </Badge>
                  )}
                  {isTagActive(tag.id) && (
                    <Check className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Date Filters */}
        {dateFilters.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Filtros de Fecha
            </Label>
            <div className="space-y-4">
              {dateFilters.map((dateFilter) => {
                const currentRange = dateRanges[dateFilter.field] || { from: '', to: '' }
                return (
                  <div key={dateFilter.field} className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {dateFilter.label}
                    </Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Desde</Label>
                        <Input
                          type="date"
                          value={currentRange.from}
                          onChange={(e) => handleDateRangeChange(dateFilter, 'from', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <span className="text-muted-foreground pt-5">-</span>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Hasta</Label>
                        <Input
                          type="date"
                          value={currentRange.to}
                          onChange={(e) => handleDateRangeChange(dateFilter, 'to', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom Filters */}
        {customFilters.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Filtros Personalizados</Label>
            {customFilters.map((customFilter) => (
              <div key={customFilter.field} className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {customFilter.label}
                </Label>

                {/* Select Filter */}
                {customFilter.type === 'select' && (
                  <Select
                    value={getCustomFilterValue(customFilter.field) || ""}
                    onValueChange={(value) => handleCustomFilterChange(customFilter, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${customFilter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {customFilter.options?.map((option) => (
                        option.value && option.value.trim() !== '' ? (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{option.label}</span>
                              {option.count !== undefined && (
                                <Badge variant="secondary" className="h-4 w-4 p-0 text-xs ml-2">
                                  {option.count}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ) : null
                      )).filter(Boolean)}
                    </SelectContent>
                  </Select>
                )}

                {/* Multi-select Filter */}
                {customFilter.type === 'multiselect' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {(() => {
                          const selectedValues = getCustomFilterValue(customFilter.field) || []
                          if (selectedValues.length === 0) {
                            return `Seleccionar ${customFilter.label.toLowerCase()}`
                          }
                          if (selectedValues.length === 1) {
                            const option = customFilter.options?.find(opt => opt.value === selectedValues[0])
                            return option?.label || selectedValues[0]
                          }
                          return `${selectedValues.length} seleccionados`
                        })()}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2">
                      <div className="space-y-1">
                        {customFilter.options?.map((option) => {
                          const selectedValues = getCustomFilterValue(customFilter.field) || []
                          const isSelected = selectedValues.includes(option.value)
                          return (
                            <Button
                              key={option.value}
                              variant={isSelected ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                const currentValues = selectedValues || []
                                const newValues = isSelected
                                  ? currentValues.filter((v: string) => v !== option.value)
                                  : [...currentValues, option.value]
                                handleCustomFilterChange(customFilter, newValues)
                              }}
                            >
                              {isSelected && <Check className="h-3 w-3 mr-2" />}
                              <span className="flex-1 text-left">{option.label}</span>
                              {option.count !== undefined && (
                                <Badge variant="outline" className="h-4 w-4 p-0 text-xs ml-2">
                                  {option.count}
                                </Badge>
                              )}
                            </Button>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Range Filter */}
                {customFilter.type === 'range' && (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={getCustomFilterValue(customFilter.field)?.min || ""}
                      onChange={(e) => {
                        const current = getCustomFilterValue(customFilter.field) || {}
                        handleCustomFilterChange(customFilter, {
                          ...current,
                          min: e.target.value
                        })
                      }}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={getCustomFilterValue(customFilter.field)?.max || ""}
                      onChange={(e) => {
                        const current = getCustomFilterValue(customFilter.field) || {}
                        handleCustomFilterChange(customFilter, {
                          ...current,
                          max: e.target.value
                        })
                      }}
                    />
                  </div>
                )}

                {/* Boolean Filter */}
                {customFilter.type === 'boolean' && (
                  <Select
                    value={getCustomFilterValue(customFilter.field) || ""}
                    onValueChange={(value) => handleCustomFilterChange(customFilter, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {tagFilters.length === 0 && dateFilters.length === 0 && customFilters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay filtros disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}