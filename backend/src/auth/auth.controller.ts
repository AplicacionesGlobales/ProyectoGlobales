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
} from './dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BaseResponseDto } from '../common/dto';
import { AUTH_SUCCESS_RESPONSE } from '../common/templates';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ==================== REGISTRATION ENDPOINTS ====================
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


  @Post('register/brand')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary: 'Registrar nueva marca con usuario administrador'})
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({
    status: 201,
    description: 'Marca y usuario administrador creados exitosamente',
    type: () => BaseResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Email ya existe o datos inválidos'
  })
  async registerBrand(
    @Body(ValidationPipe) createBrandDto: CreateBrandDto
  ): Promise<BaseResponseDto<any>> {
    return this.authService.registerBrand(createBrandDto);
  }

  // ==================== EMAIL VALIDATION ENDPOINTS ====================
  
  @Post('validate-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar disponibilidad de email' })
  @ApiResponse({ status: 200, description: 'Email validado' })
  async validateEmail(@Body() { email, brandId }: { email: string; brandId?: number }) {
    return this.authService.validateEmail(email, brandId);
  }

  // ==================== LOGIN ENDPOINTS ====================

  
  /**
   * Login para usuarios ADMIN/ROOT
   */


  // ==================== PASSWORD RESET ENDPOINTS ====================

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