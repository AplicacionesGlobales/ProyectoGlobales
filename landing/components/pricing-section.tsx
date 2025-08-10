import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Globe, Smartphone } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    id: "web",
    title: "Solo Web",
    icon: Globe,
    price: "0",
    period: "/mes",
    description: "Perfecto para empezar online",
    badge: "Sin Mensualidad",
    badgeColor: "bg-green-100 text-green-800",
    features: [
      "Sitio web responsive",
      "Gestión básica de citas",
      "Dominio personalizado",
      "5% por transacción",
      "Soporte por email",
    ],
    buttonVariant: "outline" as const,
    buttonText: "Comenzar",
  },
  {
    id: "app",
    title: "Solo App Móvil",
    icon: Smartphone,
    price: "59",
    period: "/mes",
    description: "La experiencia móvil completa",
    badge: "Más Popular",
    badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    features: [
      "App en App Store y Google Play",
      "Notificaciones push",
      "Funciones avanzadas de citas",
      "3% por transacción + $0.30",
      "Soporte prioritario",
    ],
    buttonVariant: "default" as const,
    buttonText: "Comenzar",
    popular: true,
  },
  {
    id: "complete",
    title: "Web + App Completa",
    icon: [Globe, Smartphone],
    price: "60",
    period: "/mes",
    description: "La solución completa para tu negocio",
    features: [
      "Todo lo anterior incluido",
      "Sincronización total",
      "Analytics avanzados",
      "3% por transacción + $0.30",
      "Soporte 24/7",
    ],
    buttonVariant: "outline" as const,
    buttonText: "Comenzar",
  },
]

export function PricingSection() {
  return (
    <section id="precios" className="w-full py-20 md:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Planes que se Adaptan a Ti</h2>
          <p className="max-w-3xl text-xl text-gray-600 md:text-2xl">
            Elige la opción perfecta para tu servicio de citas. Sin sorpresas, sin costos ocultos.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "border-purple-500 shadow-lg scale-105" : "border-gray-200 hover:border-purple-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex items-center justify-center mb-4">
                  {Array.isArray(plan.icon) ? (
                    <div className="flex space-x-2">
                      {plan.icon.map((Icon, index) => (
                        <Icon key={index} className="h-8 w-8 text-purple-600" />
                      ))}
                    </div>
                  ) : (
                    <plan.icon className="h-8 w-8 text-purple-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="pt-4">
                  <div className="text-5xl font-bold">
                    ${plan.price}
                    <span className="text-xl font-normal text-gray-600">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/registro" className="block">
                  <Button
                    className={`w-full ${
                      plan.buttonVariant === "default"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : ""
                    }`}
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
