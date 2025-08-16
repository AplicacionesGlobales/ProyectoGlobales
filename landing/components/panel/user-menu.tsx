// landing\components\panel\user-menu.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, ChevronDown } from "lucide-react"

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
}

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [brandData, setBrandData] = useState<BrandData | null>(null)

  useEffect(() => {
    // Obtener datos del usuario y marca del localStorage
    const userDataStr = localStorage.getItem('user_data')
    const brandDataStr = localStorage.getItem('brand_data')

    if (userDataStr) {
      try {
        setUserData(JSON.parse(userDataStr))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    if (brandDataStr) {
      try {
        setBrandData(JSON.parse(brandDataStr))
      } catch (error) {
        console.error('Error parsing brand data:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('brand_data')
    
    // Redirigir al login
    router.push('/auth/login')
  }

  if (!userData) {
    return null
  }

  const userInitials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
  const fullName = `${userData.firstName} ${userData.lastName}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-10 w-auto px-2 ${className}`}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback className="text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex sm:flex-col sm:items-start sm:text-left">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              <p className="text-xs text-muted-foreground">
                {brandData?.name || userData.email}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
            {brandData && (
              <p className="text-xs leading-none text-muted-foreground">
                {brandData.name}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground capitalize">
              Rol: {userData.role.toLowerCase()}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
