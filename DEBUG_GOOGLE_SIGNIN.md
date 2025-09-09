# 🔧 Script de Testing y Debug para Google Sign-In

## 📋 PROBLEMA ACTUAL

**Error**: `DEVELOPER_ERROR` en Android al usar Google Sign-In
**Causa Root**: Client ID no es específico para Android

## 🚀 PASOS PARA RESOLVER

### 1. Limpiar y Reconstruir (OBLIGATORIO)

```powershell
cd C:\xampp\htdocs\globales\ProyectoGlobales\frontend

# Limpiar Metro cache
npx expo start --clear

# Limpiar Android build
cd android
./gradlew clean
cd ..

# Reconstruir app
npx expo run:android --clear
```

### 2. Crear Client ID Android en Google Console

**URGENTE**: Ve a [Google Cloud Console](https://console.cloud.google.com) y:

1. Proyecto: `white-label-469518`
2. **APIs & Services** > **Credentials**
3. **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
4. **Application type**: **Android**
5. **Package name**: `com.jmovi.frontend`
6. **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### 3. Actualizar Client ID Android

Una vez creado el nuevo Client ID Android:

```env
# En .env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=TU_NUEVO_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

```json
// En app.json
{
  "extra": {
    "googleAndroidClientId": "TU_NUEVO_ANDROID_CLIENT_ID.apps.googleusercontent.com"
  }
}
```

### 4. Comandos de Debug

```powershell
# Ver logs detallados mientras pruebas
npx expo run:android

# En otra terminal, ver logs específicos
adb logcat | findstr "Google\|Auth\|Error"
```

## 🔍 DEBUGGING ACTUAL

### Información de Sistema:

- **Package Name**: `com.jmovi.frontend` ✅
- **SHA-1 App**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` ✅
- **SHA-1 System**: `B4:04:AE:E7:EC:F1:1C:E1:49:47:60:22:18:BB:A3:94:22:58:5C:52` ✅
- **Client ID Actual**: `669086356546-gjd6uud9egbg1in8svp1ll8omej0brf4.apps.googleusercontent.com` (❌ Tipo: installed)

### Logs Esperados (Después de la Solución):

```
✅ Google Sign-In configurado correctamente
🔧 Config utilizada: {"webClientId": "669086356546-ara22s...", "hasIosClientId": false, "offlineAccess": true}
📱 Verificando Google Play Services...
✅ Google Play Services disponibles
🔐 Iniciando proceso de autenticación...
✅ Google Sign-In exitoso
```

### Logs de Error Actuales:

```
❌ Error en Google Sign-In: [Error: DEVELOPER_ERROR: Follow troubleshooting instructions...]
🚨 SOLUCIÓN: Ve a SOLUCION_DEVELOPER_ERROR.md para instrucciones completas
```

## ⚡ TESTING ALTERNATIVO (Mientras configuras Google Console)

### Opción 1: Testing en Expo Go

```powershell
npx expo start
# Escanear QR con Expo Go - debería funcionar en modo web
```

### Opción 2: Testing Web

```powershell
npx expo start --web
# Probar Google Sign-In en navegador
```

## 📝 CHECKLIST DE VERIFICACIÓN

Pre-configuración:

- [ ] SHA-1 fingerprint obtenido: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] Package name verificado: `com.jmovi.frontend`
- [ ] Project ID Google: `white-label-469518`

Google Console:

- [ ] Client ID Android creado
- [ ] SHA-1 fingerprint agregado en Google Console
- [ ] Package name agregado en Google Console

App Configuration:

- [ ] Nuevo Client ID Android en .env
- [ ] Nuevo Client ID Android en app.json
- [ ] App limpiada y reconstruida

Testing:

- [ ] Google Sign-In funciona sin DEVELOPER_ERROR
- [ ] ID Token se genera correctamente
- [ ] Backend valida token exitosamente

## 🚨 SI SIGUE FALLANDO

1. **Verificar Google Console**:

   - Client ID es tipo "Android" (no "Web" o "Installed")
   - SHA-1 fingerprint es exactamente: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Package name es exactamente: `com.jmovi.frontend`

2. **Verificar Configuración Local**:

   ```powershell
   # Verificar variables de entorno
   echo $env:EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID

   # Verificar app.json
   cat app.json | findstr "googleAndroidClientId"
   ```

3. **Limpiar Completamente**:

   ```powershell
   # Eliminar node_modules y reinstalar
   rm -rf node_modules
   npm install

   # Limpiar Android completamente
   cd android
   ./gradlew clean
   rm -rf build
   cd app
   rm -rf build
   cd ../..

   # Reconstruir
   npx expo run:android --clear
   ```

## 🎯 RESULTADO ESPERADO

Después de configurar correctamente:

- ✅ Google Sign-In se abre sin errores
- ✅ Usuario puede seleccionar cuenta
- ✅ Se obtiene ID Token
- ✅ Backend valida el token
- ✅ Usuario es autenticado exitosamente

**ETA para solución**: 5-10 minutos configurando Google Console + 2-3 minutos rebuilding app
