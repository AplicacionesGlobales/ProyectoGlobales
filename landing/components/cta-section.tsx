import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center text-white max-w-4xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              ¿Listo para Digitalizar tu Servicio de Citas?
            </h2>
            <p className="text-xl text-purple-100 md:text-2xl leading-relaxed">
              Únete a cientos de profesionales que ya transformaron su gestión de citas con WhiteLabel. 
              Tu app estará lista en solo 10 días.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/onboarding">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto">
                Crear Mi App Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent text-lg px-8 py-4 h-auto"
              >
                Ya Tengo Cuenta
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-3xl">
            {[
              { icon: Clock, text: "Entrega en 10 días" },
              { icon: CheckCircle, text: "Sin costos ocultos" },
              { icon: Star, text: "Soporte incluido" }
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center space-x-3">
                <Icon className="h-6 w-6" />
                <span className="text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
