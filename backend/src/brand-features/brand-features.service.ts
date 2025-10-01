// src/brand-features/brand-features.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import {
  FeatureDto,
  BrandFeatureDto,
  FeatureCategory,
  CreateFeatureDto
} from './dto/brand-feature.dto';
import { FeatureCategory as PrismaFeatureCategory } from '../../generated/prisma';

@Injectable()
export class BrandFeaturesService {
  constructor(private prisma: PrismaService) { }

  // Validar si es dueño del brand
  private async validateBrandOwner(brandId: number, userId: number): Promise<void> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { ownerId: true }
    });

    if (!brand) {
      throw new NotFoundException('Brand no encontrado');
    }

    if (brand.ownerId !== userId) {
      throw new ForbiddenException('Solo el dueño del brand puede realizar esta acción');
    }
  }

  // Mapear Feature a DTO
  private mapFeatureToDto(feature: any): FeatureDto {
    return {
      id: feature.id,
      key: feature.key,
      title: feature.title,
      subtitle: feature.subtitle,
      description: feature.description,
      price: parseFloat(feature.price.toString()),
      isActive: feature.isActive,
      businessTypes: feature.businessTypes,
      category: feature.category as FeatureCategory,
      isPopular: feature.isPopular,
      isRecommended: feature.isRecommended,
      order: feature.order,
      createdAt: feature.createdAt.toISOString(),
      updatedAt: feature.updatedAt.toISOString()
    };
  }

  // Mapear BrandFeature a DTO
  private mapBrandFeatureToDto(brandFeature: any): BrandFeatureDto {
    return {
      id: brandFeature.id,
      brandId: brandFeature.brandId,
      featureId: brandFeature.featureId,
      isActive: brandFeature.isActive,
      createdAt: brandFeature.createdAt.toISOString(),
      updatedAt: brandFeature.updatedAt.toISOString(),
      feature: this.mapFeatureToDto(brandFeature.feature)
    };
  }

  // 1. Obtener todos los features disponibles - PÚBLICO
  async getAllFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      const featuresDto = features.map(feature => this.mapFeatureToDto(feature));

      return BaseResponseDto.success(featuresDto);
    } catch (error) {
      console.error('Error getting all features:', error);
      throw error;
    }
  }

  // 2. Obtener features asignados a un brand - PÚBLICO
  async getBrandFeatures(brandId: number): Promise<BaseResponseDto<BrandFeatureDto[]>> {
    try {
      // Verificar que el brand existe
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        select: { id: true }
      });

      if (!brand) {
        throw new NotFoundException('Brand no encontrado');
      }

      const brandFeatures = await this.prisma.brandFeature.findMany({
        where: {
          brandId,
          isActive: true
        },
        include: {
          feature: true
        },
        orderBy: {
          feature: {
            order: 'asc'
          }
        }
      });

      const brandFeaturesDto = brandFeatures.map(brandFeature =>
        this.mapBrandFeatureToDto(brandFeature)
      );

      return BaseResponseDto.success(brandFeaturesDto);
    } catch (error) {
      console.error('Error getting brand features:', error);
      throw error;
    }
  }

  // 3. Asignar feature a brand - SOLO DUEÑO
  async assignFeatureToBrand(
    brandId: number,
    featureId: number,
    userId: number
  ): Promise<BaseResponseDto<BrandFeatureDto>> {
    try {
      // Validar que el usuario es dueño del brand
      await this.validateBrandOwner(brandId, userId);

      // Verificar que el feature existe y está activo
      const feature = await this.prisma.feature.findUnique({
        where: { id: featureId }
      });

      if (!feature) {
        throw new NotFoundException('Feature no encontrado');
      }

      if (!feature.isActive) {
        throw new BadRequestException('El feature no está disponible');
      }

      // Verificar si ya existe alguna asignación (activa o inactiva)
      const existingAssignment = await this.prisma.brandFeature.findFirst({
        where: {
          brandId,
          featureId
        }
      });

      if (existingAssignment) {
        // Si ya existe pero está inactiva, reactivarla
        if (!existingAssignment.isActive) {
          const brandFeature = await this.prisma.brandFeature.update({
            where: {
              id: existingAssignment.id
            },
            data: {
              isActive: true,
              updatedAt: new Date()
            },
            include: {
              feature: true
            }
          });

          return BaseResponseDto.success(
            this.mapBrandFeatureToDto(brandFeature)
          );
        } else {
          // Si ya está activa, lanzar error
          throw new ConflictException('El feature ya está asignado y activo en este brand');
        }
      }

      // Si no existe ninguna asignación, crear una nueva
      const brandFeature = await this.prisma.brandFeature.create({
        data: {
          brandId,
          featureId,
          isActive: true
        },
        include: {
          feature: true
        }
      });

      return BaseResponseDto.success(
        this.mapBrandFeatureToDto(brandFeature)
      );
    } catch (error) {
      console.error('Error assigning feature to brand:', error);
      throw error;
    }
  }

  // 4. Desasignar feature de brand - SOLO DUEÑO
  async unassignFeatureFromBrand(
    brandId: number,
    featureId: number,
    userId: number
  ): Promise<BaseResponseDto<{ message: string }>> {
    try {
      // Validar que el usuario es dueño del brand
      await this.validateBrandOwner(brandId, userId);

      // Buscar la asignación activa
      const brandFeature = await this.prisma.brandFeature.findFirst({
        where: {
          brandId,
          featureId,
          isActive: true
        }
      });

      if (!brandFeature) {
        throw new NotFoundException('La asignación del feature al brand no existe o ya fue desactivada');
      }

      // Desactivar la asignación (no eliminar, solo desactivar)
      await this.prisma.brandFeature.update({
        where: {
          id: brandFeature.id
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      return BaseResponseDto.success(
        { message: 'Feature desasignado exitosamente del brand' }
      );
    } catch (error) {
      console.error('Error unassigning feature from brand:', error);
      throw error;
    }
  }

  /**
   * Crear nueva funcionalidad (solo para usuarios ROOT)
   */
  async createFeature(createFeatureDto: CreateFeatureDto): Promise<BaseResponseDto<FeatureDto>> {
    try {
      // Verificar que el key no exista
      const existingFeature = await this.prisma.feature.findUnique({
        where: { key: createFeatureDto.key }
      });

      if (existingFeature) {
        throw new ConflictException(`Ya existe una funcionalidad con la clave '${createFeatureDto.key}'`);
      }

      // Crear la nueva feature
      const newFeature = await this.prisma.feature.create({
        data: {
          key: createFeatureDto.key,
          title: createFeatureDto.title,
          subtitle: createFeatureDto.subtitle,
          description: createFeatureDto.description,
          price: createFeatureDto.price,
          category: createFeatureDto.category as any,
          businessTypes: createFeatureDto.businessTypes,
          isRecommended: createFeatureDto.isRecommended || false,
          isPopular: createFeatureDto.isPopular || false,
          order: createFeatureDto.order || 0,
          isActive: true
        }
      });

      const featureDto = this.mapFeatureToDto(newFeature);

      return BaseResponseDto.success(featureDto);

    } catch (error) {
      console.error('Error creating feature:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new BadRequestException('Error al crear la funcionalidad');
    }
  }
}