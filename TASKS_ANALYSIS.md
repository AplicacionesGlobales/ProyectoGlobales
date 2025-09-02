# Análisis de Tareas del Sprint

## TASK-010E#: Implementar componente Pagination para resultados

### Estado Actual

✅ **Componente UI básico existente**: Se encontró `components/ui/pagination.tsx` en el landing con componentes primitivos:

- `Pagination`, `PaginationContent`, `PaginationItem`
- `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`

❌ **Falta implementación funcional**: Los componentes son solo UI primitivos sin lógica de paginación.

### Qué hacer

1. **Crear componente Pagination funcional** en `frontend/src/components/ui/Pagination.tsx`:

   - Props: `currentPage`, `totalPages`, `onPageChange`, `itemsPerPage`, `totalItems`
   - Lógica para mostrar números de página con elipsis
   - Selector de elementos por página (10, 25, 50, 100)
   - Contador de resultados ("Mostrando X-Y de Z resultados")

2. **Integrar en las vistas que requieren paginación**:

   - Lista de citas en `appointments.tsx`
   - Lista de clientes (si existe en frontend móvil)
   - Historial de citas en perfil

3. **Adaptaciones móviles**:
   - Versión compacta para móvil
   - Navegación por swipe gestures
   - Paginación infinita como alternativa

---

## TASK-012E#: Implementar componente EditClientForm

### Estado Actual

✅ **Formulario de creación existente**: Se encontró `CreateClientModal` y `ClientForm` en el landing web.

❌ **No existe en frontend móvil**: No hay componente para editar clientes en la app móvil.

### Qué hacer

1. **Crear `EditClientForm.tsx`** en `frontend/src/components/forms/`:

   - Basado en la estructura del `CreateClientModal` del landing
   - Props: `client`, `onSave`, `onCancel`, `loading`
   - Campos: firstName, lastName, email, phone, notes
   - Validación completa con feedback visual

2. **Implementar validaciones**:

   - Email formato válido
   - Teléfono opcional pero formato válido
   - Nombres obligatorios
   - Máximo caracteres en notas

3. **Integrar con API**:

   - Crear servicio `updateClientProfile`
   - Manejo de errores (email duplicado, etc.)
   - Confirmación de cambios guardados

4. **UX móvil**:
   - Modal deslizable desde abajo
   - Teclado optimizado por tipo de campo
   - Indicador de cambios sin guardar

---

## TASK-014D#: Desarrollar página MyProfileView en app cliente

### Estado Actual

✅ **Perfil básico existente**: Se encontró `(client-tabs)/profile.tsx` con:

- Información básica del usuario
- Estadísticas de citas
- Opciones de configuración
- Solo modo lectura

❌ **No es editable**: El perfil actual no permite editar información personal.

### Qué hacer

1. **Mejorar ProfileView existente** en `frontend/src/app/(client-tabs)/profile.tsx`:

   - Agregar modo edición con toggle
   - Secciones expandibles/colapsables
   - Foto de perfil (opcional)

2. **Implementar edición de datos**:

   - Botón "Editar Perfil" que cambia a modo edición
   - Formulario inline para editar: nombre, email, teléfono
   - Validación en tiempo real
   - Botones "Guardar" y "Cancelar"

3. **Nuevas secciones**:

   - **Mis Datos**: Información personal editable
   - **Preferencias**: Notificaciones, recordatorios
   - **Seguridad**: Cambio de contraseña
   - **Historial**: Citas pasadas con paginación

4. **Integración con backend**:

   - Usar endpoint `PUT /brands/:brandId/profile`
   - Manejo de errores y éxito
   - Actualización del contexto global

5. **Mejoras UX**:
   - Pull-to-refresh
   - Loading states
   - Confirmación antes de guardar cambios
   - Toast notifications para feedback

---

## Orden de Implementación Recomendado

1. **TASK-014D** (MyProfileView) - Base para las otras tareas
2. **TASK-012E** (EditClientForm) - Reutiliza componentes del perfil
3. **TASK-010E** (Pagination) - Para integrar en las listas

## Archivos a Crear/Modificar

### TASK-010E

- `frontend/src/components/ui/Pagination.tsx` (nuevo)
- `frontend/src/hooks/usePagination.ts` (nuevo)

### TASK-012E

- `frontend/src/components/forms/EditClientForm.tsx` (nuevo)
- `frontend/src/services/clientService.ts` (modificar)

### TASK-014D

- `frontend/src/app/(client-tabs)/profile.tsx` (modificar)
- `frontend/src/components/profile/EditProfileForm.tsx` (nuevo)
- `frontend/src/services/profileService.ts` (nuevo)
