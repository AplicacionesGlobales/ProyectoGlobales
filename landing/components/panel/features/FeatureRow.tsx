"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { TableCell, TableRow } from "@/components/ui/table"
import { Star, Crown, CheckCircle, XCircle, Info } from "lucide-react"
import { Feature, BrandFeature } from "@/api/types"
import { CATEGORY_COLORS, CATEGORY_LABELS, formatCurrency } from "./utils/featureUtils"

interface FeatureRowProps {
  feature: Feature
  isActive: boolean
  brandFeatureInfo: BrandFeature | null
  loading: boolean
  onToggle: (feature: Feature) => void
  onShowDetails: (feature: Feature) => void
}

export function FeatureRow({ 
  feature, 
  isActive, 
  brandFeatureInfo, 
  loading, 
  onToggle, 
  onShowDetails 
}: FeatureRowProps) {
  const getStatusBadge = () => {
    if (isActive) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Activa
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="text-gray-500">
        <XCircle className="w-3 h-3 mr-1" />
        Inactiva
      </Badge>
    )
  }

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{feature.title}</h4>
            {feature.isRecommended && (
              <Star className="w-4 h-4 text-yellow-500" />
            )}
            {feature.isPopular && (
              <Crown className="w-4 h-4 text-purple-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">{feature.description}</p>
          {feature.subtitle && (
            <p className="text-xs text-gray-500">{feature.subtitle}</p>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant="outline" 
          className={CATEGORY_COLORS[feature.category as keyof typeof CATEGORY_COLORS]}
        >
          {CATEGORY_LABELS[feature.category as keyof typeof CATEGORY_LABELS]}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="font-medium">
          {feature.price > 0 ? formatCurrency(feature.price) : 'Gratis'}
        </div>
      </TableCell>
      
      <TableCell>
        {getStatusBadge()}
        {brandFeatureInfo && (
          <div className="text-xs text-gray-500 mt-1">
            Desde {new Date(brandFeatureInfo.createdAt).toLocaleDateString()}
          </div>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggle(feature)}
            disabled={loading}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShowDetails(feature)}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}