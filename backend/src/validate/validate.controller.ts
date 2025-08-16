// backend\src\validate\validate.controller.ts
import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ValidateService } from './validate.service';
import {
  ValidateEmailDto,
  ValidateUsernameDto,
  EmailValidationResponseDto,
  UsernameValidationResponseDto,
  PaymentValidationResponseDto,
  ValidatePaymentDto
} from './dto';
import { BaseResponseDto } from '../common/dto';
import { Public } from '../common/decorators';

@ApiTags('Validación')
@Controller('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) { }

  @Public()
  @Post('email')
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
    return this.validateService.validateEmail(validateEmailDto.email, validateEmailDto.brandId);
  }

  @Public()
  @Post('username')
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
    return this.validateService.validateUsername(validateUsernameDto.username);
  }

 @Public()
  @Post('payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar estado de pago de un brand' })
  @ApiBody({ type: ValidatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Estado de pago validado',
    type: BaseResponseDto<PaymentValidationResponseDto>
  })
  async validatePayment(
    @Body(ValidationPipe) validatePaymentDto: ValidatePaymentDto
  ): Promise<BaseResponseDto<PaymentValidationResponseDto>> {
    return this.validateService.validatePayment(validatePaymentDto.brandId);
  }

}
