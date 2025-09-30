"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle } from "lucide-react"
import { Feature, BrandFeature } from "@/api/types"
import { FeatureRow } from "./FeatureRow"

interface FeaturesTableListProps {
  features: Feature[]
  brandFeatures: BrandFeature[]
  loading: boolean
  error: string | null
  searchTerm: string
  onFeatureToggle: (feature: Feature) => void
  onShowDetails: (feature: Feature) => void
}

export function FeaturesTableList({ 
  features, 
  brandFeatures,
  loading,
  error,
  searchTerm,
  onFeatureToggle, 
  onShowDetails 
}: FeaturesTableListProps) {
  const isFeatureActive = (featureId: number): boolean => {
    const brandFeature = brandFeatures.find((bf: BrandFeature) => bf.featureId === featureId)
    return brandFeature?.isActive ?? false
  }

  const getBrandFeatureInfo = (featureId: number): BrandFeature | null => {
    return brandFeatures.find((bf: BrandFeature) => bf.featureId === featureId) ?? null
  }

  return (
    <>
      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionalidad</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm ? 'No se encontraron funcionalidades' : 'No hay funcionalidades disponibles'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature: Feature) => (
                <FeatureRow
                  key={feature.id}
                  feature={feature}
                  isActive={isFeatureActive(feature.id)}
                  brandFeatureInfo={getBrandFeatureInfo(feature.id)}
                  loading={loading}
                  onToggle={onFeatureToggle}
                  onShowDetails={onShowDetails}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}