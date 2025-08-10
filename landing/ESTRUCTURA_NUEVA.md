# Landing Page - Nueva Estructura

Esta landing page ha sido reestructurada para ofrecer una mejor experiencia de usuario con rutas separadas y componentes organizados.

## Estructura de Rutas

### Página Principal (`/`)
- Vista principal con toda la información del servicio
- Header con navegación y botones de acceso
- Secciones: Hero, Services, How it Works, Pricing, CTA, Footer

### Autenticación (`/auth`)
- `/auth` - Vista combinada con tabs para login y registro
- `/auth/login` - Vista dedicada para iniciar sesión
- `/auth/register` - Vista dedicada para registrarse

### Onboarding (`/onboarding`)
- Flujo paso a paso para crear y configurar la aplicación
- Formulario multi-paso con:
  1. Información Personal
  2. Tipo de Negocio
  3. Selección de Funciones
  4. Personalización (colores, logo)
  5. Selección de Plan
  6. Confirmación
  7. Proceso de Pago

### Registro Anterior (`/registro`)
- Mantiene el registro original por compatibilidad
- Se recomienda usar `/onboarding` para nuevas implementaciones

## Componentes

### Autenticación (`components/auth/`)
- `login-form.tsx` - Formulario de inicio de sesión
- `register-form.tsx` - Formulario de registro básico
- `auth-tabs.tsx` - Componente con tabs que combina ambos formularios

### Onboarding (`components/onboarding/`)
- `onboarding-flow.tsx` - Componente principal del flujo
- `steps/` - Directorio con componentes individuales para cada paso

## Navegación Actualizada

### Header
- **Iniciar Sesión**: Lleva a `/auth/login`
- **Comenzar Ahora**: Lleva a `/onboarding`

### CTA Section  
- **Crear Mi App Ahora**: Lleva a `/onboarding`
- **Ya Tengo Cuenta**: Lleva a `/auth/login`

## Ventajas de la Nueva Estructura

1. **Separación de Responsabilidades**: Cada vista tiene un propósito específico
2. **Mejor UX**: Los usuarios pueden acceder directamente a login o registro
3. **Flujo Claro**: El onboarding guía paso a paso la configuración
4. **Modularidad**: Componentes reutilizables y mantenibles
5. **SEO Friendly**: URLs claras y descriptivas

## Flujo de Usuario Recomendado

1. **Usuario Nuevo**: `/` → `/onboarding` → Configuración completa
2. **Usuario Existente**: `/` → `/auth/login` → Dashboard
3. **Registro Rápido**: `/` → `/auth/register` → `/onboarding`

## Próximos Pasos

1. Completar los componentes de pasos individuales del onboarding
2. Implementar la lógica de backend para autenticación
3. Agregar validaciones y manejo de errores
4. Integrar con el sistema de pagos
5. Agregar tests unitarios
