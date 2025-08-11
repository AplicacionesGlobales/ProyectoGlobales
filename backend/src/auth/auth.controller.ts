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
  ValidateEmailDto,
  ValidateUsernameDto,
  EmailValidationResponseDto,
  UsernameValidationResponseDto,
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar cliente en sucursal' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({ status: 200, description: 'Cliente registrado', type: BaseResponseDto })
  async registerClient(
    @Body(ValidationPipe) registerDto: RegisterClientDto
  ): Promise<BaseResponseDto<AuthResponse>> {
    return this.authService.registerClient(registerDto);
  }


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

  // ==================== EMAIL VALIDATION ENDPOINTS ====================
  
  @Post('validate-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar disponibilidad de email' })
  @ApiBody({ type: ValidateEmailDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Email validado exitosamente',
    type: BaseResponseDto<EmailValidationResponseDto>
  })
  async validateEmail(
    @Body(ValidationPipe) validateEmailDto: ValidateEmailDto
  ): Promise<BaseResponseDto<EmailValidationResponseDto>> {
    return this.authService.validateEmail(validateEmailDto.email, validateEmailDto.brandId);
  }

  @Post('validate-username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar disponibilidad de username' })
  @ApiBody({ type: ValidateUsernameDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Username validado exitosamente',
    type: BaseResponseDto<UsernameValidationResponseDto>
  })
  async validateUsername(
    @Body(ValidationPipe) validateUsernameDto: ValidateUsernameDto
  ): Promise<BaseResponseDto<UsernameValidationResponseDto>> {
    return this.authService.validateUsername(validateUsernameDto.username);
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