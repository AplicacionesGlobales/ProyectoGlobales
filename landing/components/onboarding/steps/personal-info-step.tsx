"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Eye, EyeOff } from "lucide-react"

interface PersonalInfoStepProps {
  data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    businessName: string
    description: string
    password: string
    confirmPassword: string
  }
  onChange: (data: any) => void
  onNext: () => void
}

export function PersonalInfoStep({ data, onChange, onNext }: PersonalInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({
      ...data,
      [field]: e.target.value
    })
  }

  const passwordsMatch = data.password === data.confirmPassword
  const isStrongPassword = data.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)
  const isValid = data.firstName && data.lastName && data.email && data.businessName && data.password && passwordsMatch && isStrongPassword

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Cuéntanos sobre ti</h2>
        <p className="mt-2 text-gray-600">
          Esta información nos ayudará a personalizar tu experiencia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={handleChange("firstName")}
            placeholder="Juan"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={handleChange("lastName")}
            placeholder="Pérez"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Correo Electrónico *</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={handleChange("email")}
          placeholder="tu@ejemplo.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={handleChange("phone")}
          placeholder="+1 234 567 8900"
        />
      </div>

      <div>
        <Label htmlFor="businessName">Nombre de tu Negocio *</Label>
        <Input
          id="businessName"
          value={data.businessName}
          onChange={handleChange("businessName")}
          placeholder="Mi Empresa"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción de tu Servicio</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={handleChange("description")}
          placeholder="Describe brevemente qué servicios ofreces..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="password">Contraseña *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={handleChange("password")}
              placeholder="Crea una contraseña segura"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {data.password && !isStrongPassword && (
            <p className="text-sm text-red-600 mt-1">
              La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={data.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Repite tu contraseña"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {data.confirmPassword && !passwordsMatch && (
            <p className="text-sm text-red-600 mt-1">
              Las contraseñas no coinciden
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid} className="flex items-center gap-2">
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
