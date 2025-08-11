# API de Registro Completo - Documentación para Backend

## Endpoint de Registro de Marca

**URL:** `POST /auth/register/brand`

**Descripción:** Registra un nuevo usuario ROOT con una marca completa, incluyendo toda la información del flujo de onboarding.

## Formatos de Datos

### 1. Registro con Solo JSON (sin archivos)
Cuando no hay archivos de imágenes, se envía como `application/json`:

```json
{
  // Información de autenticación del usuario
  "email": "usuario@ejemplo.com",
  "username": "usuario_abc123",  // Formato: emailPrefix_randomString6chars
  "password": "ContraseñaSegura123",
  "firstName": "Juan",
  "lastName": "Pérez",

  // Información de la marca
  "brandName": "Mi Empresa",
  "brandDescription": "Descripción del servicio",
  "brandPhone": "+506 8888-8888",

  // Detalles del negocio
  "businessType": "fotografo",  // ID del tipo de negocio seleccionado
  "selectedFeatures": [
    "citas",
    "ubicaciones", 
    "archivos",
    "pagos"
  ],

  // Personalización - Paleta de colores
  "colorPalette": {
    "primary": "#1a73e8",
    "secondary": "#34a853",
    "accent": "#fbbc04", 
    "neutral": "#9aa0a6",
    "success": "#137333"
  },
  "customColors": [
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981", 
    "#3B82F6"
  ],

  // Plan seleccionado y precios
  "plan": {
    "type": "web",  // "web" | "app" | "complete"
    "price": 0,     // Precio mensual
    "features": [
      "Citas ilimitadas",
      "Soporte básico",
      "Almacenamiento básico"
    ],
    "billingPeriod": "monthly"  // "monthly" | "annual"
  },

  // Metadatos
  "registrationDate": "2025-08-10T21:30:00.000Z",
  "source": "landing_onboarding"
}
```

### 2. Registro con FormData (con archivos de imágenes)
Cuando hay archivos, se envía como `multipart/form-data`:

**Campos de texto (todos como strings):**
- `email`: string
- `username`: string  
- `password`: string
- `firstName`: string
- `lastName`: string
- `brandName`: string
- `brandDescription`: string (opcional)
- `brandPhone`: string (opcional)
- `businessType`: string (opcional)
- `registrationDate`: string (opcional)
- `source`: string (opcional)

**Campos JSON (stringificados):**
- `selectedFeatures`: string (JSON array)
- `colorPalette`: string (JSON object)
- `customColors`: string (JSON array)
- `plan`: string (JSON object)

**Archivos (File objects):**
- `logoFile`: File (opcional) - Logo principal
- `isotopoFile`: File (opcional) - Isotipo/símbolo
- `imagotipoFile`: File (opcional) - Imagotipo completo

## Tipos de Negocio Disponibles

```typescript
const businessTypes = [
  { id: "fotografo", name: "Fotógrafo", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "camarografo", name: "Camarógrafo", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "medico", name: "Médico/Dentista", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "abogado", name: "Abogado", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "psicologo", name: "Psicólogo", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "contador", name: "Contador", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "veterinario", name: "Veterinario", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "nutricionista", name: "Nutricionista", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "fisioterapeuta", name: "Fisioterapeuta", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "esteticista", name: "Esteticista", services: ["citas", "archivos", "pagos", "productos"] },
  { id: "barberia", name: "Barbería/Salón", services: ["citas", "productos", "pagos"] },
  { id: "mecanico", name: "Mecánico", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "plomero", name: "Plomero", services: ["citas", "ubicaciones", "pagos"] },
  { id: "electricista", name: "Electricista", services: ["citas", "ubicaciones", "pagos"] },
  { id: "jardinero", name: "Jardinero", services: ["citas", "ubicaciones", "pagos"] },
  { id: "limpieza", name: "Servicio de Limpieza", services: ["citas", "ubicaciones", "pagos"] },
  { id: "construccion", name: "Construcción", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "pintor", name: "Pintor", services: ["citas", "ubicaciones", "pagos"] },
  { id: "carpintero", name: "Carpintero", services: ["citas", "ubicaciones", "archivos", "pagos"] },
  { id: "chef", name: "Chef/Catering", services: ["citas", "ubicaciones", "pagos", "productos"] },
  { id: "entrenador", name: "Entrenador Personal", services: ["citas", "ubicaciones", "pagos", "reportes"] },
  { id: "masajista", name: "Masajista", services: ["citas", "ubicaciones", "pagos"] },
  { id: "tutor", name: "Tutor/Profesor", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "consultor", name: "Consultor", services: ["citas", "archivos", "pagos", "reportes"] },
  { id: "otro", name: "Otro", services: ["citas"] }
];
```

## Funciones/Features Disponibles

```typescript
const appFeatures = [
  {
    id: "citas",
    name: "Sistema de Citas",
    description: "Sistema completo de reservas con tipos de citas personalizables",
    price: 20
  },
  {
    id: "ubicaciones", 
    name: "Ubicaciones en Mapa",
    description: "Permite a clientes marcar ubicaciones exactas en el mapa para servicios a domicilio",
    price: 15
  },
  {
    id: "archivos",
    name: "Gestión de Archivos", 
    description: "Comparte portfolios, contratos, resultados y documentos organizados por cita",
    price: 18
  },
  {
    id: "pagos",
    name: "Pagos Integrados",
    description: "Acepta pagos directamente en la app",
    price: 25
  },
  {
    id: "tipos-citas",
    name: "Tipos de Citas Personalizables",
    description: "Define diferentes tipos de servicios con precios y duraciones específicas",
    price: 12
  },
  {
    id: "reportes",
    name: "Reportes y Análisis",
    description: "Genera reportes detallados de ingresos, citas y rendimiento del negocio",
    price: 15
  },
  {
    id: "productos",
    name: "Catálogo de Productos",
    description: "Vende productos adicionales desde tu app",
    price: 22
  }
];
```

## Tipos de Plan

```typescript
const planTypes = {
  web: {
    name: "Plan Web",
    description: "Solo aplicación web",
    basePrice: 0,  // Sin mensualidad, solo comisiones
    commission: 0.05  // 5% por transacción
  },
  app: {
    name: "Plan App Móvil", 
    description: "Solo aplicación móvil",
    calculatePrice: (features) => 50 + (features.length * 15)  // Base + características
  },
  complete: {
    name: "Plan Completo",
    description: "Web + App móvil", 
    calculatePrice: (features) => 80 + (features.length * 20)  // Base + características
  }
};
```

## Paletas de Colores Predefinidas

```typescript
const colorPalettes = {
  modern: {
    primary: "#1a73e8",
    secondary: "#34a853",
    accent: "#fbbc04",
    neutral: "#9aa0a6", 
    success: "#137333"
  },
  warm: {
    primary: "#f57c00",
    secondary: "#ff7043",
    accent: "#ffc107",
    neutral: "#8d6e63",
    success: "#689f38"
  },
  cool: {
    primary: "#00acc1",
    secondary: "#26a69a", 
    accent: "#42a5f5",
    neutral: "#78909c",
    success: "#66bb6a"
  }
};
```

## Respuesta del Backend

La API debe devolver:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "usuario@ejemplo.com",
      "username": "usuario_abc123",
      "firstName": "Juan",
      "lastName": "Pérez", 
      "role": "ROOT"
    },
    "brand": {
      "id": 456,
      "name": "Mi Empresa",
      "description": "Descripción del servicio",
      "phone": "+506 8888-8888",
      "businessType": "fotografo",
      "features": ["citas", "ubicaciones", "archivos", "pagos"],
      "logoUrl": "https://storage.com/logos/456.jpg",  // Si se subió archivo
      "isotopoUrl": "https://storage.com/logos/456_isotopo.jpg",
      "imagotipoUrl": "https://storage.com/logos/456_imagotipo.jpg"
    },
    "colorPalette": {
      "id": 789,
      "primary": "#1a73e8",
      "secondary": "#34a853",
      "accent": "#fbbc04",
      "neutral": "#9aa0a6",
      "success": "#137333",
      "customColors": ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"]
    },
    "plan": {
      "id": 321,
      "type": "web",
      "price": 0,
      "features": ["Citas ilimitadas", "Soporte básico"],
      "billingPeriod": "monthly"
    },
    "token": "jwt.token.here"
  }
}
```

## Manejo de Errores

En caso de error:

```json
{
  "success": false,
  "errors": [
    {
      "code": 400,
      "description": "El email ya está registrado"
    }
  ]
}
```

## Consideraciones de Implementación

1. **Validación de Email y Username:** Verificar que el email no esté registrado y el username sea único.

2. **Hash de Contraseña:** La contraseña debe ser hasheada antes de guardarla.

3. **Manejo de Archivos:** Los archivos deben ser validados (tipo, tamaño) y almacenados en un storage (local o cloud).

4. **Estructura de Base de Datos:** Se necesitan tablas para:
   - Users (información del usuario)
   - Brands (información de la marca) 
   - ColorPalettes (paletas de colores)
   - Plans (planes contratados)
   - Features (características habilitadas por marca)

5. **Transacciones:** Todo el proceso debe ser transaccional para mantener consistencia.

6. **JWT Token:** Generar token de autenticación para el usuario creado.

7. **Webhooks/Notificaciones:** Considerar enviar notificaciones cuando se complete el registro.
