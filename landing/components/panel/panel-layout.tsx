// landing\components\panel\panel-layout.tsx
"use client"

import { useState } from "react"
import { Sidebar, MobileSidebarTrigger } from "@/components/panel/sidebar"
import { UserMenu } from "@/components/panel/user-menu"

interface PanelLayoutProps {
  children: React.ReactNode
}

export function PanelLayout({ children }: PanelLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar para escritorio - fixed */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar />
      </div>
      
      {/* Sidebar para móvil */}
      <Sidebar
        isMobile
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Contenido principal - con margen para el sidebar */}
      <div className="flex-1 lg:ml-64">
        {/* Header - sticky */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <MobileSidebarTrigger onOpen={() => setIsMobileSidebarOpen(true)} />
              <h1 className="text-lg font-semibold lg:hidden">Panel</h1>
            </div>
            
            {/* Menu de usuario */}
            <UserMenu />
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="p-4 sm:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}