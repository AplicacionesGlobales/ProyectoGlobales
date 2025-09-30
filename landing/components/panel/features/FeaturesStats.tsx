"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, CheckCircle, DollarSign } from "lucide-react"
import { BrandFeature } from "@/api/types"
import { formatCurrency } from "./utils/featureUtils"

interface FeaturesStatsProps {
  totalFeatures: number
  activeFeaturesCount: number
  activeBrandFeatures: BrandFeature[]
}

export function FeaturesStats({ 
  totalFeatures, 
  activeFeaturesCount, 
  activeBrandFeatures 
}: FeaturesStatsProps) {
  const totalMonthlyCost = activeBrandFeatures.reduce(
    (total: number, bf: BrandFeature) => total + (bf.feature?.price ?? 0), 
    0
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Funcionalidades</p>
              <p className="text-2xl font-bold">{totalFeatures}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Funcionalidades Activas</p>
              <p className="text-2xl font-bold">{activeFeaturesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Costo Total Mensual</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalMonthlyCost)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}