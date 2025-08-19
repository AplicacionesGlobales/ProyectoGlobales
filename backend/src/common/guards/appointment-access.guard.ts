// src/common/guards/appointment-access.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { brandId, appointmentId } = request.params;
    const userId = request.user?.userId;

    if (!userId || !brandId) {
      throw new ForbiddenException('Usuario o brand no válido');
    }

    // Verificar si es ROOT del brand
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId: parseInt(brandId),
        userId,
        isActive: true
      },
      include: {
        user: true
      }
    });

    const isRoot = userBrand?.user.role === 'ROOT';

    // Si es ROOT, tiene acceso a todo
    if (isRoot) {
      return true;
    }

    // Si no es ROOT y se está accediendo a una cita específica
    if (appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) }
      });

      if (!appointment || appointment.brandId !== parseInt(brandId)) {
        throw new ForbiddenException('Cita no encontrada');
      }

      // Solo puede acceder si es el cliente de la cita
      if (appointment.clientId !== userId) {
        throw new ForbiddenException('No tiene acceso a esta cita');
      }
    }

    return true;
  }
}
