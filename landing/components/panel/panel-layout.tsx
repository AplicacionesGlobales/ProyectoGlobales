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
    <div className="min-h-screen bg-background">
      {/* Sidebar para escritorio */}
      <Sidebar />
      
      {/* Sidebar para móvil */}
      <Sidebar
        isMobile
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
