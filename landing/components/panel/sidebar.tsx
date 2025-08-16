// landing\components\panel\sidebar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Zap, 
  Settings,
  Menu,
  X
} from "lucide-react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/panel/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Calendario",
    href: "/panel/calendario",
    icon: Calendar
  },
  {
    title: "Clientes",
    href: "/panel/clientes", 
    icon: Users
  },
  {
    title: "Funciones",
    href: "/panel/funciones",
    icon: Zap
  },
  {
    title: "Configuraciones",
    href: "/panel/configuraciones",
    icon: Settings
  }
]

interface SidebarProps {
  className?: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ className, isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  if (isMobile) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent pathname={pathname} onItemClick={onClose} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("hidden lg:block w-64 border-r bg-gray-50/40", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Panel de Control</h2>
      </div>
      <SidebarContent pathname={pathname} />
    </div>
  )
}

function SidebarContent({ pathname, onItemClick }: { pathname: string, onItemClick?: () => void }) {
  return (
    <ScrollArea className="h-[calc(100vh-80px)] p-4">
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </ScrollArea>
  )
}

interface MobileSidebarTriggerProps {
  onOpen: () => void
}

export function MobileSidebarTrigger({ onOpen }: MobileSidebarTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="lg:hidden"
      onClick={onOpen}
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
}
