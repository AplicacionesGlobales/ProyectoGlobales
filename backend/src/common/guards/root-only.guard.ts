
// src/common/guards/root-only.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RootOnlyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { brandId } = request.params;
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

    if (!userBrand || userBrand.user.role !== 'ROOT') {
      throw new ForbiddenException('Solo el ROOT puede acceder a este recurso');
    }

    return true;
  }
}