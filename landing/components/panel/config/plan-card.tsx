import React from "react"
import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PlanCardProps {
  id: number
  name: string
  price: number
  description: string
  features: string[]
  isCurrentPlan: boolean
  isSelected: boolean
  onSelect: () => void
}

export const PlanCard = ({
  name,
  price,
  description,
  features,
  isCurrentPlan,
  isSelected,
  onSelect
}: PlanCardProps) => {
  return (
    <Card 
      className={`relative cursor-pointer transition-all hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : isCurrentPlan 
          ? 'ring-2 ring-green-500' 
          : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      {isCurrentPlan && (
        <Badge className="absolute -top-2 -right-2 bg-green-500">
          Plan Actual
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2">
          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
          <span className="text-muted-foreground">/mes</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full mt-4" 
          variant={isSelected ? "default" : "outline"}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Plan Actual' : isSelected ? 'Seleccionado' : 'Seleccionar'}
        </Button>
      </CardContent>
    </Card>
  )
}
