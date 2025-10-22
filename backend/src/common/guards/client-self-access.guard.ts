import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientSelfAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const brandId = parseInt(request.params.brandId);

    if (!user || !brandId) {
      throw new ForbiddenException('Access denied');
    }

    // Verificar que el usuario tenga acceso a este brand como cliente
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId,
        userId: user.userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            role: true,
            isActive: true,
          },
        },
      },
    });

    // Solo clientes activos pueden acceder a su propio perfil
    if (
      !userBrand ||
      userBrand.user.role !== 'CLIENT' ||
      !userBrand.user.isActive
    ) {
      throw new ForbiddenException('Client access denied or account inactive');
    }

    return true;
  }
}
