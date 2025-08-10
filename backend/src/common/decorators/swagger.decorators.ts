import { ApiProperty } from '@nestjs/swagger';
import { SWAGGER_EXAMPLES, SWAGGER_NUMBERS } from '../constants';

export const ApiEmail = () => 
  ApiProperty({ example: SWAGGER_EXAMPLES.EMAIL });

export const ApiUsername = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.USERNAME });

export const ApiPassword = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.PASSWORD });

export const ApiFirstName = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.FIRST_NAME, required: false });

export const ApiLastName = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.LAST_NAME, required: false });

export const ApiBranchId = () =>
  ApiProperty({ example: SWAGGER_NUMBERS.BRANCH_ID });

export const ApiUserId = () =>
  ApiProperty({ example: SWAGGER_NUMBERS.USER_ID });

export const ApiToken = () =>
  ApiProperty({ example: SWAGGER_EXAMPLES.TOKEN });
