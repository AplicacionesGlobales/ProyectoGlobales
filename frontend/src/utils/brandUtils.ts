// utils/brandUtils.ts
import Constants from 'expo-constants';

/**
 * Obtener el Brand ID desde las variables de entorno
 */
export const getBrandId = (): number => {
  const envBrandId = process.env.EXPO_PUBLIC_BRAND_ID;
  const configBrandId = Constants.expoConfig?.extra?.brand_id;
  const finalBrandId = envBrandId || configBrandId;
  
  console.log('🏷️ Brand ID debug:', {
    envBrandId,
    configBrandId,
    finalBrandId,
    parsed: parseInt(finalBrandId) || 1
  });
  
  const parsedBrandId = parseInt(finalBrandId) || 1; // Fallback a 1 si no se encuentra
  console.log('🏷️ Usando brandId final:', parsedBrandId);
  
  return parsedBrandId;
};