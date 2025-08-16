"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { authService } from "@/services/auth.service"
import Link from "next/link"

interface LoginFormProps {
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Login attempt:", { email, rememberMe })
      
      const result = await authService.login(email, password, rememberMe)
      
      if (result.success && result.data) {
        // Login exitoso
        setSuccess("¡Login exitoso! Redirigiendo...")
        
        // Guardar los datos del usuario
        localStorage.setItem('auth_token', result.data.token)
        localStorage.setItem('user_data', JSON.stringify(result.data.user))
        localStorage.setItem('brand_data', JSON.stringify(result.data.brand))
        
        if (rememberMe && result.data.refreshToken) {
          localStorage.setItem('refresh_token', result.data.refreshToken)
        }
        
        // Verificar si el pago está pendiente
        const brandPlan = result.data.plan
        const isPaymentPending = brandPlan && brandPlan.price > 0 && (!result.data.payment || result.data.payment.status !== 'completed')
        
        if (isPaymentPending) {
          // Redirigir a una página de pago pendiente
          setTimeout(() => {
            router.push('/payment/pending')
          }, 2000)
        } else {
          // Redirigir al dashboard o aplicación principal
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } else {
        // Login fallido
        const errorMsg = result.errors?.[0]?.description || 'Credenciales inválidas'
        setError(errorMsg)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError("Error de conexión. Verifica tu conexión e inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Recordarme
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <Separator />

        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          {onSwitchToRegister ? (
            <Button
              variant="link"
              className="p-0 text-primary"
              onClick={onSwitchToRegister}
            >
              Regístrate aquí
            </Button>
          ) : (
            <Link href="/onboarding" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
