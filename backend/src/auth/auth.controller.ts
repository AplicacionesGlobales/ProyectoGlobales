import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { 
  RegisterClientDto, 
  AuthResponse,
  ForgotPasswordDto,
  ValidateResetTokenDto,
  ResetPasswordDto,
  ForgotPasswordResponseDto,
  ValidateTokenResponseDto,
  ResetPasswordResponseDto
} from './dto';
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

  // ==================== PASSWORD RESET ENDPOINTS ====================

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar reset de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitud de reset procesada exitosamente',
    type: ForgotPasswordResponseDto
  })
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto
  ): Promise<BaseResponseDto<ForgotPasswordResponseDto>> {
    return this.authService.requestPasswordReset(forgotPasswordDto);
  }

  @Post('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar token de reset de contraseña' })
  @ApiBody({ type: ValidateResetTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token validado',
    type: ValidateTokenResponseDto
  })
  async validateResetToken(
    @Body(ValidationPipe) validateTokenDto: ValidateResetTokenDto
  ): Promise<BaseResponseDto<ValidateTokenResponseDto>> {
    return this.authService.validateResetToken(validateTokenDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña con token válido' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña actualizada exitosamente',
    type: ResetPasswordResponseDto
  })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
  ): Promise<BaseResponseDto<ResetPasswordResponseDto>> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}