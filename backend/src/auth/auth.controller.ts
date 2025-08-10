import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterClientDto, AuthResponse } from './dto';
import { BaseResponseDto } from '../common/dto';
import { AUTH_SUCCESS_RESPONSE } from '../common/templates';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/client')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar cliente en sucursal' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente', schema: AUTH_SUCCESS_RESPONSE })
  async registerClient(
    @Body(ValidationPipe) registerDto: RegisterClientDto
  ): Promise<BaseResponseDto<AuthResponse>> {
    return this.authService.registerClient(registerDto);
  }
}
