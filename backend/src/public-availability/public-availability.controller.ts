import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from '../appointments/appointments.service';
import { BaseResponseDto } from '../common/dto';
import { Public } from '../common/decorators';
import { TimeSlotDto } from '../appointments/dto/appointment.dto';
import { PublicAvailableTimeSlotsDto } from './dto/public-availability.dto';

@ApiTags('Public Availability')
@Controller('public/availability')
@Public() // Todo el controller es público
export class PublicAvailabilityController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get(':brandId')
  @ApiOperation({
    summary: 'Obtener slots de tiempo disponibles públicamente',
    description:
      'Retorna los horarios disponibles para una marca específica sin requerir autenticación. Ideal para que clientes puedan ver disponibilidad antes de registrarse.',
  })
  @ApiParam({
    name: 'brandId',
    required: true,
    description: 'ID de la marca para consultar disponibilidad',
    example: 123,
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Fecha para consultar disponibilidad (YYYY-MM-DD)',
    example: '2024-08-20',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    description: 'Duración deseada en minutos',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios disponibles obtenidos exitosamente',
    type: BaseResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Horarios disponibles obtenidos exitosamente',
        data: [
          {
            time: '09:00',
            available: true,
          },
          {
            time: '09:30',
            available: false,
            reason: 'Horario ocupado',
          },
          {
            time: '10:00',
            available: true,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado',
  })
  async getPublicAvailableTimeSlots(
    @Param('brandId') brandId: string,
    @Query(ValidationPipe) query: PublicAvailableTimeSlotsDto,
  ): Promise<BaseResponseDto<TimeSlotDto[]>> {
    // El parámetro ya viene como brandId, directamente lo convertimos
    const parsedBrandId = parseInt(brandId);

    return this.appointmentsService.getAvailableTimeSlots(parsedBrandId, query);
  }
}
