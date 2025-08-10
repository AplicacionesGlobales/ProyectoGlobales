import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Salud')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verificar estado del servicio' })
  getHealth() {
    return this.healthService.getHealth();
  }
}
