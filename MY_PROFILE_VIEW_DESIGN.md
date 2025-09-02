# TASK-014D#: Desarrollar página MyProfileView en app cliente

## Propuesta de Diseño y Plan de Implementación

---

## 📋 **Análisis de Requisitos**

### **Objetivo Principal**

Crear vista de perfil personal donde cliente puede ver y editar su información en la aplicación móvil React Native.

### **Contexto Técnico**

- **Sistema existente**: Frontend React Native + Expo con navegación por tabs
- **Tab actual**: Ya existe tab de perfil básico en `(client-tabs)/profile.tsx`
- **API disponible**: Backend con endpoints de cliente y actualización de perfil
- **UI Framework**: React Native con componentes personalizados y diseño moderno

### **Análisis del Estado Actual**

La tab de perfil actual necesita:

- **Diseño mejorado**: Interfaz más atractiva y profesional
- **Funcionalidad de edición**: Permitir actualizar información personal
- **Mejor organización**: Secciones claras y navegación intuitiva
- **Consistencia visual**: Seguir el patrón de diseño moderno de la app

---

## 🎯 **Especificaciones Técnicas**

### **1. Estructura de Componentes**

#### **Archivo Principal**

```
frontend/src/app/(client-tabs)/profile.tsx
```

#### **Componentes Auxiliares**

```
frontend/src/components/Profile/
├── ProfileHeader.tsx          // Header con foto y datos básicos
├── EditProfileModal.tsx       // Modal para editar información
├── ProfileSection.tsx         // Sección reutilizable
├── ProfileListItem.tsx        // Item de lista con chevron
└── index.ts                   // Exports
```

#### **Interfaces TypeScript**

```typescript
interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: string;
  isActive: boolean;
}

interface EditProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
}
```

### **2. Diseño Visual Adaptado**

#### **Secciones Principales**

1. **Header con Perfil**

   - Avatar circular (128x128)
   - Nombre completo
   - Información de membresía
   - Botón de configuración

2. **Información Personal** (Editable)

   - Nombre y apellido
   - Email (no editable)
   - Teléfono
   - Botón "Editar Perfil"

3. **Mis Citas**

   - Próximas citas
   - Historial de citas
   - Botón "Ver todas"

4. **Acciones Rápidas**
   - Agendar nueva cita
   - Ver historial
   - Configuración
   - Ayuda y soporte

### **3. Funcionalidades Implementadas**

#### **Visualización**

- Carga de datos del perfil desde API
- Imagen de avatar con placeholder
- Información organizada en secciones
- Estados de loading y error

#### **Edición**

- Modal para editar información personal
- Validación de campos en tiempo real
- Guardado con confirmación
- Manejo de errores de API

#### **Navegación**

- Navegación a otras secciones
- Modal system nativo de React Native
- Transiciones suaves

---

## 🚀 **Plan de Implementación**

### **Fase 1: Componentes Base (30 min)**

1. **Crear estructura de componentes**:

   - `ProfileHeader.tsx` - Header con avatar y datos
   - `ProfileSection.tsx` - Sección reutilizable
   - `ProfileListItem.tsx` - Item de lista con chevron

2. **Servicios y tipos**:
   - Interfaces TypeScript para perfil
   - Integración con authService existente

### **Fase 2: Vista Principal (45 min)**

1. **Redesñar `profile.tsx`**:

   - Layout moderno basado en el diseño de referencia
   - Secciones organizadas y navegables
   - Estados de loading y error

2. **Integración con API**:
   - Cargar datos del perfil
   - Manejo de estados globales
   - Refresh automático

### **Fase 3: Funcionalidad de Edición (60 min)**

1. **Crear `EditProfileModal.tsx`**:

   - Modal nativo con formulario
   - Validación en tiempo real
   - Guardado con feedback

2. **Integración completa**:
   - Botón editar en perfil
   - Actualización automática de datos
   - Manejo de errores

### **Fase 4: Refinamiento UX (15 min)**

1. **Pulir diseño y transiciones**
2. **Testing en dispositivo**
3. **Optimización de performance**

---

## 🔧 **Arquitectura de Componentes**

### **ProfileHeader Component**

```typescript
interface ProfileHeaderProps {
  profile: ClientProfile;
  onEdit: () => void;
  onSettings: () => void;
}

// Muestra avatar, nombre, info de membresía y botones
```

### **EditProfileModal Component**

```typescript
interface EditProfileModalProps {
  isVisible: boolean;
  profile: ClientProfile;
  onClose: () => void;
  onSave: (data: EditProfileData) => Promise<void>;
  loading?: boolean;
}

// Modal con formulario de edición
```

### **ProfileSection Component**

```typescript
interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  action?: {
    text: string;
    onPress: () => void;
  };
}

// Sección reutilizable con título y acción opcional
```

---

## 🎨 **Diseño Visual React Native**

### **Layout Principal**

```typescript
<ScrollView style={styles.container}>
  {/* Header */}
  <ProfileHeader
    profile={profile}
    onEdit={() => setShowEditModal(true)}
    onSettings={() => navigation.navigate("Settings")}
  />

  {/* Información Personal */}
  <ProfileSection title="Información Personal">
    <ProfileListItem
      icon="user"
      title="Nombre"
      value={`${profile.firstName} ${profile.lastName}`}
      onPress={() => setShowEditModal(true)}
    />
    <ProfileListItem
      icon="mail"
      title="Email"
      value={profile.email}
      editable={false}
    />
    <ProfileListItem
      icon="phone"
      title="Teléfono"
      value={profile.phone || "No registrado"}
      onPress={() => setShowEditModal(true)}
    />
  </ProfileSection>

  {/* Mis Citas */}
  <ProfileSection
    title="Mis Citas"
    action={{ text: "Ver todas", onPress: () => {} }}
  >
    {/* Lista de próximas citas */}
  </ProfileSection>

  {/* Acciones Rápidas */}
  <ProfileSection title="Acciones Rápidas">
    <ProfileListItem
      icon="calendar-plus"
      title="Agendar nueva cita"
      onPress={() => navigation.navigate("BookAppointment")}
    />
    <ProfileListItem
      icon="history"
      title="Ver historial"
      onPress={() => navigation.navigate("AppointmentHistory")}
    />
    <ProfileListItem
      icon="settings"
      title="Configuración"
      onPress={() => navigation.navigate("Settings")}
    />
  </ProfileSection>
</ScrollView>
```

### **Estilos React Native**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
  },
  // ... más estilos
});
```

---

## 📱 **Funcionalidades Específicas**

### **1. Carga de Perfil**

```typescript
const useProfile = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        setError("Error cargando perfil");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, loadProfile, refetch: loadProfile };
};
```

### **2. Edición de Perfil**

```typescript
const useEditProfile = (onSuccess: () => void) => {
  const [saving, setSaving] = useState(false);

  const updateProfile = async (data: EditProfileData) => {
    try {
      setSaving(true);
      const response = await authService.updateProfile(data);
      if (response.success) {
        onSuccess();
        // Mostrar toast de éxito
      } else {
        // Mostrar error
      }
    } catch (err) {
      // Manejar error
    } finally {
      setSaving(false);
    }
  };

  return { updateProfile, saving };
};
```

### **3. Validación de Formulario**

```typescript
const validateProfileForm = (data: EditProfileData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.firstName.trim()) {
    errors.firstName = "El nombre es obligatorio";
  }

  if (!data.lastName.trim()) {
    errors.lastName = "El apellido es obligatorio";
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = "Formato de teléfono inválido";
  }

  return errors;
};
```

---

## 🔄 **Integración con Backend**

### **Endpoints Utilizados**

```typescript
// authService.ts
export const authService = {
  // Obtener perfil del cliente autenticado
  async getProfile(): Promise<ApiResponse<ClientProfile>> {
    return apiClient.get("/auth/profile");
  },

  // Actualizar perfil del cliente
  async updateProfile(
    data: EditProfileData
  ): Promise<ApiResponse<ClientProfile>> {
    return apiClient.put("/auth/profile", data);
  },
};
```

### **Manejo de Estados Globales**

```typescript
// Usar contexto existente para mantener datos del usuario
const { user, updateUser } = useContext(AppContext);

// Actualizar contexto después de editar perfil
const handleProfileUpdate = (updatedProfile: ClientProfile) => {
  updateUser(updatedProfile);
  setProfile(updatedProfile);
};
```

---

## 📝 **Flujo de Usuario**

### **Escenario Principal**

1. Usuario abre tab de perfil
2. Carga automática de datos del perfil
3. Usuario ve información organizada en secciones
4. Usuario toca "Editar" en información personal
5. Se abre modal con formulario pre-llenado
6. Usuario modifica datos y guarda
7. Modal se cierra y perfil se actualiza automáticamente

### **Escenarios Alternativos**

- **Error de carga**: Mostrar estado de error con botón reintentar
- **Sin conexión**: Mostrar datos en caché si están disponibles
- **Error de guardado**: Mantener modal abierto con mensaje de error
- **Validación fallida**: Mostrar errores específicos por campo

---

## 🔍 **Casos de Prueba**

### **Funcionalidad**

- [ ] Carga correcta de datos del perfil
- [ ] Edición y guardado de nombre y apellido
- [ ] Edición y guardado de teléfono
- [ ] Validación de campos obligatorios
- [ ] Manejo de errores de API
- [ ] Estados de loading durante operaciones

### **UX/UI**

- [ ] Diseño responsivo en diferentes tamaños de pantalla
- [ ] Transiciones suaves entre estados
- [ ] Accesibilidad (screen readers)
- [ ] Performance fluida en scroll
- [ ] Modal funciona correctamente en iOS y Android

### **Integración**

- [ ] Navegación entre tabs funciona
- [ ] Contexto global se actualiza correctamente
- [ ] Datos persisten al cambiar de tab
- [ ] Refresh automático después de editar

---

## ⏱️ **Estimación de Tiempo**

| Fase      | Actividad                   | Tiempo Estimado |
| --------- | --------------------------- | --------------- |
| 1         | Componentes Base            | 30 min          |
| 2         | Vista Principal             | 45 min          |
| 3         | Funcionalidad de Edición    | 60 min          |
| 4         | Refinamiento UX             | 15 min          |
| **Total** | **Implementación Completa** | **~150 min**    |

---

## 🚦 **Criterios de Aceptación**

### **Funcionales**

- ✅ Carga y muestra información del perfil del cliente
- ✅ Permite editar nombre, apellido y teléfono
- ✅ Valida campos antes de guardar
- ✅ Actualiza información en tiempo real
- ✅ Maneja errores de conexión apropiadamente

### **No Funcionales**

- ✅ Diseño moderno y atractivo siguiendo el patrón de referencia
- ✅ Performance fluida en dispositivos móviles
- ✅ Compatible con iOS y Android
- ✅ Accesible para usuarios con discapacidades
- ✅ Responsive en diferentes tamaños de pantalla

### **Técnicos**

- ✅ TypeScript sin errores
- ✅ Componentes reutilizables y bien estructurados
- ✅ Integración limpia con servicios existentes
- ✅ Manejo consistente de estados y errores
- ✅ Performance optimizada con lazy loading

---

## 🔄 **Próximos Pasos**

1. **Crear componentes base de Profile**
2. **Implementar servicios de perfil en authService**
3. **Redesñar vista principal con nuevo layout**
4. **Desarrollar modal de edición con validación**
5. **Testing completo en iOS y Android**
6. **Optimización final y refinamiento UX**

---

## 📱 **Consideraciones React Native**

### **Componentes Nativos Utilizados**

- `ScrollView` - Para scroll suave del perfil
- `Modal` - Para formulario de edición
- `TextInput` - Para campos editables
- `TouchableOpacity` - Para elementos interactivos
- `Image` - Para avatar del usuario
- `SafeAreaView` - Para compatibilidad con notch

### **Librerías Adicionales**

- `react-native-vector-icons` - Para iconos (ya existe)
- `@react-native-async-storage` - Para cache local (ya existe)
- Validadores personalizados para teléfono

### **Performance**

- Lazy loading de componentes
- Optimización de imágenes
- Debounce en validación de formularios
- Cache de datos del perfil

---

_Documento creado para TASK-014D# - Desarrollar página MyProfileView en app cliente_
_Estimación total: ~150 minutos de desarrollo_
