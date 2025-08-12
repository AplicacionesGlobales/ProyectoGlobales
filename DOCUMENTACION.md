# 📋 Documentación Técnica - Proyecto Globales

## 🎯 Visión General del Proyecto

**Proyecto Globales** es una plataforma de gestión empresarial white-label para crear aplicaciones personalizadas de citas y gestión para diversos negocios. Permite a emprendedores crear marcas digitales con funcionalidades específicas según su tipo de negocio.

### 🏗️ Arquitectura del Sistema

El sistema se compone de:

1. **Backend API (NestJS)** - Puerto 3000
2. **App Mobile (React Native/Expo)** - Cliente móvil

---

## 🛠️ Backend API (NestJS)

### 📂 Estructura del Proyecto

```
backend/
├── .env                    # Variables de entorno
├── .env.example           # Plantilla de variables de entorno
├── eslint.config.mjs      # Configuración ESLint
├── nest-cli.json          # Configuración del CLI de NestJS
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración TypeScript
├── tsconfig.build.json    # Configuración TypeScript para build
├── generated/             # Archivos generados por Prisma
│   └── prisma/           # Cliente Prisma generado
├── prisma/               # Configuración de base de datos
│   ├── schema.prisma     # Esquema de la base de datos
│   └── migrations/       # Migraciones de la base de datos
├── src/                  # Código fuente principal
│   ├── main.ts           # Punto de entrada
│   ├── app.module.ts     # Módulo raíz
│   ├── auth/             # Módulo de autenticación
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── brand-registration.controller.ts
│   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── register-client.dto.ts
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── password-reset.dto.ts
│   │   │   ├── create-brand.dto.ts
│   │   │   └── index.ts
│   │   ├── interfaces/   # Interfaces TypeScript
│   │   └── services/     # Servicios específicos
│   │       ├── brand-creation.service.ts
│   │       ├── brand-registration.service.ts
│   │       ├── color-palette.service.ts
│   │       └── user-creation.service.ts
│   ├── common/           # Utilidades compartidas
│   │   ├── constants/    # Constantes
│   │   │   └── swagger.constants.ts
│   │   ├── decorators/   # Decoradores personalizados
│   │   │   ├── public-auth.decorator.ts
│   │   │   ├── swagger.decorators.ts
│   │   │   └── index.ts
│   │   ├── dto/          # DTOs compartidos
│   │   ├── services/     # Servicios compartidos
│   │   └── templates/    # Plantillas (emails, etc.)
│   ├── health/           # Health checks
│   │   ├── health.module.ts
│   │   ├── health.controller.ts
│   │   └── health.service.ts
│   ├── landing-data/     # Datos para landing page
│   │   ├── landing-data.module.ts
│   │   ├── landing-data.controller.ts
│   │   ├── landing-data.service.ts
│   │   ├── landing-data.service-new.ts
│   │   └── types.ts
│   ├── payment/          # Sistema de pagos
│   │   ├── payment.module.ts
│   │   ├── payment.controller.ts
│   │   ├── dto/
│   │   └── payment-tilopay/  # Integración con Tilopay
│   ├── validate/         # Validaciones
│   │   ├── validate.module.ts
│   │   ├── validate.controller.ts
│   │   ├── validate.service.ts
│   │   └── dto/
│   ├── prisma/          # Cliente Prisma
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── seed.ts
│   ├── scripts/         # Scripts de utilidad
│   │   ├── seed-business-types.ts
│   │   ├── seed-features.ts
│   │   └── seed-landing-data.ts
│   └── lib/             # Librerías auxiliares
│       └── crypto.ts    # Utilidades criptográficas
├── test/                # Tests end-to-end
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
└── uploads/             # Archivos subidos
    └── brands/
        └── logos/       # Logos de marcas
```

### 🎨 Estándares y Convenciones de Código

#### 📝 Convenciones de Nomenclatura
- **Archivos**: `kebab-case` (ej: `auth-service.ts`)
- **Classes**: `PascalCase` (ej: `AuthService`)
- **Variables/Métodos**: `camelCase` (ej: `registerUser`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `ERROR_CODES`)
- **Interfaces**: `PascalCase` con prefijo `I` opcional (ej: `IUser`)

#### 🏗️ Estructura de Módulos
Cada módulo sigue el patrón de NestJS:

```typescript
module-name/
├── module-name.module.ts      # Configuración del módulo
├── module-name.controller.ts  # Controlador HTTP
├── module-name.service.ts     # Lógica de negocio
├── dto/                       # Data Transfer Objects
│   ├── create-item.dto.ts
│   ├── update-item.dto.ts
│   └── index.ts
├── interfaces/               # Interfaces TypeScript
└── services/                 # Servicios auxiliares
```

#### 🔧 Estándares de DTOs
DTOs con validaciones usando `class-validator`:

```typescript
export class RegisterClientDto {
  @ApiEmail()
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiUsername()
  @IsString({ message: 'Username debe ser texto' })
  @IsNotEmpty({ message: 'Username es requerido' })
  username: string;

  @ApiPassword()
  @IsString({ message: 'Contraseña debe ser texto' })
  @MinLength(6, { message: 'Contraseña debe tener al menos 6 caracteres' })
  password: string;
}
```

#### 🎯 Decoradores Personalizados
Decoradores para Swagger:

```typescript
export const ApiEmail = () => 
  ApiProperty({ example: SWAGGER_EXAMPLES.EMAIL });

export const ApiUsername = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.USERNAME });

export const ApiPassword = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.PASSWORD });
```

#### 🚦 Manejo de Errores
Sistema centralizado de errores:

```typescript
export const ERROR_MESSAGES = {
  USERNAME_EXISTS: 'El username ya está en uso',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  USER_NOT_FOUND: 'Usuario no encontrado',
} as const;

export const ERROR_CODES = {
  USERNAME_EXISTS: 1001,
  EMAIL_ALREADY_EXISTS: 1004,
  USER_NOT_FOUND: 2000,
} as const;
```

### 🗄️ Base de Datos (PostgreSQL + Prisma)

#### 📊 Modelo de Datos
```prisma
model User {
  id                 Int                 @id @default(autoincrement())
  email              String              @unique
  username           String              @unique
  firstName          String?
  lastName           String?
  role               UserRole            @default(CLIENT)
  isActive           Boolean             @default(true)
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  brands             Brand[]
  passwordResetCodes PasswordResetCode[]
  userBrands         UserBrand[]
}

model Brand {
  id               Int            @id @default(autoincrement())
  name             String
  description      String?
  address          String?
  phone            String?
  isActive         Boolean        @default(true)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  ownerId          Int
  businessType     String?
  selectedFeatures String[]
  imagotipoUrl     String?
  isotopoUrl       String?
  logoUrl          String?
  owner            User           @relation(fields: [ownerId], references: [id])
  colorPalette     ColorPalette?
}
```

#### 🎨 Enums
```prisma
enum UserRole {
  ROOT
  CLIENT
  ADMIN
}

enum PlanType {
  web
  app
  complete
}

enum PaymentStatus {
  pending
  processing
  completed
  failed
  cancelled
}
```

### 🔧 Módulos Principales

#### 🔐 AuthModule
- **Archivos**: `auth.controller.ts`, `auth.service.ts`, `brand-registration.controller.ts`
- **Endpoints**:
  ```typescript
  POST /auth/register/client
  POST /auth/register/brand
  POST /auth/forgot-password
  POST /auth/validate-reset-code
  POST /auth/reset-password
  ```
- **Funcionalidades**: Registro, autenticación JWT, recuperación de contraseña.

#### 📊 LandingDataModule
- **Responsabilidades**: Proveer datos para interfaces externas, tipos de negocio, features, planes.
- **Endpoints**:
  ```typescript
  GET /landing-data/config
  GET /landing-data/business-types
  GET /landing-data/features
  GET /landing-data/plans
  ```

#### 💳 PaymentModule
- **Integración**: Tilopay
- **Funcionalidades**: Procesamiento de pagos, webhooks, estados de transacciones.

#### ✅ ValidateModule
- **Endpoints**:
  ```typescript
  POST /validate/usernamearnia
  POST /validate/email
  ```

#### 🏥 HealthModule
- **Funcionalidad**: Health checks, verificación de conexiones.

### 🚀 Scripts y Comandos

```bash
# Desarrollo
npm run start:dev
npm run start:debug
npm run build
npm run start:prod

# Base de datos
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push
npx prisma studio

# Seeds
npm run prisma:seed

# Testing
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting
npm run lint
npm run format
```

### ⚙️ Configuración ESLint

```javascript
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  }
);
```

### 🔐 Variables de Entorno

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
TILOPAY_BASE_URL="https://sandbox.tilopay.com"
TILOPAY_API_KEY="your-tilopay-api-key"
TILOPAY_SECRET="your-tilopay-secret"
PORT=3000
NODE_ENV="development"
```

---

## 📱 Frontend Mobile (React Native/Expo)

### 📂 Estructura del Proyecto

```
frontend/
├── app.json              # Configuración Expo
├── babel.config.js       # Configuración Babel
├── eslint.config.js      # Configuración ESLint
├── metro.config.js       # Configuración Metro
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración Tailwind
├── tsconfig.json         # Configuración TypeScript
└── src/                  # Código fuente
    ├── globals.css       # Estilos globales
    ├── api/              # Cliente HTTP
    │   ├── constants.ts
    │   ├── endpoints.ts
    │   ├── types.ts
    ├── app/              # Navegación (Expo Router)
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── +not-found.tsx
    │   ├── (auth)/
    │   │   ├── _layout.tsx
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   ├── (client-tabs)/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── appointments.tsx
    │   │   ├── services.tsx
    │   │   ├── profile.tsx
    │   ├── (admin-tabs)/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── dashboard.tsx
    │   │   ├── clients.tsx
    │   │   ├── settings.tsx
    ├── assets/           # Recursos
    │   ├── fonts/
    │   └── images/
    ├── components/       # Componentes reutilizables
    │   ├── Collapsible.tsx
    │   ├── EmailValidationIndicator.tsx
    │   ├── PasswordStrengthIndicator.tsx
    │   ├── UsernameValidationIndicator.tsx
    │   ├── ThemedText.tsx
    │   ├── ThemedView.tsx
    ├── constants/        # Constantes
    │   ├── Colors.ts
    │   ├── ErrorConstants.ts
    │   ├── Plans.ts
    ├── contexts/         # Contextos React
    │   ├── AppContext.tsx
    │   ├── ThemeContext.tsx
    │   ├── ErrorContext.tsx
    ├── hooks/            # Hooks personalizados
    │   ├── useColorScheme.ts
    │   ├── useDebounce.ts
    │   ├── useEmailValidation.ts
    │   ├── usePasswordValidation.ts
    │   ├── useUsernameValidation.ts
    ├── navigation/       # Configuración de navegación
    │   └── AppNavigator.tsx
    ├── services/         # Servicios
    │   ├── authService.ts
    │   ├── planService.ts
    ├── types/            # Tipos
    │   ├── auth.types.ts
    │   ├── error.types.ts
    │   ├── plan.types.ts
    └── utils/            # Utilidades
        ├── errorBoundary.ts
        ├── errorUtils.ts
        ├── logger.ts
        ├── responsive.ts
        ├── validators.ts
```

### 🎨 Estándares y Convenciones de Código

#### 📝 Convenciones de Nomenclatura
- **Componentes**: `PascalCase` (ej: `EmailValidationIndicator.tsx`)
- **Hooks**: `camelCase` con prefijo `use` (ej: `useEmailValidation.ts`)
- **Services**: `camelCase` con sufijo `Service` (ej: `authService.ts`)
- **Types**: `PascalCase` con sufijo `Type` o `Interface`
- **Constants**: `UPPER_SNAKE_CASE`

#### 🏗️ Estructura de Componentes

```typescript
interface EmailValidationIndicatorProps {
  email: string;
  isValid: boolean;
  isChecking: boolean;
  error?: string;
}

export const EmailValidationIndicator: React.FC<EmailValidationIndicatorProps> = ({
  email,
  isValid,
  isChecking,
  error
}) => {
  const borderColor = useThemeColor({}, 'border');
  return (
    <ThemedView style={{ borderColor }}>
      {/* Implementación */}
    </ThemedView>
  );
};
```

#### 🎯 Hooks Personalizados

```typescript
export const useEmailValidation = () => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string>();

  const validateEmailAsync = async (emailValue: string) => {
    if (!emailValue) return;
    setIsChecking(true);
    setError(undefined);
    try {
      const result = await validateEmail(emailValue);
      setIsValid(result.isValid);
      if (!result.isValid) setError(result.message);
    } catch (err) {
      setError('Error validando email');
      setIsValid(false);
    } finally {
      setIsChecking(false);
    }
  };

  return { email, setEmail, isValid, isChecking, error, validateEmailAsync };
};
```

### 🔧 Configuración y Herramientas

#### 📦 Dependencias

```json
{
  "dependencies": {
    "expo": "~53.0.20",
    "react": "19.0.0",
    "react-native": "0.79.5",
    "expo-router": "~5.1.4",
    "nativewind": "^2.0.11",
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "expo-linear-gradient": "^14.1.5",
    "expo-haptics": "~14.1.4",
    "expo-image": "~2.4.0",
    "lucide-react-native": "^0.539.0"
  },
  "devDependencies": {
    "@types/react": "~19.0.10",
    "typescript": "~5.8.3",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~9.2.0",
    "tailwindcss": "^3.3.0"
  }
}
```

#### 🎨 Configuración NativeWind

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
    },
  },
  plugins: [],
};
```

#### ⚙️ Configuración Metro

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './src/globals.css' });
```

### 🔗 Integración con API

#### 🌐 Cliente HTTP

```typescript
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body && method !== 'GET') config.body = JSON.stringify(body);
  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
};
```

#### 🔐 Autenticación

```typescript
export class AuthService {
  private static TOKEN_KEY = 'auth_token';

  static async login(credentials: LoginRequest): Promise<boolean> {
    try {
      const response = await loginUser(credentials);
      if (response.success && response.token) {
        await AsyncStorage.setItem(this.TOKEN_KEY, response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.TOKEN_KEY);
  }
}
```

### 📊 Contextos

#### 🌍 AppContext

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  businessName?: string;
}

interface AppContextType {
  user: User | null;
  services: Service[];
  appointments: Appointment[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
```

#### 🎨 ThemeContext

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}
```

### 🧪 Validaciones y Errores

#### ✅ Validaciones

```typescript
export const validators = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password: string): { isValid: boolean; strength: 'weak' | 'medium' | 'strong'; issues: string[] } => {
    // Lógica de validación
  },
  username: (username: string): boolean => username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username),
};
```

#### 🚨 Manejo de Errores

```typescript
interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (error: ErrorMessage) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'Ha ocurrido un error inesperado';
};
```

### 🚀 Scripts y Comandos

```bash
npm start
npm run android
npm run ios
npm run web
npx expo build:android
npx expo build:ios
npx expo publish
npx expo start --clear
npx expo install
npx expo prebuild
npm run lint
```

### 📱 Navegación (Expo Router)

```
app/
├── _layout.tsx
├── index.tsx
├── +not-found.tsx
├── (auth)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── register.tsx
├── (client-tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── appointments.tsx
│   ├── services.tsx
│   ├── profile.tsx
├── (admin-tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── dashboard.tsx
│   ├── clients.tsx
│   ├── settings.tsx
```

---

## 🔄 Integración Backend ↔ Frontend

### 📡 Comunicación API

```mermaid
graph LR
    A[Mobile App] --> B[HTTP Client]
    B --> C[Backend API]
    C --> D[PostgreSQL]
    C --> E[External Services]
    E --> F[Tilopay]
    E --> G[SMTP]
```

### 🔐 Flujo de Autenticación
1. Ingreso de credenciales (Frontend)
2. Validación local (Hooks)
3. Envío a API (`POST /auth/login`)
4. Verificación (AuthService)
5. Generación de JWT
6. Almacenamiento (AsyncStorage)
7. Navegación a pantallas autenticadas

### 🛡️ Seguridad
- Hashing con bcrypt
- Tokens JWT
- Validaciones robustas
- Variables de entorno seguras
- Manejo seguro de errores
- Rate limiting (pendiente)

---

### 🔍 Herramientas de Debugging
- **Backend**: Prisma Studio, Swagger UI (`http://localhost:3000/api`), debug mode
- **Frontend**: Expo Dev Tools, React Native Debugger, Flipper


*Última actualización: 11 de agosto de 2025*