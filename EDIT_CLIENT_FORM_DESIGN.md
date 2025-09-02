# TASK-012E#: Implementar componente EditClientForm

## Propuesta de Diseño y Plan de Implementación

---

## 📋 **Análisis de Requisitos**

### **Objetivo Principal**

Desarrollar un formulario editable para modificar información del cliente con validación y confirmación de cambios.

### **Contexto Técnico**

- **Sistema existente**: Landing/Panel admin con arquitectura Next.js + TypeScript
- **Componentes base**: Ya existe `ClientForm.tsx` que maneja crear/editar clientes
- **API disponible**: Endpoint `UPDATE: (brandId: number, clientId: number) => /brands/${brandId}/clients/${clientId}`
- **UI Framework**: shadcn/ui components con Tailwind CSS

### **Análisis del Código Existente**

El componente `ClientForm.tsx` ya tiene capacidad de edición pero está integrado en el flujo de creación. Necesitamos crear un componente específico para edición que:

- Se enfoque únicamente en editar clientes existentes
- Tenga mejor UX para confirmación de cambios
- Maneje validaciones específicas de edición (email duplicado, etc.)
- Proporcione feedback visual claro de los cambios

---

## 🎯 **Especificaciones Técnicas**

### **1. Estructura del Componente**

#### **Archivo Principal**

```
landing/components/modals/client/edit-client-modal.tsx
```

#### **Props Interface**

```typescript
interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientId: number, data: UpdateClientData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

interface UpdateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}
```

### **2. Validaciones Implementadas**

#### **Validaciones de Campo**

- **firstName**: Requerido, min 2 caracteres, max 50 caracteres
- **lastName**: Requerido, min 2 caracteres, max 50 caracteres
- **email**: Requerido, formato válido, único en la marca
- **phone**: Opcional, formato válido si se proporciona
- **notes**: Opcional, max 500 caracteres

#### **Validaciones de Negocio**

- Email no debe duplicarse con otros clientes de la marca
- Detección de cambios (solo enviar si hay modificaciones)
- Validación en tiempo real con debounce de 300ms

### **3. Funcionalidades UX**

#### **Detección de Cambios**

- Botón "Guardar" habilitado solo si hay cambios
- Indicador visual de campos modificados
- Confirmación antes de cerrar con cambios sin guardar

#### **Estados del Formulario**

- **Loading**: Spinner en botón guardar + campos deshabilitados
- **Error**: Alert con mensaje específico del error
- **Success**: Confirmación temporal + cierre automático
- **Pristine**: Estado inicial sin cambios

#### **Navegación**

- Modal responsive con scroll interno
- Cierre con ESC (con confirmación si hay cambios)
- Focus management para accesibilidad

---

## 🚀 **Plan de Implementación**

### **Fase 1: Servicio de API (15 min)**

1. **Extender `client.service.ts`**:

   ```typescript
   // Añadir método updateClient
   async updateClient(brandId: number, clientId: number, data: UpdateClientData): Promise<ApiResponse<Client>>
   ```

2. **Manejo de errores específicos**:
   - Email duplicado
   - Cliente no encontrado
   - Permisos insuficientes

### **Fase 2: Componente Principal (45 min)**

1. **Crear `EditClientModal.tsx`**:

   - Estructura base con BaseModal
   - Formulario con campos existentes
   - Estado local para manejo de datos

2. **Implementar validaciones**:

   - Hook personalizado `useFormValidation`
   - Validación en tiempo real
   - Manejo de errores de API

3. **Detección de cambios**:
   - Comparación con datos originales
   - Estado `hasChanges` para habilitar botón guardar

### **Fase 3: Integración (20 min)**

1. **Actualizar `index.ts`** de modals
2. **Integrar en página de clientes**:

   - Botón "Editar" en `ClientDetailView`
   - Modal de edición con datos pre-cargados

3. **Testing de flujo completo**:
   - Abrir modal de edición
   - Modificar datos
   - Guardar cambios
   - Verificar persistencia

### **Fase 4: Refinamiento UX (10 min)**

1. **Estados de loading y feedback**
2. **Confirmación de cambios no guardados**
3. **Optimización responsive**

---

## 🔧 **Arquitectura del Componente**

### **Hook de Estado Local**

```typescript
const useEditClientForm = (client: Client | null) => {
  const [formData, setFormData] = useState<UpdateClientData>();
  const [originalData, setOriginalData] = useState<UpdateClientData>();
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Lógica de detección de cambios
  // Validación en tiempo real
  // Reset y cleanup
};
```

### **Estructura del Modal**

```
EditClientModal
├── BaseModal (wrapper)
├── Header (título + cliente info)
├── FormSection
│   ├── PersonalInfo (nombre, apellido)
│   ├── ContactInfo (email, teléfono)
│   └── NotesSection (notas del cliente)
├── ChangesSummary (si hay cambios)
└── Footer (cancelar + guardar)
```

### **Estados de Interacción**

```
Estados:
- pristine: Sin cambios
- editing: Con cambios pendientes
- validating: Validando datos
- saving: Guardando en API
- success: Guardado exitoso
- error: Error en proceso
```

---

## 🎨 **Diseño Visual**

### **Layout Responsive**

- **Mobile**: Modal full-screen con scroll
- **Tablet**: Modal centrado 80% pantalla
- **Desktop**: Modal centrado max-width 600px

### **Indicadores Visuales**

- **Campos modificados**: Border azul + icono de cambio
- **Errores**: Border rojo + mensaje debajo
- **Loading**: Spinner en botón + campos disabled
- **Success**: Toast notification + auto-close

### **Accesibilidad**

- Labels correctos para screen readers
- Focus management en apertura/cierre
- Keyboard navigation completa
- ARIA attributes apropiados

---

## 📝 **Flujo de Usuario**

### **Escenario Principal**

1. Usuario hace clic en "Editar" desde detalle del cliente
2. Modal se abre con datos pre-cargados del cliente
3. Usuario modifica campos necesarios
4. Validación en tiempo real muestra errores/éxitos
5. Botón "Guardar" se habilita al detectar cambios
6. Usuario confirma cambios
7. Loading state durante guardado
8. Success feedback + cierre automático
9. Lista de clientes se actualiza con nuevos datos

### **Escenarios Alternativos**

- **Error de API**: Mostrar error específico + mantener modal abierto
- **Cerrar con cambios**: Confirmación "¿Descartar cambios?"
- **Email duplicado**: Error específico en campo email
- **Sin cambios**: Botón guardar permanece disabled

---

## 🔍 **Casos de Prueba**

### **Validaciones**

- [ ] Email formato inválido
- [ ] Email duplicado en la marca
- [ ] Nombres vacíos o muy cortos
- [ ] Teléfono formato inválido
- [ ] Notas exceden límite de caracteres

### **Flujo de Edición**

- [ ] Cargar datos existentes correctamente
- [ ] Detectar cambios en tiempo real
- [ ] Guardar solo campos modificados
- [ ] Manejar errores de API apropiadamente
- [ ] Confirmar antes de cerrar con cambios

### **UX/UI**

- [ ] Modal responsive en todos los breakpoints
- [ ] Estados de loading visibles
- [ ] Feedback de success/error claro
- [ ] Navegación por teclado funcional
- [ ] Focus management correcto

---

## ⏱️ **Estimación de Tiempo**

| Fase      | Actividad                   | Tiempo Estimado |
| --------- | --------------------------- | --------------- |
| 1         | Servicio API                | 15 min          |
| 2         | Componente Principal        | 45 min          |
| 3         | Integración                 | 20 min          |
| 4         | Refinamiento UX             | 10 min          |
| **Total** | **Implementación Completa** | **~90 min**     |

---

## 🚦 **Criterios de Aceptación**

### **Funcionales**

- ✅ Formulario carga datos existentes del cliente
- ✅ Validación en tiempo real de todos los campos
- ✅ Detección de cambios habilita botón guardar
- ✅ Guardado exitoso actualiza datos y cierra modal
- ✅ Manejo apropiado de errores de API

### **No Funcionales**

- ✅ Modal responsive en mobile/tablet/desktop
- ✅ Loading states claros durante operaciones
- ✅ Confirmación antes de descartar cambios
- ✅ Accesibilidad completa (WCAG 2.1 AA)
- ✅ Performance: validación con debounce 300ms

### **Técnicos**

- ✅ TypeScript sin errores
- ✅ Reutilización de componentes UI existentes
- ✅ Manejo de errores consistente con la app
- ✅ Integración limpia con servicios existentes

---

## 🔄 **Próximos Pasos**

1. **Implementar servicio de update en `client.service.ts`**
2. **Crear componente `EditClientModal.tsx`**
3. **Integrar en flujo de gestión de clientes**
4. **Testing completo del flujo**
5. **Optimización final y refinamiento UX**

---

_Documento creado para TASK-012E# - Implementar componente EditClientForm_
_Estimación total: ~90 minutos de desarrollo_
