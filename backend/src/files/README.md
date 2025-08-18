# Módulo de Gestión de Archivos con MinIO

Este módulo implementa la gestión completa de archivos utilizando MinIO como almacenamiento de objetos compatible con S3.

## Características

- ✅ Subida de archivos base64 a MinIO
- ✅ Gestión de metadatos en PostgreSQL
- ✅ Organización automática por entidades
- ✅ Soporte para logos, isotipos e imagotipos de marcas
- ✅ URLs públicas y firmadas
- ✅ Eliminación suave de archivos
- ✅ Estadísticas de almacenamiento

## Configuración

### Variables de Entorno

```bash
# Configuración MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=brand-assets
MINIO_PUBLIC_URL=http://localhost:9000
```

### Iniciar MinIO con Docker

```bash
docker run -p 9000:9000 -p 9001:9001 \
  --name minio \
  -e "MINIO_ACCESS_KEY=minioadmin" \
  -e "MINIO_SECRET_KEY=minioadmin" \
  -v /data:/data \
  minio/minio server /data --console-address ":9001"
```

## Estructura de Archivos

Los archivos se organizan automáticamente en MinIO con la siguiente estructura:

```
bucket-name/
├── brands/
│   └── {brandId}/
│       ├── images/
│       │   ├── logo-{uuid}.{ext}
│       │   ├── isotipo-{uuid}.{ext}
│       │   └── imagotipo-{uuid}.{ext}
│       ├── documents/
│       └── attachments/
├── users/
│   └── {userId}/
└── plans/
    └── {planId}/
```

## Tipos de Archivo Soportados

### FileType Enum
- `LOGO` - Logo principal de la marca
- `ISOTOPO` - Símbolo o isotipo de la marca
- `IMAGOTIPO` - Combinación de texto e imagen
- `BANNER` - Banners promocionales
- `PROFILE_IMAGE` - Imágenes de perfil
- `DOCUMENT` - Documentos PDF, Word, etc.
- `ATTACHMENT` - Archivos adjuntos
- `OTHER` - Otros tipos de archivo

### EntityType Enum
- `BRAND` - Archivos relacionados con marcas
- `USER` - Archivos de usuarios
- `PLAN` - Archivos de planes
- `FEATURE` - Archivos de características

## API Endpoints

### Subir Archivo
```http
POST /files/upload
Content-Type: application/json

{
  "name": "logo.jpg",
  "base64Data": "data:image/jpeg;base64,/9j/4AAQ...",
  "fileType": "logo",
  "entityType": "brand",
  "entityId": 123,
  "folder": "images"
}
```

### Obtener Archivos por Entidad
```http
GET /files/entity/brand/123?fileType=logo&page=1&limit=10
```

### Obtener Archivo por ID
```http
GET /files/1
```

### Eliminar Archivo
```http
DELETE /files/1?requestingUserId=456
```

### Reemplazar Archivo
```http
POST /files/replace
Content-Type: application/json

{
  "name": "new-logo.jpg",
  "base64Data": "data:image/jpeg;base64,/9j/4AAQ...",
  "fileType": "logo",
  "entityType": "brand",
  "entityId": 123
}
```

### URL Firmada
```http
GET /files/1/presigned-url?expiry=3600
```

### Estadísticas
```http
GET /files/stats/storage
```

## Integración con Registro de Marca

El módulo se integra automáticamente con el registro de marcas:

```typescript
// En CreateBrandDto
export class CreateBrandDto {
  // ... otros campos
  
  @ApiPropertyOptional({ description: 'Logo en base64' })
  @IsOptional()
  @IsString()
  logoImage?: string;

  @ApiPropertyOptional({ description: 'Isotipo en base64' })
  @IsOptional()
  @IsString()
  isotipoImage?: string;

  @ApiPropertyOptional({ description: 'Imagotipo en base64' })
  @IsOptional()
  @IsString()
  imagotipoImage?: string;
}
```

Durante el registro de marca:
1. Se crea la marca en la base de datos
2. Se procesan las imágenes base64 si están presentes
3. Se suben a MinIO con la estructura correcta
4. Se actualizan las URLs en la marca

## Formatos Soportados

### Imágenes
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

### Documentos
- PDF (.pdf)
- Word (.doc, .docx)

## Metadatos Almacenados

En MinIO se almacenan metadatos adicionales:
- `x-amz-meta-entity-type`: Tipo de entidad
- `x-amz-meta-entity-id`: ID de la entidad
- `x-amz-meta-file-type`: Tipo de archivo
- `x-amz-meta-original-name`: Nombre original
- `x-amz-meta-uploaded-by`: ID del usuario que subió
- `x-amz-meta-uploaded-at`: Fecha de subida

## Base de Datos

La tabla `files` almacena los metadatos:

```sql
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  key VARCHAR UNIQUE NOT NULL,
  content_type VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  size INTEGER,
  entity_id INTEGER NOT NULL,
  entity_type VARCHAR NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Uso en el Frontend

```typescript
// Subir logo durante registro de marca
const registerData = {
  // ... otros datos
  logoImage: 'data:image/jpeg;base64,/9j/4AAQ...',
  isotipoImage: 'data:image/png;base64,iVBORw0KGgoA...',
  imagotipoImage: 'data:image/png;base64,iVBORw0KGgoA...'
};

// El backend automáticamente procesará y almacenará las imágenes
const response = await fetch('/auth/register/brand', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registerData)
});
```

## Consideraciones de Seguridad

1. **Validación de Tipos**: Solo se permiten tipos de archivo específicos
2. **Tamaño Límite**: Se pueden configurar límites de tamaño
3. **Autenticación**: Los endpoints requieren autenticación (excepto algunos públicos)
4. **Eliminación Suave**: Los archivos se marcan como inactivos en lugar de eliminarse físicamente
5. **URLs Firmadas**: Para acceso temporal controlado

## Monitoreo

- **Estadísticas de Almacenamiento**: Total de archivos, tamaño usado, distribución por tipo
- **Logs**: Todas las operaciones se registran con detalles
- **Errores**: Manejo robusto de errores con códigos específicos
