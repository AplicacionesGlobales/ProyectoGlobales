"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Globe, Smartphone, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLandingData } from "@/hooks/use-landing-data"

// Feature mappings for plans
const getPlanFeatures = (planType: string) => {
  switch (planType) {
    case 'web':
      return [
        "Sitio web responsive",
        "Gestión básica de citas",
        "Dominio personalizado",
        "3.8% + $0.40 por transacción",
        "Soporte por email",
      ];
    case 'app':
      return [
        "App en App Store y Google Play",
        "Notificaciones push",
        "Funciones avanzadas de citas",
        "3.8% + $0.40 por transacción",
        "Soporte prioritario",
      ];
    case 'complete':
      return [
        "Todo lo anterior incluido",
        "Sincronización total",
        "Analytics avanzados",
        "3.8% + $0.40 por transacción",
        "Soporte 24/7",
      ];
    default:
      return [];
  }
};

export function PricingSection() {
  const { plans, loading, error } = useLandingData();

  if (loading) {
    return (
      <section id="precios" className="w-full py-20 md:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Planes que se Adaptan a Ti</h2>
            <p className="max-w-3xl text-xl text-gray-600 md:text-2xl">
              Elige la opción perfecta para tu servicio de citas. Sin sorpresas, sin costos ocultos.
            </p>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-lg text-gray-600">Cargando planes...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="precios" className="w-full py-20 md:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Planes que se Adaptan a Ti</h2>
            <p className="max-w-3xl text-xl text-red-600 md:text-2xl">
              Error al cargar los planes. Por favor intenta de nuevo.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const planConfigs = [
    {
      type: 'web',
      title: "Solo Web",
      icon: Globe,
      description: "Perfecto para empezar online",
      badge: "Sin Mensualidad",
      badgeColor: "bg-green-100 text-green-800",
      buttonVariant: "outline" as const,
    },
    {
      type: 'app',
      title: "Solo App Móvil",
      icon: Smartphone,
      description: "La experiencia móvil completa",
      badge: "Más Popular",
      badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      type: 'complete',
      title: "Web + App Completa",
      icon: [Globe, Smartphone],
      description: "La solución completa para tu negocio",
      buttonVariant: "outline" as const,
    }
  ];

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
          {planConfigs.map((planConfig) => {
            const plan = plans.find(p => p.type === planConfig.type);
            if (!plan) return null;

            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                  planConfig.popular ? "border-purple-500 shadow-lg scale-105" : "border-gray-200 hover:border-purple-200"
                }`}
              >
                {planConfig.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className={planConfig.badgeColor}>{planConfig.badge}</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="flex items-center justify-center mb-4">
                    {Array.isArray(planConfig.icon) ? (
                      <div className="flex space-x-2">
                        {planConfig.icon.map((Icon, index) => (
                          <Icon key={index} className="h-8 w-8 text-purple-600" />
                        ))}
                      </div>
                    ) : (
                      <planConfig.icon className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <div className="text-5xl font-bold">
                      ${plan.basePrice}
                      <span className="text-xl font-normal text-gray-600">/mes</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {getPlanFeatures(plan.type).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/registro" className="block">
                    <Button
                      className={`w-full ${
                        planConfig.buttonVariant === "default"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : ""
                      }`}
                      variant={planConfig.buttonVariant}
                      size="lg"
                    >
                      Comenzar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  )
}
