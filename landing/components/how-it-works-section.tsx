const steps = [
  {
    number: 1,
    title: "Regístrate",
    description: "Crea tu cuenta y cuéntanos sobre tu servicio de citas. Solo toma 2 minutos.",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    number: 2,
    title: "Configura",
    description: "Define tus tipos de citas, horarios, colores y sube tu logo. Todo personalizado para tu marca.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: 3,
    title: "Elige tu Plan",
    description: "Selecciona si quieres solo web, solo app móvil, o ambas. Precios transparentes según tus funciones.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    number: 4,
    title: "¡Listo!",
    description: "En 10 días tu app estará en App Store y Google Play. Te notificamos todo el proceso.",
    gradient: "from-orange-500 to-red-500",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="w-full py-20 md:py-32 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Tu App en 4 Pasos Simples</h2>
          <p className="max-w-3xl text-xl text-gray-600 md:text-2xl">
            Un proceso súper fácil para tener tu app de citas profesional lista en días
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center space-y-6 group">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r ${step.gradient} text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {step.number}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
