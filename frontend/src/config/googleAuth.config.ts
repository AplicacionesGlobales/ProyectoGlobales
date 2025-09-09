import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const GoogleAuthConfig = {
    webClientId: Constants.expoConfig?.extra?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ['email', 'profile'],
};

// ✅ CORREGIR ESTA FUNCIÓN
export const getGoogleClientId = (): string => {
    // SIEMPRE usar webClientId para la configuración del SDK
    return GoogleAuthConfig.webClientId;
};