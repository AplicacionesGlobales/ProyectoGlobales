/**
 * File utilities for image processing
 * Handles file to base64 conversion and validation
 */

export interface FileToBase64Result {
  base64: string;
  originalName: string;
  size: number;
  type: string;
}

/**
 * Converts a File object to base64 string
 * @param file - File object to convert
 * @returns Promise<FileToBase64Result>
 */
export const fileToBase64 = (file: File): Promise<FileToBase64Result> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/jpeg;base64, prefix to get just the base64
        const base64 = reader.result.split(',')[1];
        
        resolve({
          base64,
          originalName: file.name,
          size: file.size,
          type: file.type
        });
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validates if file is a valid image
 * @param file - File to validate
 * @returns boolean
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Validates image file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default 5MB)
 * @returns boolean
 */
export const isValidImageSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Converts multiple files to base64
 * @param files - Array of files or FileList
 * @returns Promise<FileToBase64Result[]>
 */
export const multipleFilesToBase64 = async (
  files: File[] | FileList
): Promise<FileToBase64Result[]> => {
  const fileArray = Array.from(files);
  const promises = fileArray.map(file => fileToBase64(file));
  
  try {
    return await Promise.all(promises);
  } catch (error) {
    throw new Error(`Failed to convert files: ${error}`);
  }
};

/**
 * Converts files object to base64 strings for registration
 * @param files - Object with logo, isotopo, imagotipo files
 * @returns Promise with base64 strings
 */
export async function convertFilesForRegistration(files: {
  logoUrl?: File | null;
  isotopoUrl?: File | null;
  imagotipoUrl?: File | null;
}): Promise<{
  logoImage?: string;
  isotopoImage?: string;
  imagotipoImage?: string;
}> {
  const result: {
    logoImage?: string;
    isotopoImage?: string;
    imagotipoImage?: string;
  } = {};

  try {
    // Convertir logo
    if (files.logoUrl) {
      console.log('🔄 Converting logo to base64...');
      result.logoImage = await fileToBase64Simple(files.logoUrl);
      console.log('✅ Logo converted successfully');
    }

    // Convertir isotopo
    if (files.isotopoUrl) {
      console.log('🔄 Converting isotopo to base64...');
      result.isotopoImage = await fileToBase64Simple(files.isotopoUrl);
      console.log('✅ Isotopo converted successfully');
    }

    // Convertir imagotipo
    if (files.imagotipoUrl) {
      console.log('🔄 Converting imagotipo to base64...');
      result.imagotipoImage = await fileToBase64Simple(files.imagotipoUrl);
      console.log('✅ Imagotipo converted successfully');
    }

    console.log('🎉 All files converted successfully:', {
      logoImage: !!result.logoImage,
      isotopoImage: !!result.isotopoImage,
      imagotipoImage: !!result.imagotipoImage
    });

    return result;

  } catch (error) {
    console.error('💥 Error converting files:', error);
    return {};
  }
}

/**
 * Convierte un archivo File a string base64
 */
function fileToBase64Simple(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    console.log('📁 Converting file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        if (!result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Verificar que el resultado sea un data URL válido
        if (!result.startsWith('data:')) {
          reject(new Error('Invalid file format'));
          return;
        }
        
        console.log(`✅ File converted to base64: ${result.substring(0, 50)}...`);
        resolve(result);
      } catch (error) {
        console.error('❌ Error processing file result:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    // Leer el archivo como data URL (incluye el tipo MIME)
    reader.readAsDataURL(file);
  });
}

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
