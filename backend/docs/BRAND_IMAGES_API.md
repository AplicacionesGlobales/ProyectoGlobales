# API de Imágenes de Marca

## Descripción
Se ha refactorizado la funcionalidad de subida de imágenes del registro de marca para crear endpoints específicos en el módulo de archivos.

## Cambios Realizados

### 1. Eliminación de imágenes del registro de marca
- Se removieron las propiedades `logoImage`, `isotipoImage`, `imagotipoImage` del DTO `CreateBrandDto`
- Se eliminó la lógica de procesamiento de imágenes base64 del `BrandRegistrationService`
- Se removió la dependencia de `MinioService` del servicio de registro

### 2. Nuevos endpoints para imágenes de marca

#### POST `/files/brand-images`
Sube una imagen específica de marca (logo, isotipo o imagotipo)

**Parámetros:**
- `file`: Archivo de imagen (FormData)
- `brandId`: ID de la marca (number)
- `imageType`: Tipo de imagen (`LOGO` | `ISOTOPO` | `IMAGOTIPO`)
- `userId`: ID del usuario que sube la imagen (number)

**Ejemplo de uso:**
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('brandId', '123');
formData.append('imageType', 'LOGO');
formData.append('userId', '456');

fetch('/api/files/brand-images', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

**Respuesta:**
```json
{
  "success": true,
  "file": {
    "id": 789,
    "name": "logo.png",
    "url": "https://minio.example.com/brand-assets/brands/123/images/logo-uuid.png",
    "key": "brands/123/images/logo-uuid.png",
    "contentType": "image/png",
    "fileType": "logo",
    "size": 45678,
    "entityId": 123,
    "entityType": "brand",
    "uploadedBy": 456,
    "isActive": true,
    "createdAt": "2025-08-18T10:30:00.000Z",
    "updatedAt": "2025-08-18T10:30:00.000Z"
  }
}
```

#### GET `/files/brand/:brandId/images`
Obtiene todas las imágenes de una marca específica

**Respuesta:**
```json
{
  "logo": {
    "id": 789,
    "name": "logo.png",
    "url": "https://minio.example.com/brand-assets/brands/123/images/logo-uuid.png",
    // ... resto de propiedades
  },
  "isotipo": null,
  "imagotipo": {
    "id": 790,
    "name": "imagotipo.png",
    "url": "https://minio.example.com/brand-assets/brands/123/images/imagotipo-uuid.png",
    // ... resto de propiedades
  }
}
```

## Funcionalidades

### Validaciones Implementadas
1. **Verificación de acceso**: El usuario debe tener acceso a la marca (`UserBrand` relation)
2. **Validación de tipo de archivo**: Solo se permiten imágenes
3. **Reemplazo automático**: Si ya existe una imagen del mismo tipo, se reemplaza automáticamente
4. **Actualización de URLs**: Se actualiza automáticamente la tabla `Brand` con las URLs correspondientes

### Estructura de archivos en MinIO
```
brands/
  {brandId}/
    images/
      logo-{uuid}.{ext}
      isotipo-{uuid}.{ext}
      imagotipo-{uuid}.{ext}
```

### Metadatos almacenados
- `x-amz-meta-entity-type`: 'brand'
- `x-amz-meta-entity-id`: ID de la marca
- `x-amz-meta-file-type`: tipo de archivo (logo, isotipo, imagotipo)
- `x-amz-meta-original-name`: nombre original del archivo
- `x-amz-meta-uploaded-by`: ID del usuario que subió el archivo
- `x-amz-meta-uploaded-at`: timestamp de subida
- `x-amz-meta-image-type`: tipo específico de imagen de marca

## Flujo Recomendado

1. **Registro de marca**: Usar `/auth/register/brand` sin imágenes
2. **Subida de imágenes**: Una vez registrada la marca, usar `/files/brand-images` para cada imagen
3. **Consulta de imágenes**: Usar `/files/brand/:brandId/images` para obtener todas las imágenes

Este enfoque separa las responsabilidades y hace el código más modular y mantenible.
