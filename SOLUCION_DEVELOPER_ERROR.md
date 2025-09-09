# 🚨 SOLUCIÓN URGENTE: DEVELOPER_ERROR en Google Sign-In Android

## 📋 DIAGNÓSTICO DEL ERROR

**Error**: `DEVELOPER_ERROR: Follow troubleshooting instructions`
**Causa**: El Client ID actual es de tipo "installed application", necesitas un Client ID específico para Android.

### 🔍 Información Detectada:

- **Package Name**: `com.jmovi.frontend` ✅
- **SHA-1 Debug**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` ✅
- **SHA-1 System**: `B4:04:AE:E7:EC:F1:1C:E1:49:47:60:22:18:BB:A3:94:22:58:5C:52` ✅
- **Client ID Actual**: Web/Installed (❌ No funciona para Android)

## 🔧 SOLUCIÓN INMEDIATA (5 minutos)

### Paso 1: Crear Client ID Android en Google Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona proyecto: `white-label-469518`
3. Ve a **APIs & Services** > **Credentials**
4. Clic **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
5. **Application type**: **Android**
6. **Name**: `ProyectoGlobales-Android`
7. **Package name**: `com.jmovi.frontend`
8. **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### Paso 2: Copiar el Nuevo Client ID Android

Una vez creado, copia el nuevo Client ID (será diferente al actual).

### Paso 3: Actualizar Configuración

Reemplaza en los archivos:

#### Frontend .env:

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=TU_NUEVO_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

#### app.json:

```json
{
  "extra": {
    "googleAndroidClientId": "TU_NUEVO_ANDROID_CLIENT_ID.apps.googleusercontent.com"
  }
}
```

## 🔥 WORKAROUND TEMPORAL (Mientras configuras Google Console)

Si necesitas probar **ahora mismo**, prueba usar el Expo Client ID:

```typescript
// En googleAuth.native.service.ts, temporalmente modifica la configuración:
GoogleSignin.configure({
  webClientId: GoogleAuthConfig.webClientId, // Mantén este
  // Comenta estas líneas temporalmente:
  // iosClientId: GoogleAuthConfig.iosClientId,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  profileImageSize: 120,
});
```

## 🛠️ COMANDOS PARA PROBAR DESPUÉS DE LA CONFIGURACIÓN

### Limpiar y reconstruir:

```powershell
cd C:\xampp\htdocs\globales\ProyectoGlobales\frontend
npx expo run:android --clear
```

### Si sigue fallando, limpiar completamente:

```powershell
# Limpiar cache de Metro
npx expo start --clear

# Limpiar build de Android
cd android
./gradlew clean
cd ..

# Reconstruir
npx expo run:android
```

## 📝 SHA-1 Fingerprints Detectados

Usar **cualquiera** de estos en Google Console:

1. **App Debug**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
2. **System Debug**: `B4:04:AE:E7:EC:F1:1C:E1:49:47:60:22:18:BB:A3:94:22:58:5C:52`

**Recomendación**: Usa el **App Debug** (el primero) por ser específico de tu aplicación.

## ✅ VERIFICACIÓN POST-CONFIGURACIÓN

Después de crear el Client ID Android, verifica:

1. **Package name** en Google Console = `com.jmovi.frontend`
2. **SHA-1** en Google Console = `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
3. **Variables de entorno** actualizadas con nuevo Client ID
4. **App reconstruida** con `npx expo run:android --clear`

## 🚨 PUNTOS CRÍTICOS

❌ **NO usar** el Client ID actual (`669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com`) para Android
✅ **SÍ crear** un nuevo Client ID específico para Android
✅ **SÍ usar** el SHA-1 fingerprint correcto
✅ **SÍ verificar** que el package name coincida exactamente

El error debería desaparecer inmediatamente después de crear el Client ID Android correcto. 🎯
