import { Zap } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-12 bg-gray-900 text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-purple-600 to-pink-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">WhiteLabel</span>
          </div>

          <div className="flex space-x-6 text-sm">
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Términos
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Soporte
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          © 2024 WhiteLabel. Todos los derechos reservados. Transformando servicios de citas en apps exitosas.
        </div>
      </div>
    </footer>
  )
}
