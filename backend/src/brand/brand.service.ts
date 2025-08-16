import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../common/services/file.service';
import { BaseResponseDto, ErrorDetail } from '../common/dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';
import {
  BrandAdminResponseDto,
  UpdateBrandDto,
  CreateBrandUserDto,
  UpdateBrandUserDto,
  BrandUserResponseDto,
  UpdateBrandPlanDto,
  BrandPlanResponseDto
} from './dto/index';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class BrandService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService
  ) {}

  async getBrandAdminInfo(brandId: number, requestingUserId: number): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    try {
      // Verificar que el usuario tenga acceso a este brand
      await this.validateBrandAccess(brandId, requestingUserId);

      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        include: {
          // Usuarios del brand
          userBrands: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  isActive: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            },
            where: { isActive: true }
          },
          // Features activas
          brandFeatures: {
            include: {
              feature: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  description: true,
                  price: true,
                  category: true,
                  isRecommended: true,
                  isPopular: true,
                  isActive: true
                }
              }
            },
            where: { isActive: true }
          },
          // Plan actual
          brandPlans: {
            include: {
              plan: {
                select: {
                  id: true,
                  type: true,
                  name: true,
                  description: true,
                  basePrice: true
                }
              }
            },
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          // Paleta de colores
          colorPalette: true,
          // Pagos recientes
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              paymentMethod: true,
              tilopayReference: true,
              createdAt: true,
              processedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      // Obtener información del tipo de negocio
      let businessType: any = null;
      if (brand.businessType) {
        businessType = await this.prisma.businessType.findUnique({
          where: { key: brand.businessType }
        });
      }

      // Calcular estadísticas
      const stats = await this.calculateBrandStats(brandId);

      // Construir respuesta
      const response: BrandAdminResponseDto = {
        id: brand.id,
        name: brand.name,
        description: brand.description ?? undefined,
        address: brand.address ?? undefined,
        phone: brand.phone ?? undefined,
        logoUrl: brand.logoUrl ?? undefined,
        isotopoUrl: brand.isotopoUrl ?? undefined,
        imagotipoUrl: brand.imagotipoUrl ?? undefined,
        isActive: brand.isActive,
        createdAt: brand.createdAt.toISOString(),
        updatedAt: brand.updatedAt.toISOString(),

        businessType: {
          id: businessType?.id ?? 0,
          key: businessType?.key ?? '',
          title: businessType?.title ?? '',
          subtitle: businessType?.subtitle ?? '',
          description: businessType?.description ?? '',
          icon: businessType?.icon ?? ''
        },

        users: brand.userBrands.map(ub => ({
          id: ub.user.id,
          email: ub.user.email,
          username: ub.user.username,
          firstName: ub.user.firstName ?? '',
          lastName: ub.user.lastName ?? '',
          role: ub.user.role,
          isActive: ub.user.isActive,
          createdAt: ub.user.createdAt.toISOString(),
          lastLogin: undefined // TODO: Implementar tracking de último login
        })),

        features: brand.brandFeatures.map(bf => ({
          id: bf.feature.id,
          key: bf.feature.key,
          title: bf.feature.title,
          description: bf.feature.description,
          price: Number(bf.feature.price),
          category: bf.feature.category,
          isRecommended: bf.feature.isRecommended,
          isPopular: bf.feature.isPopular,
          isActive: bf.feature.isActive,
          activatedAt: bf.createdAt.toISOString()
        })),

        currentPlan: brand.brandPlans[0] ? {
          id: brand.brandPlans[0].id,
          planId: brand.brandPlans[0].plan.id,
          planType: brand.brandPlans[0].plan.type,
          planName: brand.brandPlans[0].plan.name,
          planDescription: brand.brandPlans[0].plan.description || '',
          basePrice: Number(brand.brandPlans[0].plan.basePrice),
          currentPrice: Number(brand.brandPlans[0].price),
          billingPeriod: brand.brandPlans[0].billingPeriod,
          startDate: brand.brandPlans[0].startDate.toISOString(),
          endDate: brand.brandPlans[0].endDate?.toISOString(),
          isActive: brand.brandPlans[0].isActive,
          nextBillingDate: this.calculateNextBillingDate(brand.brandPlans[0])?.toISOString()
        } : {
          id: 0,
          planId: 0,
          planType: '',
          planName: '',
          planDescription: '',
          basePrice: 0,
          currentPrice: 0,
          billingPeriod: 'monthly',
          startDate: new Date(0).toISOString(),
          endDate: undefined,
          isActive: false,
          nextBillingDate: undefined
        },

        colorPalette: brand.colorPalette ? {
          id: brand.colorPalette.id,
          primary: brand.colorPalette.primary,
          secondary: brand.colorPalette.secondary,
          accent: brand.colorPalette.accent,
          neutral: brand.colorPalette.neutral,
          success: brand.colorPalette.success,
          createdAt: brand.colorPalette.createdAt.toISOString(),
          updatedAt: brand.colorPalette.updatedAt.toISOString()
        } : {
          id: 0,
          primary: '',
          secondary: '',
          accent: '',
          neutral: '',
          success: '',
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString()
        },

        recentPayments: brand.payments.map(payment => ({
          id: payment.id,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod ?? undefined,
          tilopayReference: payment.tilopayReference ?? undefined,
          createdAt: payment.createdAt.toISOString(),
          processedAt: payment.processedAt?.toISOString()
        })),

        stats
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error getting brand admin info:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to get brand information');
    }
  }

  async updateBrand(
    brandId: number, 
    updateData: UpdateBrandDto, 
    requestingUserId: number
  ): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Procesar imágenes si se proporcionaron
      const imageUpdates: any = {};

      if (updateData.logoImage) {
        const logoResult = await this.fileService.uploadBase64Image(brandId, updateData.logoImage, 'logo');
        if (logoResult.success) {
          imageUpdates.logoUrl = logoResult.url;
        }
      }

      if (updateData.isotopoImage) {
        const isotopoResult = await this.fileService.uploadBase64Image(brandId, updateData.isotopoImage, 'isotopo');
        if (isotopoResult.success) {
          imageUpdates.isotopoUrl = isotopoResult.url;
        }
      }

      if (updateData.imagotipoImage) {
        const imagotipoResult = await this.fileService.uploadBase64Image(brandId, updateData.imagotipoImage, 'imagotipo');
        if (imagotipoResult.success) {
          imageUpdates.imagotipoUrl = imagotipoResult.url;
        }
      }

      // Preparar datos de actualización del brand
      const brandUpdateData: any = {
        ...imageUpdates
      };

      if (updateData.name !== undefined) brandUpdateData.name = updateData.name;
      if (updateData.description !== undefined) brandUpdateData.description = updateData.description;
      if (updateData.address !== undefined) brandUpdateData.address = updateData.address;
      if (updateData.phone !== undefined) brandUpdateData.phone = updateData.phone;
      if (updateData.isActive !== undefined) brandUpdateData.isActive = updateData.isActive;

      // Manejar cambio de tipo de negocio
      if (updateData.businessTypeId !== undefined) {
        const businessType = await this.prisma.businessType.findUnique({
          where: { id: updateData.businessTypeId }
        });
        if (businessType) {
          brandUpdateData.businessType = businessType.key;
        }
      }

      await this.prisma.$transaction(async (prisma) => {
        // Actualizar brand
        await prisma.brand.update({
          where: { id: brandId },
          data: brandUpdateData
        });

        // Actualizar paleta de colores si se proporcionó
        if (updateData.colorPalette) {
          const colorPaletteData = {
            primary: updateData.colorPalette.primary || '#000000',
            secondary: updateData.colorPalette.secondary || '#000000',
            accent: updateData.colorPalette.accent || '#000000',
            neutral: updateData.colorPalette.neutral || '#000000',
            success: updateData.colorPalette.success || '#000000',
          };

          await prisma.colorPalette.upsert({
            where: { brandId },
            create: {
              brandId,
              ...colorPaletteData
            },
            update: colorPaletteData
          });
        }

        // Actualizar features si se proporcionaron
        if (updateData.selectedFeatureIds !== undefined) {
          // Desactivar todas las features actuales
          await prisma.brandFeature.updateMany({
            where: { brandId },
            data: { isActive: false }
          });

          // Activar las nuevas features
          for (const featureId of updateData.selectedFeatureIds) {
            await prisma.brandFeature.upsert({
              where: {
                brandId_featureId: {
                  brandId,
                  featureId
                }
              },
              create: {
                brandId,
                featureId,
                isActive: true
              },
              update: {
                isActive: true
              }
            });
          }

          // Actualizar el array de selectedFeatures en el brand
          const features = await prisma.feature.findMany({
            where: { id: { in: updateData.selectedFeatureIds } }
          });
          await prisma.brand.update({
            where: { id: brandId },
            data: {
              selectedFeatures: features.map(f => f.key)
            }
          });
        }
      });

      // Retornar información actualizada
      return this.getBrandAdminInfo(brandId, requestingUserId);

    } catch (error) {
      console.error('Error updating brand:', error);
      throw new Error('Failed to update brand');
    }
  }

  async getBrandUsers(
    brandId: number,
    page: number,
    limit: number,
    requestingUserId: number
  ): Promise<BaseResponseDto<BrandUserResponseDto[]>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      const skip = (page - 1) * limit;

      const userBrands = await this.prisma.userBrand.findMany({
        where: {
          brandId,
          isActive: true
        },
        include: {
          user: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const users: BrandUserResponseDto[] = userBrands.map(ub => ({
        id: ub.user.id,
        email: ub.user.email,
        username: ub.user.username,
        firstName: ub.user.firstName || '',
        lastName: ub.user.lastName || '',
        role: ub.user.role,
        isActive: ub.user.isActive,
        createdAt: ub.user.createdAt.toISOString(),
        updatedAt: ub.user.updatedAt.toISOString(),
        lastLogin: undefined // TODO: Implementar tracking
      }));

      return BaseResponseDto.success(users);

    } catch (error) {
      console.error('Error getting brand users:', error);
      throw new Error('Failed to get brand users');
    }
  }

  async createBrandUser(
    brandId: number,
    createUserDto: CreateBrandUserDto,
    requestingUserId: number
  ): Promise<BaseResponseDto<BrandUserResponseDto>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      // Verificar que el email y username no existan
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: createUserDto.email },
            { username: createUserDto.username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('Email or username already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const result = await this.prisma.$transaction(async (prisma) => {
        // Crear usuario
        const user = await prisma.user.create({
          data: {
            email: createUserDto.email,
            username: createUserDto.username,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            role: createUserDto.role || 'CLIENT'
          }
        });

        // Crear relación UserBrand
        const salt = randomBytes(32).toString('hex') + Date.now().toString();
        await prisma.userBrand.create({
          data: {
            userId: user.id,
            brandId,
            passwordHash: hashedPassword,
            salt
          }
        });

        return user;
      });

      const response: BrandUserResponseDto = {
        id: result.id,
        email: result.email,
        username: result.username,
        firstName: result.firstName || '',
        lastName: result.lastName || '',
        role: result.role,
        isActive: result.isActive,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        lastLogin: undefined
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error creating brand user:', error);
      throw new Error('Failed to create brand user');
    }
  }

  // Helper methods
  private async validateBrandAccess(brandId: number, userId: number): Promise<void> {
    const userBrand = await this.prisma.userBrand.findFirst({
      where: {
        brandId,
        userId,
        isActive: true
      },
      include: {
        user: true
      }
    });

    if (!userBrand || (!['ROOT', 'ADMIN'].includes(userBrand.user.role))) {
      throw new ForbiddenException('Access denied to this brand');
    }
  }

  private async calculateBrandStats(brandId: number): Promise<any> {
    const [userCount, featureCount, activeFeatureCount, totalRevenue, monthlyRevenue] = await Promise.all([
      this.prisma.userBrand.count({ where: { brandId, isActive: true } }),
      this.prisma.brandFeature.count({ where: { brandId } }),
      this.prisma.brandFeature.count({ where: { brandId, isActive: true } }),
      this.prisma.payment.aggregate({
        where: { brandId, status: 'completed' },
        _sum: { amount: true }
      }),
      this.prisma.payment.aggregate({
        where: {
          brandId,
          status: 'completed',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      })
    ]);

    const currentPlan = await this.prisma.brandPlan.findFirst({
      where: { brandId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return {
      totalUsers: userCount,
      totalFeatures: featureCount,
      activeFeatures: activeFeatureCount,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      daysUntilNextBilling: currentPlan ? this.calculateDaysUntilNextBilling(currentPlan) : 0,
      isSubscriptionActive: currentPlan?.isActive || false,
      lastActivity: new Date().toISOString() // TODO: Implementar tracking real
    };
  }

  private calculateNextBillingDate(brandPlan: any): Date | null {
    if (!brandPlan.startDate) return null;

    const startDate = new Date(brandPlan.startDate);
    const now = new Date();

    if (brandPlan.billingPeriod === 'annual') {
      const nextBilling = new Date(startDate);
      nextBilling.setFullYear(startDate.getFullYear() + 1);
      return nextBilling > now ? nextBilling : null;
    } else {
      const nextBilling = new Date(startDate);
      nextBilling.setMonth(startDate.getMonth() + 1);
      return nextBilling > now ? nextBilling : null;
    }
  }

  private calculateDaysUntilNextBilling(brandPlan: any): number {
    const nextBilling = this.calculateNextBillingDate(brandPlan);
    if (!nextBilling) return 0;

    const now = new Date();
    const diffTime = nextBilling.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Métodos adicionales que necesitarás implementar
  async updateBrandUser(brandId: number, userId: number, updateData: UpdateBrandUserDto, requestingUserId: number): Promise<BaseResponseDto<BrandUserResponseDto>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async deleteBrandUser(brandId: number, userId: number, requestingUserId: number): Promise<void> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async updateBrandFeatures(brandId: number, featureIds: number[], requestingUserId: number): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async getBrandPlanDetails(brandId: number, requestingUserId: number): Promise<BaseResponseDto<BrandPlanResponseDto>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async updateBrandPlan(brandId: number, updateData: UpdateBrandPlanDto, requestingUserId: number): Promise<BaseResponseDto<BrandPlanResponseDto>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async getBrandStats(brandId: number, period: string, requestingUserId: number): Promise<BaseResponseDto<any>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async getBrandPayments(brandId: number, page: number, limit: number, status: string, requestingUserId: number): Promise<BaseResponseDto<any>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }

  async getBrandActivity(brandId: number, page: number, limit: number, requestingUserId: number): Promise<BaseResponseDto<any>> {
    // TODO: Implementar
    throw new Error('Method not implemented');
  }
}