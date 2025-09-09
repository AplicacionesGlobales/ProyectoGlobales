# Testing Script para Google Sign-In Implementation

## Fase 6: Testing y Validación

### Pre-requisitos para testing

Antes de ejecutar las pruebas, asegúrate de:

1. **Configurar Google Cloud Console** (ver `GOOGLE_CONSOLE_SETUP.md`)
2. **Actualizar variables de entorno** con valores reales
3. **Descargar y colocar archivos de configuración** reales

### 1. Testing Backend

#### Verificar configuración de variables de entorno:

```powershell
# En el directorio backend
cd backend
echo $env:GOOGLE_CLIENT_ID
echo $env:GOOGLE_CLIENT_SECRET
```

#### Testing manual del endpoint:

```powershell
# Iniciar el servidor backend
cd backend
npm run start:dev
```

```bash
# En otra terminal, probar el endpoint (requiere un idToken real de Google)
curl -X POST http://localhost:3000/auth/google/validate \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "TU_ID_TOKEN_REAL_AQUI",
    "brandId": 8,
    "rememberMe": true
  }'
```

#### Testing con Thunder Client/Postman:

1. **Method**: POST
2. **URL**: `http://localhost:3000/auth/google/validate`
3. **Headers**:
   ```
   Content-Type: application/json
   ```
4. **Body**:
   ```json
   {
     "idToken": "GOOGLE_ID_TOKEN_REAL",
     "brandId": 8,
     "rememberMe": true
   }
   ```

### 2. Testing Frontend

#### Verificar configuración:

```powershell
# En el directorio frontend
cd frontend
echo $env:EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
echo $env:EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
echo $env:EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
```

#### Iniciar la aplicación:

```powershell
cd frontend
npm start
```

#### Testing en diferentes plataformas:

```powershell
# Android (requiere emulador o dispositivo)
npm run android

# iOS (requiere macOS y Xcode)
npm run ios

# Web (para testing básico)
npm run web
```

### 3. Testing Flow Completo

#### Escenario 1: Nuevo usuario con Google

1. **Acción**: Presionar "Continuar con Google" en pantalla de registro
2. **Esperado**:
   - Se abre popup/modal de Google Sign-In
   - Usuario selecciona cuenta de Google
   - Se crea nuevo usuario en backend
   - Se crea UserBrand para brandId
   - Usuario es redirigido a dashboard

#### Escenario 2: Usuario existente con Google

1. **Acción**: Presionar "Continuar con Google" en pantalla de login
2. **Esperado**:
   - Se abre popup/modal de Google Sign-In
   - Usuario selecciona cuenta
   - Backend encuentra usuario existente
   - Usuario es redirigido según su rol

#### Escenario 3: Error handling

1. **Usuario cancela Google Sign-In**
   - **Esperado**: Mensaje de error amigable, no crash
2. **Token inválido**
   - **Esperado**: Error 401, mensaje de error apropiado
3. **Problemas de red**
   - **Esperado**: Mensaje de error de conectividad

### 4. Debug y Logs

#### Backend logs a verificar:

```bash
# Logs exitosos
✅ Google Sign-In configurado correctamente
✅ Token validado para usuario: user@example.com
✅ Usuario autenticado exitosamente
✅ UserBrand creado/encontrado para brandId: 8

# Logs de error a monitorear
❌ Error validando token de Google
❌ Error creando usuario
❌ Error en loginWithGoogle
```

#### Frontend logs a verificar:

```bash
# En React Native Debugger o console del dispositivo
✅ Google Sign-In configurado correctamente
✅ Token obtenido: ey...
✅ Respuesta del backend: {...}
✅ Usuario autenticado, navegando a dashboard

# Logs de error
❌ Error en Google Sign-In
❌ Error de red al autenticar
❌ Error: Token inválido
```

### 5. Verificaciones de Seguridad

#### Validar tokens:

1. **ID Tokens deben ser válidos** y verificables en [JWT.io](https://jwt.io)
2. **Tokens deben expirar** apropiadamente
3. **RefreshTokens deben funcionar** correctamente
4. **No debe haber tokens hardcodeados** en el código

#### Validar datos:

1. **Emails deben coincidir** entre Google y base de datos
2. **UserBrand debe crearse** con brandId correcto
3. **Roles deben asignarse** correctamente
4. **No debe haber data leakage** entre marcas

### 6. Performance Testing

#### Tiempo de respuesta:

1. **Google Sign-In**: < 3 segundos
2. **Backend validation**: < 500ms
3. **Total flow**: < 5 segundos

#### Memory leaks:

```bash
# Verificar que no haya memory leaks después de multiple sign-ins
# Usar herramientas de profiling de React Native
```

### 7. Comandos de Debugging

#### Backend debugging:

```powershell
cd backend
# Modo debug con logs detallados
npm run start:debug

# Ver logs en tiempo real
npm run start:dev | findstr "Google\|Auth\|Error"
```

#### Frontend debugging:

```powershell
cd frontend
# Debugging con React Native Debugger
npm start

# Logs específicos de Google Auth
npx react-native log-android | findstr "Google\|Auth"
npx react-native log-ios | grep "Google\|Auth"
```

### 8. Testing de Regresión

Después de implementar Google Sign-In, verificar que:

1. **Login tradicional sigue funcionando**
2. **Registro tradicional sigue funcionando**
3. **Refresh tokens siguen funcionando**
4. **Navegación sigue funcionando**
5. **Multi-tenant sigue funcionando**

### 9. Checklist Final

- [ ] Variables de entorno configuradas
- [ ] Google Cloud Console configurado
- [ ] Archivos google-services.json/GoogleService-Info.plist en lugar
- [ ] Backend inicia sin errores
- [ ] Frontend compila sin errores
- [ ] Google Sign-In funciona en Android
- [ ] Google Sign-In funciona en iOS
- [ ] Nuevos usuarios se crean correctamente
- [ ] Usuarios existentes pueden loguearse
- [ ] Error handling funciona
- [ ] Performance es aceptable
- [ ] Logs son informativos
- [ ] Seguridad validada
- [ ] Tests de regresión pasados

### 10. Troubleshooting Común

#### Error: "Sign in failed"

```bash
# Verificar SHA-1 fingerprint
cd frontend/android
./gradlew signingReport
```

#### Error: "Network error"

```bash
# Verificar conectividad
ping google.com
# Verificar backend
curl http://localhost:3000/health
```

#### Error: "Invalid client"

```bash
# Verificar package name en app.json
# Verificar google-services.json
```

#### Error: "Token invalid"

```bash
# Verificar GOOGLE_CLIENT_ID en backend
# Verificar que los Client IDs coinciden
```

### 11. Comandos de Limpieza

```powershell
# Limpiar cache de Expo
cd frontend
npx expo start --clear

# Limpiar node_modules
rm -rf node_modules
npm install

# Reset de Google Sign-In
# En Android: Settings > Apps > Your App > Storage > Clear Data
# En iOS: Desinstalar y reinstalar app
```
