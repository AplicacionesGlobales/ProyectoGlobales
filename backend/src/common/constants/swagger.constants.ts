// Constantes para ejemplos en Swagger
export const SWAGGER_EXAMPLES = {
  EMAIL: 'user@gmail.com',
  USERNAME: 'username',
  PASSWORD: 'password',
  FIRST_NAME: 'John',
  LAST_NAME: 'Doe',
  BUSINESS_NAME: 'Business Name',
  BRANCH_NAME: 'Branch Name',
  ADDRESS: '123 Main Street',
  PHONE: '+1234567890',
  TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
} as const;

export const SWAGGER_NUMBERS = {
  USER_ID: 1,
  BRANCH_ID: 1,
  BUSINESS_ID: 1,
  ERROR_CODE: 1001,
} as const;

export const ERROR_MESSAGES = {
  USERNAME_EXISTS: 'El username ya está en uso',
  BRANCH_NOT_EXISTS: 'La sucursal no existe',
  EMAIL_EXISTS_IN_BRANCH: 'Ya existe una cuenta con este email en esta sucursal',
  INTERNAL_ERROR: 'Error interno del servidor',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  USERNAME_ALREADY_EXISTS: 'El username ya está en uso',
  INVALID_COLOR_FORMAT: 'Formato de color inválido',
  WEAK_PASSWORD: 'La contraseña no cumple con los requisitos de seguridad',
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  FORBIDDEN: 'Acceso denegado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
  BRAND_NOT_EXISTS: 'La marca no existe',
  USER_INACTIVE: 'Usuario inactivo',
  EMAIL_EXISTS: 'El email ya está registrado',
} as const;

export const ERROR_CODES = {
  USERNAME_EXISTS: 1001,
  BRANCH_NOT_EXISTS: 1002,
  EMAIL_EXISTS_IN_BRANCH: 1003,
  EMAIL_ALREADY_EXISTS: 1004,
  USERNAME_ALREADY_EXISTS: 1005,
  EMAIL_EXISTS: 1006,
  INVALID_COLOR_FORMAT: 1007,
  WEAK_PASSWORD: 1008,
  USER_NOT_FOUND: 2000,
  INVALID_CREDENTIALS: 2001,
  FORBIDDEN: 2002,
  INSUFFICIENT_PERMISSIONS: 2003,
  BRAND_NOT_EXISTS: 2004,
  USER_INACTIVE: 2005,
  INTERNAL_ERROR: 5000,
} as const;
