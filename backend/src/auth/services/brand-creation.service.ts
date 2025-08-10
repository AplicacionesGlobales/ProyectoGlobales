import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BrandCreationData } from '../interfaces/brand-registration.interface';

@Injectable()
export class BrandCreationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que el nombre de la marca no esté en uso por el mismo propietario
   * @param name Nombre de la marca
   * @param ownerId ID del propietario
   * @returns Promise<boolean> true si el nombre ya existe
   */
  async validateBrandNameUniqueness(name: string, ownerId: number): Promise<boolean> {
    const existingBrand = await this.prisma.brand.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        ownerId
      }
    });

    return !!existingBrand;
  }

  /**
   * Crea una nueva marca en la base de datos
   * @param brandData Datos de la marca a crear
   * @returns Promise con la marca creada
   */
  async createBrand(brandData: BrandCreationData) {
    return this.prisma.brand.create({
      data: {
        name: brandData.name.trim(),
        description: brandData.description?.trim(),
        address: brandData.address?.trim(),
        phone: brandData.phone?.trim(),
        ownerId: brandData.ownerId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        ownerId: true,
        createdAt: true
      }
    });
  }

  /**
   * Obtiene todas las marcas de un propietario
   * @param ownerId ID del propietario
   * @returns Promise con las marcas del propietario
   */
  async getBrandsByOwner(ownerId: number) {
    return this.prisma.brand.findMany({
      where: {
        ownerId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Verifica si un usuario es propietario de una marca específica
   * @param brandId ID de la marca
   * @param userId ID del usuario
   * @returns Promise<boolean>
   */
  async isUserBrandOwner(brandId: number, userId: number): Promise<boolean> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { ownerId: true }
    });

    return brand?.ownerId === userId;
  }
}
