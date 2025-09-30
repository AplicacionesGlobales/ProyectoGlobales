// app/panel/features-management/page.tsx
"use client"
import { useState, useEffect } from "react"
import { FeaturesTable } from "@/components/panel/features"

interface BrandData {
  id: number
  name: string
  businessType?: string
}

export default function FeaturesManagementPage() {
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get brand data from localStorage or context
    const brandDataStr = localStorage.getItem('brand_data')
    if (brandDataStr) {
      try {
        const data = JSON.parse(brandDataStr)
        setBrandData(data)
      } catch (error) {
        console.error('Error parsing brand data:', error)
        setError('Error cargando datos de la marca')
      }
    } else {
      setError('No se encontraron datos de la marca')
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <FeaturesTable brandId={brandData.id} />
    </div>
  )
}