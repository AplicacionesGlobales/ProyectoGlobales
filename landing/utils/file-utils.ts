// landing\utils\file-utils.ts

/**
 * Valida que un archivo sea una imagen válida
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, WebP, SVG'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es muy grande. Máximo 5MB'
    };
  }

  return { isValid: true };
}

/**
 * Helper para manejar la subida de archivos
 */
export async function prepareFilesForUpload(files: {
  logoUrl?: File | null;
  isotipoUrl?: File | null;
  imagotipoUrl?: File | null;
}): Promise<{
  logoImage?: File;
  isotipoImage?: File;
  imagotipoImage?: File;
}> {
  const result: {
    logoImage?: File;
    isotipoImage?: File;
    imagotipoImage?: File;
  } = {};

  if (files.logoUrl) {
    const validation = validateImageFile(files.logoUrl);
    if (!validation.isValid) throw new Error(validation.error);
    result.logoImage = files.logoUrl;
  }

  if (files.isotipoUrl) {
    const validation = validateImageFile(files.isotipoUrl);
    if (!validation.isValid) throw new Error(validation.error);
    result.isotipoImage = files.isotipoUrl;
  }

  if (files.imagotipoUrl) {
    const validation = validateImageFile(files.imagotipoUrl);
    if (!validation.isValid) throw new Error(validation.error);
    result.imagotipoImage = files.imagotipoUrl;
  }

  return result;
}