// landing\app\panel\configuraciones\page.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Building, Bell, Clock, Palette, Save } from "lucide-react"

export default function ConfiguracionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones</h1>
          <p className="text-muted-foreground">
            Personaliza la configuración de tu negocio y cuenta.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información del Negocio */}
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
                <Input id="business-name" defaultValue="PeluqueriaClavito" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-type">Tipo de Negocio</Label>
                <Input id="business-type" defaultValue="Peluquería" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-description">Descripción</Label>
              <Textarea 
                id="business-description" 
                placeholder="Describe tu negocio..."
                defaultValue="Peluquería profesional con más de 10 años de experiencia"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-phone">Teléfono</Label>
                <Input id="business-phone" defaultValue="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email">Email</Label>
                <Input id="business-email" defaultValue="info@peluqueriaclavito.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-address">Dirección</Label>
              <Input id="business-address" defaultValue="Av. Principal 123, Ciudad" />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Usuario */}
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
                <Input id="first-name" defaultValue="Clavito" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input id="last-name" defaultValue="Clavo" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="clavito@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input id="username" defaultValue="clavito" />
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Trabajo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Trabajo
            </CardTitle>
            <CardDescription>
              Configura tus horarios de atención
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                <div key={day} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch defaultChecked={day !== 'Domingo'} />
                    <Label className="w-20">{day}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="time" 
                      defaultValue={day !== 'Domingo' ? "09:00" : ""} 
                      className="w-24"
                      disabled={day === 'Domingo'}
                    />
                    <span>-</span>
                    <Input 
                      type="time" 
                      defaultValue={day !== 'Domingo' ? "18:00" : ""} 
                      className="w-24"
                      disabled={day === 'Domingo'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura qué notificaciones quieres recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuevas citas</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificación cuando se agenden nuevas citas
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recordatorios de citas</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar recordatorios antes de las citas
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cancelaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar cuando se cancelen citas
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Personalización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Personalización
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia de tu panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Activar tema oscuro para el panel
                </p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Idioma</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button size="lg">
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
