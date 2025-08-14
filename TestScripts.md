# Comandos de Desarrollo

## 🏗️ Backend (NestJS)
```bash
cd backend
npx tsc --noEmit
npm run test
```

## 📱 Frontend (React Native)
```bash
cd frontend
npx tsc --noEmit
```

## 🌐 Landing (NextJS)
```bash
cd landing
npx tsc --noEmit
```

## ⚡ Antes de hacer PR
Ejecuta estos comandos en tu proyecto para asegurar que pase el CI:

- **TypeScript**: `npx tsc --noEmit`
- **Tests** (solo backend): `npm run test`

## 🚀 CI/CD
El pipeline se ejecuta automáticamente en PRs a `develop` o `main`.