// components/panel/config/profile-tab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Building, Loader2 } from "lucide-react"
import { BusinessForm, UserForm } from "@/types/config"
import { Separator } from "@/components/ui/separator"

interface ProfileTabProps {
  businessForm: BusinessForm
  userForm: UserForm
  saving: boolean
  onBusinessFormChange: (field: keyof BusinessForm, value: string) => void
  onUserFormChange: (field: keyof UserForm, value: string) => void
  onSaveBusinessInfo: () => void
}

export const ProfileTab = ({ 
  businessForm, 
  userForm, 
  saving,
  onBusinessFormChange, 
  onUserFormChange,
  onSaveBusinessInfo
}: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Tu información personal y de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">Nombre</Label>
              <Input 
                id="first-name" 
                value={userForm.firstName}
                onChange={(e) => onUserFormChange('firstName', e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Apellido</Label>
              <Input 
                id="last-name" 
                value={userForm.lastName}
                onChange={(e) => onUserFormChange('lastName', e.target.value)}
                disabled
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={userForm.email}
              onChange={(e) => onUserFormChange('email', e.target.value)}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input 
              id="username" 
              value={userForm.username}
              onChange={(e) => onUserFormChange('username', e.target.value)}
              disabled
            />
          </div>
          <p className="text-sm text-muted-foreground">
            La información personal no se puede editar desde aquí por el momento
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Información del Negocio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información del Negocio
          </CardTitle>
          <CardDescription>
            Administra la información visible de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del Negocio</Label>
            <Input 
              id="business-name" 
              placeholder="Ej: Salón de Belleza Glamour"
              value={businessForm.name}
              onChange={(e) => onBusinessFormChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-description">Descripción</Label>
            <Textarea
              id="business-description"
              placeholder="Describe tu negocio..."
              value={businessForm.description}
              onChange={(e) => onBusinessFormChange('description', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-address">Dirección</Label>
            <Input 
              id="business-address" 
              placeholder="Ej: Av. Principal #123, San José"
              value={businessForm.address}
              onChange={(e) => onBusinessFormChange('address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-phone">Teléfono</Label>
            <Input 
              id="business-phone" 
              placeholder="Ej: +506 1234 5678"
              value={businessForm.phone}
              onChange={(e) => onBusinessFormChange('phone', e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={onSaveBusinessInfo}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
