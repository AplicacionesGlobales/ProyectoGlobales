import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const brandId = parseInt(request.params.brandId);

    if (!user || !brandId) {
      throw new ForbiddenException('Access denied');
    }

    // Verificar que el usuario tenga acceso a este brand
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId,
        userId: user.userId,
        isActive: true
      },
      include: {
        user: {
          select: {
            role: true
          }
        }
      }
    });

    // Solo ROOT y ADMIN pueden acceder a la administración del brand
    if (!userBrand || !['ROOT', 'ADMIN'].includes(userBrand.user.role)) {
      throw new ForbiddenException('Insufficient permissions for this brand');
    }

    return true;
  }
}