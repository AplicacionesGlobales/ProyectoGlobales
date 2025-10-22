import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { AppointmentsReportDto } from './dto/appointments-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateAppointmentsReport(
    brandId: number,
    filters: AppointmentsReportDto,
  ): Promise<Buffer> {
    // Validar que el brand existe
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand no encontrado');
    }

    // Construir filtros
    const where: any = { brandId };

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.startTime.lte = endDate;
      }

      // Validar rango máximo de 1 año
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        const diffDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 365) {
          throw new BadRequestException(
            'El rango de fechas no puede ser mayor a 1 año',
          );
        }
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Consultar citas
    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Generar Excel
    return this.createExcelFile(appointments, brand.name);
  }

  private async createExcelFile(
    appointments: any[],
    brandName: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Citas');

    // Configurar columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Hora Inicio', key: 'startTime', width: 12 },
      { header: 'Hora Fin', key: 'endTime', width: 12 },
      { header: 'Cliente', key: 'client', width: 25 },
      { header: 'Servicio', key: 'service', width: 20 },
      { header: 'Duración (min)', key: 'duration', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];

    // Estilizar header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Agregar datos
    appointments.forEach((apt) => {
      const startTime = new Date(apt.startTime);
      const endTime = new Date(apt.endTime);

      worksheet.addRow({
        id: apt.id,
        date: startTime.toLocaleDateString('es-ES'),
        startTime: startTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        endTime: endTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        client: apt.client
          ? `${apt.client.firstName} ${apt.client.lastName || ''}`.trim()
          : 'Sin asignar',
        service: apt.serviceType?.name || 'Sin servicio',
        duration: apt.duration,
        status: this.translateStatus(apt.status),
        notes: apt.notes || '',
      });
    });

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Filas alternas
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        });
      }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private translateStatus(status: string): string {
    const translations: { [key: string]: string } = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'No Asistió',
    };
    return translations[status] || status;
  }
}
