// hooks/useConfiguraciones.ts
import { useState, useEffect } from "react"
import { brandService } from "@/services/brand.service"
import { 
  UserData, 
  BrandData, 
  BusinessForm, 
  UserForm, 
  NotificationSettings, 
  AppearanceSettings 
} from "@/types/config"
import { 
  DEFAULT_NOTIFICATION_SETTINGS, 
  DEFAULT_APPEARANCE_SETTINGS 
} from "@/constants/config"

export const useConfiguraciones = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [brandData, setBrandData] = useState<BrandData | null>(null)

  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: ''
  })

  const [userForm, setUserForm] = useState<UserForm>({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(DEFAULT_APPEARANCE_SETTINGS)

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
            email: userData?.email || '',
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

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleBusinessFormChange = (field: keyof BusinessForm, value: string) => {
    setBusinessForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUserFormChange = (field: keyof UserForm, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAppearanceChange = (field: keyof AppearanceSettings, value: any) => {
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

  return {
    // Estado
    loading,
    saving,
    error,
    success,
    userData,
    brandData,
    businessForm,
    userForm,
    notificationSettings,
    appearanceSettings,
    
    // Métodos
    clearMessages,
    handleBusinessFormChange,
    handleUserFormChange,
    handleNotificationChange,
    handleAppearanceChange,
    handleSaveBusinessInfo,
    handleSaveNotifications,
    handleSaveAppearance
  }
}