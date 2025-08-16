// landing\app\panel\configuraciones\page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, User, Building, Bell, Clock, Palette, Save, AlertCircle, CheckCircle } from "lucide-react"
import { ScheduleConfig } from "@/components/panel/schedule/ScheduleConfig"
import { SpecialHours } from "@/components/panel/schedule/SpecialHours"
import { brandService } from "@/services/brand.service"

interface UserData {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
}

interface BrandData {
  id: number
  name: string
  description?: string
  address?: string
  phone?: string
}

export default function ConfiguracionesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [activeTab, setActiveTab] = useState("business")

  // Estados para formularios
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: ''
  })

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    newAppointments: true,
    appointmentReminders: true,
    cancellations: true,
    emailNotifications: true,
    smsNotifications: false
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    language: 'es'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos del usuario y brand del localStorage
      const userDataStr = localStorage.getItem('user_data')
      const brandDataStr = localStorage.getItem('brand_data')

      if (userDataStr) {
        const user = JSON.parse(userDataStr)
        setUserData(user)
        setUserForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          username: user.username || ''
        })
      }

      if (brandDataStr) {
        const brand = JSON.parse(brandDataStr)
        setBrandData(brand)
        
        // Cargar información completa del brand
        const brandResponse = await brandService.getBrandInfo(brand.id)
        if (brandResponse.success && brandResponse.data) {
          const fullBrandData = brandResponse.data
          setBrandData(fullBrandData)
          setBusinessForm({
            name: fullBrandData.name || '',
            description: fullBrandData.description || '',
            phone: fullBrandData.phone || '',
            email: userForm.email, // El email viene del usuario
            address: fullBrandData.address || ''
          })
        }
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessFormChange = (field: string, value: string) => {
    setBusinessForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUserFormChange = (field: string, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAppearanceChange = (field: string, value: any) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveBusinessInfo = async () => {
    if (!brandData?.id) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updateData = {
        name: businessForm.name,
        description: businessForm.description,
        phone: businessForm.phone,
        address: businessForm.address
      }

      const response = await brandService.updateBrand(brandData.id, updateData)

      if (response.success) {
        setSuccess('Información del negocio actualizada exitosamente')
        // Actualizar localStorage
        if (response.data) {
          localStorage.setItem('brand_data', JSON.stringify(response.data))
          setBrandData(response.data)
        }
      } else {
        setError(response.errors?.[0]?.description || 'Error actualizando información del negocio')
      }

    } catch (error: any) {
      console.error('Error saving business info:', error)
      setError('Error guardando información del negocio')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      setSuccess('Configuración de notificaciones guardada')
      // TODO: Implementar guardado de notificaciones cuando esté la API
    } catch (error) {
      setError('Error guardando configuración de notificaciones')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAppearance = async () => {
    try {
      setSaving(true)
      setSuccess('Configuración de apariencia guardada')
      // TODO: Implementar guardado de apariencia cuando esté la API
    } catch (error) {
      setError('Error guardando configuración de apariencia')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones</h1>
          <p className="text-muted-foreground">
            Cargando configuración...
          </p>
        </div>
      </div>
    )
  }

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Negocio
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información del Negocio */}
        <TabsContent value="business" className="space-y-6">
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
                    onChange={(e) => handleBusinessFormChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Teléfono</Label>
                  <Input 
                    id="business-phone" 
                    value={businessForm.phone}
                    onChange={(e) => handleBusinessFormChange('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-description">Descripción</Label>
                <Textarea 
                  id="business-description" 
                  placeholder="Describe tu negocio..."
                  value={businessForm.description}
                  onChange={(e) => handleBusinessFormChange('description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Dirección</Label>
                <Input 
                  id="business-address" 
                  value={businessForm.address}
                  onChange={(e) => handleBusinessFormChange('address', e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveBusinessInfo} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Información'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Información Personal */}
        <TabsContent value="user" className="space-y-6">
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
                    onChange={(e) => handleUserFormChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Apellido</Label>
                  <Input 
                    id="last-name" 
                    value={userForm.lastName}
                    onChange={(e) => handleUserFormChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={userForm.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
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
                  onChange={(e) => handleUserFormChange('username', e.target.value)}
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
        </TabsContent>

        {/* Tab: Horarios */}
        <TabsContent value="schedule" className="space-y-6">
          {brandData?.id && (
            <>
              <ScheduleConfig brandId={brandData.id} />
              <SpecialHours brandId={brandData.id} />
            </>
          )}
        </TabsContent>

        {/* Tab: Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
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
                <Switch 
                  checked={notificationSettings.newAppointments}
                  onCheckedChange={(checked) => handleNotificationChange('newAppointments', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de citas</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar recordatorios antes de las citas
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cancelaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando se cancelen citas
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.cancellations}
                  onCheckedChange={(checked) => handleNotificationChange('cancellations', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones en tu correo electrónico
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones en tu teléfono móvil
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Notificaciones'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
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
                <Switch 
                  checked={appearanceSettings.darkMode}
                  onCheckedChange={(checked) => handleAppearanceChange('darkMode', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Idioma</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={appearanceSettings.language}
                  onChange={(e) => handleAppearanceChange('language', e.target.value)}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAppearance} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Apariencia'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}