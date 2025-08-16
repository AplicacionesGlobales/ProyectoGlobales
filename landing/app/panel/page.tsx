"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PanelPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al dashboard
    router.replace('/panel/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
