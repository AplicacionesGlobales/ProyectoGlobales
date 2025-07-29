import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verifica que el servicio esté corriendo' })
  @ApiResponse({ status: 200, description: 'El servicio está vivo.' })
  getHealth() {
    return this.healthService.getHealth();
  }
}
