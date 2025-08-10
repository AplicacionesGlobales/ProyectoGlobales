import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    emoji: "📅",
    title: "Gestión de Citas Inteligente",
    description:
      "Sistema completo de reservas con calendario personalizable, tipos de citas configurables y recordatorios automáticos.",
  },
  {
    emoji: "📍",
    title: "Ubicaciones Precisas",
    description:
      "Permite a tus clientes marcar ubicaciones exactas en el mapa. Perfecto para fotógrafos, camarógrafos y servicios a domicilio.",
  },
  {
    emoji: "📁",
    title: "Gestión de Archivos",
    description:
      "Comparte y recibe archivos con tus clientes. Portfolios, contratos, resultados y más, todo organizado por cita.",
  },
  {
    emoji: "💳",
    title: "Pagos Integrados",
    description:
      "Acepta pagos directamente en la app. Adelantos, pagos completos y métodos locales. Los pagos se depositan automáticamente a tu cuenta todos los miércoles.",
  },
  {
    emoji: "🎨",
    title: "Tipos de Citas Personalizables",
    description:
      "Define diferentes tipos de servicios con duraciones, precios y requisitos específicos. Sesión fotográfica, consulta médica, corte de cabello, etc.",
  },
  {
    emoji: "📊",
    title: "Reportes y Analytics",
    description:
      "Conoce tus patrones de reservas, ingresos por período, clientes frecuentes y optimiza tu negocio con datos reales.",
  },
]

export function ServicesSection() {
  return (
    <section id="servicios" className="w-full py-20 md:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Todo lo que Necesitas para Gestionar Citas
          </h2>
          <p className="max-w-3xl text-xl text-gray-600 md:text-2xl">
            Funcionalidades profesionales diseñadas específicamente para servicios basados en citas
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
            >
              <CardHeader className="pb-4">
                <div className="text-5xl mb-4">{service.emoji}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
