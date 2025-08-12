import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterClientDto,
  AuthResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  ForgotPasswordResponseDto,
  ValidateCodeResponseDto,
  ValidateResetCodeDto,
  ResetPasswordResponseDto,
  LoginRequestDto,
  RefreshRequestDto,
  RefreshResponseDto,
} from './dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BaseResponseDto } from '../common/dto';
import { AUTH_SUCCESS_RESPONSE } from '../common/templates';
import { Public } from '../common/decorators';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ==================== REGISTRATION ENDPOINTS ====================
  @Public()
  @Post('register/client')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar cliente en sucursal' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({ status: 200, description: 'Cliente registrado', type: BaseResponseDto })
  async registerClient(
    @Body(ValidationPipe) registerDto: RegisterClientDto
  ): Promise<BaseResponseDto<AuthResponse>> {
    return this.authService.registerClient(registerDto);
  }


  @Public()
  @Post('register/brand')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar nueva marca con usuario administrador' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ status: 200, description: 'Marca registrada', type: BaseResponseDto })
  async registerBrand(
    @Body(ValidationPipe) createBrandDto: CreateBrandDto
  ): Promise<BaseResponseDto<any>> {
    return this.authService.registerBrand(createBrandDto);
  }

  // ==================== LOGIN ENDPOINTS ====================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: BaseResponseDto<AuthResponse>
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas'
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginRequestDto
  ): Promise<BaseResponseDto<AuthResponse>> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiBody({ type: RefreshRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    type: BaseResponseDto<RefreshResponseDto>
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado'
  })
  async refreshToken(
    @Body(ValidationPipe) refreshDto: RefreshRequestDto
  ): Promise<BaseResponseDto<RefreshResponseDto>> {
    return this.authService.refreshToken(refreshDto);
  }

  /**
   * Login para usuarios ADMIN/ROOT
   */


  // ==================== PASSWORD RESET ENDPOINTS ====================

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código de reset de contraseña' })
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

  @Public()
  @Post('validate-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar código de reset de contraseña' })
  @ApiBody({ type: ValidateResetCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Código validado',
    type: ValidateCodeResponseDto
  })
  async validateResetCode(
    @Body(ValidationPipe) validateCodeDto: ValidateResetCodeDto
  ): Promise<BaseResponseDto<ValidateCodeResponseDto>> {
    return this.authService.validateResetCode(validateCodeDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña con código válido' })
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