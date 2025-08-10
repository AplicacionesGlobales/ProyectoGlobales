import { SWAGGER_EXAMPLES, SWAGGER_NUMBERS } from '../constants';

export const AUTH_SUCCESS_RESPONSE = {
  type: 'object',
  properties: {
    successful: { type: 'boolean', example: true },
    data: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: SWAGGER_NUMBERS.USER_ID },
            email: { type: 'string', example: SWAGGER_EXAMPLES.EMAIL },
            username: { type: 'string', example: SWAGGER_EXAMPLES.USERNAME },
            firstName: { type: 'string', example: SWAGGER_EXAMPLES.FIRST_NAME },
            lastName: { type: 'string', example: SWAGGER_EXAMPLES.LAST_NAME },
            role: { type: 'string', example: 'CLIENT' }
          }
        },
        branch: {
          type: 'object',
          properties: {
            id: { type: 'number', example: SWAGGER_NUMBERS.BRANCH_ID },
            name: { type: 'string', example: SWAGGER_EXAMPLES.BRANCH_NAME },
            businessName: { type: 'string', example: SWAGGER_EXAMPLES.BUSINESS_NAME }
          }
        },
        token: { type: 'string', example: SWAGGER_EXAMPLES.TOKEN }
      }
    }
  }
};
