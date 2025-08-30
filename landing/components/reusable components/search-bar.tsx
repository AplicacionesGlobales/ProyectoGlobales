// components/ui/search-bar.tsx
import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, X, Filter, Plus } from "lucide-react"

export interface SearchField {
  key: string
  label: string
  type?: 'text' | 'number' | 'email'
  placeholder?: string
}

export interface SearchFilter {
  field: string
  value: string
  label?: string
}

interface SearchBarProps {
  searchFields: SearchField[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (term: string, filters: SearchFilter[]) => void
  allowMultipleFields?: boolean
  filters?: SearchFilter[]
  onFiltersChange?: (filters: SearchFilter[]) => void
  className?: string
  showAdvancedSearch?: boolean
  debounceMs?: number
}

export function SearchBar({
  searchFields,
  placeholder = "Buscar...",
  value = "",
  onChange,
  onSearch,
  allowMultipleFields = false,
  filters = [],
  onFiltersChange,
  className = "",
  showAdvancedSearch = false,
  debounceMs = 300
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [selectedField, setSelectedField] = useState<string>(searchFields[0]?.key || "")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<SearchFilter[]>(filters)
  const [newFilterField, setNewFilterField] = useState("")
  const [newFilterValue, setNewFilterValue] = useState("")

  const handleSearchChange = (newValue: string) => {
    setSearchTerm(newValue)
    onChange?.(newValue)
    
    if (debounceMs > 0) {
      // Debounce logic would be handled by the hook
      setTimeout(() => {
        onSearch?.(newValue, filters)
      }, debounceMs)
    } else {
      onSearch?.(newValue, filters)
    }
  }

  const handleAddFilter = () => {
    if (!newFilterField || !newFilterValue) return

    const field = searchFields.find(f => f.key === newFilterField)
    const newFilter: SearchFilter = {
      field: newFilterField,
      value: newFilterValue,
      label: field?.label || newFilterField
    }

    const updatedFilters = [...tempFilters, newFilter]
    setTempFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
    
    setNewFilterField("")
    setNewFilterValue("")
  }

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = tempFilters.filter((_, i) => i !== index)
    setTempFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const handleClearAll = () => {
    setSearchTerm("")
    setTempFilters([])
    onChange?.("")
    onFiltersChange?.([])
    onSearch?.("", [])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(searchTerm, filters)
    }
  }

  const currentFieldType = searchFields.find(f => f.key === selectedField)?.type || 'text'
  const currentFieldPlaceholder = searchFields.find(f => f.key === selectedField)?.placeholder || placeholder

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder={allowMultipleFields ? currentFieldPlaceholder : placeholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 pr-4"
                type={currentFieldType}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => handleSearchChange("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Field Selector */}
            {allowMultipleFields && (
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Campo de búsqueda" />
                </SelectTrigger>
                <SelectContent>
                  {searchFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Advanced Search Toggle */}
            {showAdvancedSearch && (
              <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                    {tempFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                        {tempFilters.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filtros Avanzados</h4>
                      {tempFilters.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setTempFilters([])
                            onFiltersChange?.([])
                          }}
                        >
                          Limpiar todo
                        </Button>
                      )}
                    </div>

                    {/* Add New Filter */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex gap-2">
                        <Select value={newFilterField} onValueChange={setNewFilterField}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar campo" />
                          </SelectTrigger>
                          <SelectContent>
                            {searchFields.map((field) => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Valor a buscar"
                          value={newFilterValue}
                          onChange={(e) => setNewFilterValue(e.target.value)}
                          className="flex-1"
                          type={searchFields.find(f => f.key === newFilterField)?.type || 'text'}
                        />
                        <Button
                          size="sm"
                          onClick={handleAddFilter}
                          disabled={!newFilterField || !newFilterValue}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {tempFilters.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Filtros Activos</h5>
                        <div className="space-y-1">
                          {tempFilters.map((filter, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm"
                            >
                              <span>
                                <strong>{filter.label}:</strong> {filter.value}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => handleRemoveFilter(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Clear All Button */}
            {(searchTerm || tempFilters.length > 0) && (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Limpiar
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {tempFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tempFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter.label}: {filter.value}
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}