// components/configuraciones/UserInfoTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { UserForm } from "@/types/config"

interface UserInfoTabProps {
  userForm: UserForm
  onFormChange: (field: keyof UserForm, value: string) => void
}

export const UserInfoTab = ({ userForm, onFormChange }: UserInfoTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
        <CardDescription>
          Gestiona tu información personal y de cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Nombre</Label>
            <Input 
              id="first-name" 
              value={userForm.firstName}
              onChange={(e) => onFormChange('firstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Apellido</Label>
            <Input 
              id="last-name" 
              value={userForm.lastName}
              onChange={(e) => onFormChange('lastName', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={userForm.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            disabled
          />
          <p className="text-sm text-muted-foreground">
            El email no se puede cambiar desde aquí
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input 
            id="username" 
            value={userForm.username}
            onChange={(e) => onFormChange('username', e.target.value)}
            disabled
          />
          <p className="text-sm text-muted-foreground">
            El nombre de usuario no se puede cambiar desde aquí
          </p>
        </div>
        <div className="flex justify-end">
          <Button disabled>
            Actualización de perfil próximamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}