# 📅 Agenda Pro - App Universal de Gestión de Citas

Una aplicación completa de gestión de citas que permite a cualquier profesional administrar su negocio y a clientes reservar servicios de forma sencilla.

## 🌟 Características Principales

### 👨‍💼 Para Administradores
- **Dashboard Completo**: Vista general de citas, estadísticas y métricas
- **Gestión de Servicios**: Crear, editar y administrar servicios con precios y duraciones
- **Gestión de Citas**: Confirmar, cancelar y completar citas de clientes
- **Personalización Visual**: Sistema completo de temas customizables sin conocimientos técnicos
- **Múltiples Modalidades**: Servicios presenciales, online y a domicilio

### 👤 Para Clientes
- **Exploración de Servicios**: Navegación por categorías y búsqueda de servicios
- **Reserva Fácil**: Proceso de reserva intuitivo con selección de fecha, hora y modalidad
- **Gestión Personal**: Vista de citas reservadas y su estado
- **Múltiples Opciones**: Servicios en local, a domicilio u online

## 🎨 Sistema de Personalización

El administrador puede customizar completamente la apariencia de la app:

### Temas Predefinidos
- **Azul Profesional**: Esquema clásico para negocios corporativos
- **Verde Naturaleza**: Perfecto para spas, bienestar y terapias
- **Rosa Elegante**: Ideal para salones de belleza y estética
- **Morado Creativo**: Para fotógrafos, diseñadores y creativos

### Personalización Avanzada
- 10 colores configurables independientemente
- Vista previa en tiempo real
- Validación automática de colores
- Opción de restaurar valores por defecto

## 🏢 Casos de Uso

### Servicios de Belleza
- Peluquerías y salones de belleza
- Spas y centros de bienestar
- Manicure y pedicure
- Tratamientos faciales

### Profesionales de la Salud
- Psicólogos y terapeutas
- Nutricionistas
- Fisioterapeutas
- Médicos de consulta privada

### Servicios Creativos
- Fotógrafos profesionales
- Diseñadores
- Instructores de música
- Entrenadores personales

### Servicios Técnicos
- Reparaciones a domicilio
- Consultoría IT
- Clases particulares
- Servicios de limpieza

## 🚀 Funcionalidades Simuladas

### Sistema de Autenticación
- **Administrador**: `admin@test.com` / `admin123`
- **Cliente**: `client@test.com` / `client123`

### Datos de Demostración
- 3 servicios precargados con diferentes modalidades
- Citas de ejemplo con diferentes estados
- Clientes de muestra para testing

### Gestión de Estados
- **Pendiente**: Cita recién creada
- **Confirmada**: Cita aprobada por el administrador
- **Completada**: Servicio realizado
- **Cancelada**: Cita cancelada por cualquier motivo

## 💰 Modelo de Monetización

### Plan Freemium
- **Gratuito**: Hasta 50 citas por mes
- **Pro ($29/mes)**: Citas ilimitadas, reportes avanzados
- **Premium ($59/mes)**: Múltiples ubicaciones, equipo de trabajo

### Comisiones
- **2.9%** por transacción en pagos procesados
- **0%** de comisión en el plan gratuito (pagos externos)

### Servicios Adicionales
- **Premium Listing ($10/mes)**: Destacar en búsquedas locales
- **Integración WhatsApp ($15/mes)**: Notificaciones automáticas
- **Multi-idioma ($20/mes)**: Soporte para múltiples idiomas

## 🛠️ Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Herramientas de desarrollo
- **TypeScript**: Tipado estático
- **Context API**: Gestión de estado global
- **Tailwind CSS**: Estilos con NativeWind
- **React Navigation**: Navegación entre pantallas

## 📱 Instalación y Uso

### Prerrequisitos
```bash
node >= 18.0.0
npm o yarn
expo-cli
```

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/ALVARADOUMANA/frontend.git

# Instalar dependencias
cd frontend
npm install

# Iniciar la aplicación
npm start
```

### Cuentas de Demostración

**Administrador**
- Email: `admin@test.com`
- Contraseña: `admin123`
- Acceso a: Dashboard, gestión de servicios, personalización, gestión de citas

**Cliente**
- Email: `client@test.com`
- Contraseña: `client123`
- Acceso a: Exploración de servicios, reserva de citas, gestión personal

## 🎯 Estructura del Proyecto

```
src/
├── contexts/
│   ├── AppContext.tsx      # Estado global de la aplicación
│   └── ThemeContext.tsx    # Sistema de temas customizables
├── app/
│   ├── (auth)/             # Pantallas de autenticación
│   ├── (client-tabs)/      # Pantallas principales para clientes
│   └── (admin-tabs)/       # Pantallas exclusivas para administradores
└── components/             # Componentes reutilizables
```

## 🔮 Próximas Funcionalidades

### Versión 2.0
- [ ] Notificaciones push
- [ ] Integración con calendarios nativos
- [ ] Pagos integrados (Stripe/PayPal)
- [ ] Sistema de reseñas y calificaciones

### Versión 3.0
- [ ] App para profesionales (iOS/Android)
- [ ] Geolocalización para servicios a domicilio
- [ ] Reportes y analytics avanzados
- [ ] Sistema de fidelización de clientes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios importantes, por favor abre un issue primero para discutir qué te gustaría cambiar.

## 📞 Soporte

Para soporte técnico o consultas comerciales:
- Email: soporte@agenda-pro.com
- Website: www.agenda-pro.com
- Documentación: docs.agenda-pro.com

---

**Agenda Pro** - Transforma tu negocio en una experiencia digital profesional 🚀
 