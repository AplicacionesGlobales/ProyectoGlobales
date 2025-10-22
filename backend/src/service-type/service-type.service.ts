// src/service-type/service-type.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceTypeService {
  constructor(private prisma: PrismaService) {}

  async getServiceTypesByBrand(brandId: number) {
    return this.prisma.serviceType.findMany({
      where: { brandId },
      orderBy: { name: 'asc' },
    });
  }
}
