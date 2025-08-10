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
} as const;

export const ERROR_CODES = {
  USERNAME_EXISTS: 1001,
  BRANCH_NOT_EXISTS: 1002,
  EMAIL_EXISTS_IN_BRANCH: 1003,
  INTERNAL_ERROR: 5000,
} as const;
