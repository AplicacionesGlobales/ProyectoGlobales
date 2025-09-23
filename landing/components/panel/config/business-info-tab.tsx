// components/configuraciones/BusinessInfoTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building } from "lucide-react"
import { BusinessForm } from "@/types/config"

interface BusinessInfoTabProps {
  businessForm: BusinessForm
  saving: boolean
  onFormChange: (field: keyof BusinessForm, value: string) => void
  onSave: () => void
}

export const BusinessInfoTab = ({ 
  businessForm, 
  saving, 
  onFormChange, 
  onSave 
}: BusinessInfoTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Información del Negocio
        </CardTitle>
        <CardDescription>
          Configura los datos básicos de tu negocio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del Negocio</Label>
            <Input 
              id="business-name" 
              value={businessForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-phone">Teléfono</Label>
            <Input 
              id="business-phone" 
              value={businessForm.phone}
              onChange={(e) => onFormChange('phone', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-description">Descripción</Label>
          <Textarea 
            id="business-description" 
            placeholder="Describe tu negocio..."
            value={businessForm.description}
            onChange={(e) => onFormChange('description', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-address">Dirección</Label>
          <Input 
            id="business-address" 
            value={businessForm.address}
            onChange={(e) => onFormChange('address', e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Información'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}