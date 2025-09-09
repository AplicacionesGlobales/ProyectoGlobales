# Configuración de Google Cloud Console

## Pasos para configurar Google OAuth 2.0

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "ProyectoGlobales-OAuth"

### 2. Habilitar Google Sign-In API

1. Ve a **APIs & Services** > **Library**
2. Busca "Google Sign-In API" o "Google+ API"
3. Haz clic en **Enable**

### 3. Configurar pantalla de consentimiento OAuth

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** (para usuarios externos)
3. Completa la información requerida:
   - **App name**: ProyectoGlobales
   - **User support email**: tu-email@dominio.com
   - **Developer contact information**: tu-email@dominio.com
4. En **Scopes**, agrega:
   - `email`
   - `profile`
   - `openid`
5. Agrega usuarios de prueba si es necesario

### 4. Crear credenciales OAuth 2.0

#### Para aplicación web (backend):

1. Ve a **APIs & Services** > **Credentials**
2. Clic en **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. **Application type**: Web application
4. **Name**: ProyectoGlobales-Web
5. **Authorized redirect URIs**:
   - `http://localhost:3000/auth/google/callback` (desarrollo)
   - `https://tu-dominio.com/auth/google/callback` (producción)

#### Para aplicación Android:

1. **Application type**: Android
2. **Name**: ProyectoGlobales-Android
3. **Package name**: `com.jmovi.frontend`
4. **SHA-1 certificate fingerprint**:

   **Para desarrollo (debug keystore):**

   ```bash
   cd frontend/android/app
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   **Para producción:**

   ```bash
   keytool -list -v -keystore ruta/a/tu/keystore.jks -alias tu-alias
   ```

#### Para aplicación iOS:

1. **Application type**: iOS
2. **Name**: ProyectoGlobales-iOS
3. **Bundle ID**: `com.jmovi.frontend`

### 5. Descargar archivos de configuración

#### Para Android:

1. Descarga `google-services.json`
2. Colócalo en `frontend/google-services.json`

#### Para iOS:

1. Descarga `GoogleService-Info.plist`
2. Colócalo en `frontend/GoogleService-Info.plist`

### 6. Actualizar variables de entorno

Copia los Client IDs y actualiza:

#### Backend (.env):

```env
GOOGLE_CLIENT_ID=tu_web_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
```

#### Frontend (.env):

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu_android_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu_ios_client_id.apps.googleusercontent.com
```

#### Frontend (app.json):

```json
{
  "extra": {
    "googleWebClientId": "tu_web_client_id.apps.googleusercontent.com",
    "googleAndroidClientId": "tu_android_client_id.apps.googleusercontent.com",
    "googleIosClientId": "tu_ios_client_id.apps.googleusercontent.com"
  }
}
```

### 7. Comandos para obtener SHA-1 (Android)

```bash
# Desarrollo (debug keystore)
cd frontend
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Si no existe debug keystore
cd android
./gradlew signingReport

# Para producción
keytool -list -v -keystore release.keystore -alias release
```

### 8. Verificar configuración

1. **Backend**: El Client ID web debe coincidir con `GOOGLE_CLIENT_ID`
2. **Frontend**: Los Client IDs deben estar en variables de entorno y app.json
3. **Android**: `google-services.json` debe estar en la raíz del proyecto frontend
4. **iOS**: `GoogleService-Info.plist` debe estar en la raíz del proyecto frontend

### 9. Testing

Una vez configurado todo:

1. Reinicia el servidor backend
2. Reinicia la aplicación frontend
3. Prueba el login con Google en un dispositivo/emulador

### Notas importantes:

- Los Client IDs deben ser únicos para cada plataforma
- El SHA-1 fingerprint debe coincidir exactamente
- Para producción, usa certificados de release
- Los archivos `google-services.json` y `GoogleService-Info.plist` contienen información sensible
- Agrega estos archivos a `.gitignore` si contienen datos de producción

### Troubleshooting común:

1. **Error "Sign in failed"**: Verificar SHA-1 fingerprint
2. **Error "Invalid client"**: Verificar package name/bundle ID
3. **Error "Unauthorized"**: Verificar authorized redirect URIs
4. **Error en iOS**: Verificar que `GoogleService-Info.plist` esté correctamente configurado
