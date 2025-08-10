import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, CalendarDays, MapPin, FileText, CreditCard } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />

      <div className="relative container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center max-w-5xl mx-auto">
          <Badge variant="secondary" className="px-6 py-3 text-sm font-medium">
            <Star className="mr-2 h-4 w-4" />
            Tu App de Citas Personalizada en 10 Días
          </Badge>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              La App Perfecta para tu{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Servicio de Citas
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 md:text-2xl leading-relaxed">
              Fotógrafos, estilistas, médicos, consultores y más. Cualquier profesional que maneje citas puede tener su
              propia app personalizada. Gestiona reservas, ubicaciones, archivos y pagos en un solo lugar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/registro">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 h-auto"
              >
                Crear Mi App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto bg-transparent">
              Ver Demo en Vivo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-4xl">
            {[
              { icon: CalendarDays, label: "Gestión de Citas", color: "purple" },
              { icon: MapPin, label: "Ubicaciones", color: "pink" },
              { icon: FileText, label: "Archivos", color: "blue" },
              { icon: CreditCard, label: "Pagos", color: "green" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center space-y-3 group">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-${color}-100 group-hover:bg-${color}-200 transition-colors`}
                >
                  <Icon className={`h-8 w-8 text-${color}-600`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
