import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            WhiteLabel
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#servicios" className="text-sm font-medium hover:text-purple-600 transition-colors">
            Servicios
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium hover:text-purple-600 transition-colors">
            Cómo Funciona
          </Link>
          <Link href="#precios" className="text-sm font-medium hover:text-purple-600 transition-colors">
            Precios
          </Link>
        </nav>

        <Link href="/registro">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Comenzar Ahora
          </Button>
        </Link>
      </div>
    </header>
  )
}
