# ⚠️ CONFIGURACIÓN ADICIONAL REQUERIDA EN GOOGLE CONSOLE

## 🔍 Análisis de las Credenciales Actuales

Has proporcionado credenciales de **aplicación instalada** (`"installed"`), pero para React Native necesitamos credenciales específicas de **Android** e **iOS**.

### 📋 Credenciales Actuales:

- **Project ID**: `white-label-469518`
- **Client ID**: `669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com`
- **Tipo**: Aplicación instalada (desktop/installed)

## 🚨 Pasos CRÍTICOS para Completar la Configuración

### 1. Crear Credenciales Android en Google Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona proyecto: `white-label-469518`
3. Ve a **APIs & Services** > **Credentials**
4. Clic en **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
5. **Application type**: **Android**
6. **Name**: `ProyectoGlobales-Android`
7. **Package name**: `com.jmovi.frontend`
8. **SHA-1 certificate fingerprint**: Obtener con comandos de abajo

### 2. Crear Credenciales iOS en Google Console

1. En la misma sección de **Credentials**
2. Clic en **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. **Application type**: **iOS**
4. **Name**: `ProyectoGlobales-iOS`
5. **Bundle ID**: `com.jmovi.frontend`

### 3. Obtener SHA-1 Fingerprint para Android

Ejecuta estos comandos en terminal:

```powershell
# Para desarrollo (debug keystore)
cd C:\xampp\htdocs\globales\ProyectoGlobales\frontend\android
./gradlew signingReport

# Si no funciona el anterior, usar keytool directamente
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1

# Buscar una línea como esta:
# SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

### 4. Actualizar Variables de Entorno

Una vez que tengas los nuevos Client IDs de Android e iOS:

#### Backend (.env):

```env
# Mantener el mismo (web client id funciona para backend)
GOOGLE_CLIENT_ID=669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com
```

#### Frontend (.env):

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=TU_NUEVO_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=TU_NUEVO_IOS_CLIENT_ID.apps.googleusercontent.com
```

#### app.json:

```json
{
  "extra": {
    "googleWebClientId": "669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com",
    "googleAndroidClientId": "TU_NUEVO_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    "googleIosClientId": "TU_NUEVO_IOS_CLIENT_ID.apps.googleusercontent.com"
  }
}
```

## 📱 Testing Inmediato Posible

### Opción 1: Testing Web/Expo Go (Recomendado para empezar)

Puedes probar **inmediatamente** usando Expo Go:

```powershell
cd C:\xampp\htdocs\globales\ProyectoGlobales\frontend
npm start
```

Luego escanea el QR con Expo Go app. El Google Sign-In funcionará en modo web.

### Opción 2: Testing con Client ID actual

Como alternativa temporal, puedes usar el mismo Client ID para todas las plataformas y probar:

```powershell
# Ya está configurado en el sistema con el mismo Client ID
# Esto puede funcionar para testing inicial
```

## 🔧 Comandos para Testing Inmediato

### Backend:

```powershell
cd C:\xampp\htdocs\globales\ProyectoGlobales\backend
npm run start:dev
```

### Frontend:

```powershell
cd C:\xampp\htdocs\globales\ProyectoGlobales\frontend
npm start
```

### Testing en Expo Go:

1. Instala **Expo Go** en tu móvil
2. Escanea el QR code
3. Prueba el Google Sign-In

## ✅ Estado Actual del Sistema

✅ **Backend**: Configurado con Client ID real
✅ **Frontend**: Configurado con Client ID (mismo para todas plataformas temporalmente)
✅ **Archivos de configuración**: Actualizados con datos reales
✅ **Listo para testing**: En Expo Go y web

⚠️ **Pendiente**: Crear credenciales específicas Android/iOS para builds nativos

## 🚀 Próximos Pasos

1. **Prueba inmediata**: Usar Expo Go para testing
2. **Crear credenciales Android**: Para builds de desarrollo/producción Android
3. **Crear credenciales iOS**: Para builds de desarrollo/producción iOS
4. **Actualizar Client IDs**: Una vez obtenidos los específicos de cada plataforma

El sistema está **LISTO PARA PROBAR** ahora mismo usando Expo Go! 🎉
