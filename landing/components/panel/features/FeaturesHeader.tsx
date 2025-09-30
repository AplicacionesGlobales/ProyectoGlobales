"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface FeaturesHeaderProps {
  onRefresh: () => void
  loading: boolean
}

export function FeaturesHeader({ onRefresh, loading }: FeaturesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Funcionalidades</h2>
        <p className="text-gray-600 mt-1">
          Gestiona las funcionalidades disponibles para tu negocio
        </p>
      </div>
      
      <Button 
        onClick={onRefresh} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
    </div>
  )
}