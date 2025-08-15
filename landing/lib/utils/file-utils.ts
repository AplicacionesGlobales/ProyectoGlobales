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
export const convertFilesForRegistration = async (files: {
  logoUrl?: File;
  isotopoUrl?: File;
  imagotipoUrl?: File;
}): Promise<{
  logoImage?: string;
  isotopoImage?: string;
  imagotipoImage?: string;
}> => {
  const result: {
    logoImage?: string;
    isotopoImage?: string;
    imagotipoImage?: string;
  } = {};

  try {
    if (files.logoUrl) {
      const logoResult = await fileToBase64(files.logoUrl);
      result.logoImage = logoResult.base64;
    }

    if (files.isotopoUrl) {
      const isotopoResult = await fileToBase64(files.isotopoUrl);
      result.isotopoImage = isotopoResult.base64;
    }

    if (files.imagotipoUrl) {
      const imagotipoResult = await fileToBase64(files.imagotipoUrl);
      result.imagotipoImage = imagotipoResult.base64;
    }

    return result;
  } catch (error) {
    console.error('Error converting files for registration:', error);
    throw new Error('Failed to process images for registration');
  }
};
