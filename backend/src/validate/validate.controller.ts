// backend\src\validate\validate.controller.ts
import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ValidateService } from './validate.service';
import {
  ValidateEmailDto,
  ValidateUsernameDto,
  EmailValidationResponseDto,
  UsernameValidationResponseDto,
  PaymentValidationResponseDto,
  ValidatePaymentDto,
  ValidateCalendarDto,
  CalendarValidationResponseDto
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

  @Public()
  @Get('calendar-available/:brandId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar disponibilidad de calendario',
    description: 'Valida si un día y hora específicos están disponibles para un brand sin requerir autenticación'
  })
  @ApiParam({
    name: 'brandId',
    required: true,
    description: 'ID del brand para validar',
    example: 123
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Fecha para validar (YYYY-MM-DD)',
    example: '2024-12-25'
  })
  @ApiQuery({
    name: 'time',
    required: true,
    description: 'Hora para validar (HH:MM)',
    example: '14:30'
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad validada exitosamente',
    type: BaseResponseDto<CalendarValidationResponseDto>,
    schema: {
      example: {
        success: true,
        message: "Disponibilidad validada exitosamente",
        data: {
          isAvailable: true,
          message: "Horario disponible",
          date: "2024-12-25",
          time: "14:30"
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos'
  })
  @ApiResponse({
    status: 404,
    description: 'Brand no encontrado'
  })
  async validateCalendarAvailable(
    @Param('brandId') brandId: string,
    @Query(ValidationPipe) query: ValidateCalendarDto
  ): Promise<BaseResponseDto<CalendarValidationResponseDto>> {
    const parsedBrandId = parseInt(brandId);
    return this.validateService.validateCalendarAvailable(parsedBrandId, query);
  }

}
