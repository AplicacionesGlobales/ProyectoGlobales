import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AppointmentsReportDto } from './dto/appointments-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/brands/:brandId/reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('appointments')
  @ApiOperation({
    summary: 'Descargar reporte de citas en Excel',
    description:
      'Genera y descarga un archivo Excel con las citas del brand. Solo disponible para usuarios ROOT/ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a este recurso',
  })
  @ApiResponse({ status: 404, description: 'Brand no encontrado' })
  async downloadAppointmentsReport(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query() filters: AppointmentsReportDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    // Validar que el usuario es ROOT o ADMIN del brand
    await this.validateRootOrAdmin(brandId, req.user.userId);

    // Generar reporte
    const buffer = await this.reportsService.generateAppointmentsReport(
      brandId,
      filters,
    );

    // Generar nombre del archivo
    const date = new Date().toISOString().split('T')[0];
    const filename = `citas-${brandId}-${date}.xlsx`;

    // Configurar headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Enviar archivo
    res.send(buffer);
  }

  private async validateRootOrAdmin(
    brandId: number,
    userId: number,
  ): Promise<void> {
    // Verificar si es el dueño del brand
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { ownerId: true },
    });

    if (brand?.ownerId === userId) {
      return; // Es el dueño, tiene acceso
    }

    // Verificar si es ROOT o ADMIN
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId,
        userId,
        isActive: true,
      },
      include: {
        user: {
          select: { role: true },
        },
      },
    });

    const isRootOrAdmin =
      userBrand?.user.role === 'ROOT' || userBrand?.user.role === 'ADMIN';

    if (!isRootOrAdmin) {
      throw new ForbiddenException(
        'Solo usuarios ROOT o ADMIN pueden descargar reportes',
      );
    }
  }
}
