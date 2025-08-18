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
  BrandPlanResponseDto,
  BillingPeriod
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
        isotipoUrl: brand.isotipoUrl ?? undefined,
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

      if (updateData.isotipoImage) {
        const isotipoResult = await this.fileService.uploadBase64Image(brandId, updateData.isotipoImage, 'isotipo');
        if (isotipoResult.success) {
          imageUpdates.isotipoUrl = isotipoResult.url;
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
    role: string,
    requestingUserId: number
  ): Promise<BaseResponseDto<BrandUserResponseDto[]>> {
    try {
      await this.validateBrandAccess(brandId, requestingUserId);

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        brandId,
        isActive: true
      };

      // Aplicar filtro de rol si no es "all"
      if (role && role !== 'all') {
        if (role === 'client') {
          where.user = { role: 'CLIENT' };
        } else if (role === 'staff') {
          where.user = { role: { in: ['ADMIN', 'EMPLOYEE'] } };
        } else {
          where.user = { role: role.toUpperCase() };
        }
      }

      // Excluir al usuario que está haciendo la consulta
      where.user = {
        ...where.user,
        id: { not: requestingUserId }
      };

      const userBrands = await this.prisma.userBrand.findMany({
        where,
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
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Verificar que el usuario existe en el brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          brandId: brandId,
          userId: userId,
          isActive: true
        },
        include: {
          user: true
        }
      });

      if (!userBrand) {
        return BaseResponseDto.singleError(404, 'Usuario no encontrado en este brand');
      }

      // Solo permitir actualizar el rol y estado activo
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          role: updateData.role || userBrand.user.role,
          isActive: updateData.isActive !== undefined ? updateData.isActive : userBrand.user.isActive
        }
      });

      const response: BrandUserResponseDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error updating brand user:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }

  async deleteBrandUser(brandId: number, userId: number, requestingUserId: number): Promise<void> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // No permitir que el usuario se elimine a sí mismo
      if (userId === requestingUserId) {
        throw new ForbiddenException('No puedes eliminarte a ti mismo del brand');
      }

      // Verificar que el usuario existe en el brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          brandId: brandId,
          userId: userId,
          isActive: true
        },
        include: {
          user: true
        }
      });

      if (!userBrand) {
        throw new NotFoundException('Usuario no encontrado en este brand');
      }

      // No permitir eliminar al owner del brand
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId }
      });

      if (brand?.ownerId === userId) {
        throw new ForbiddenException('No se puede eliminar al propietario del brand');
      }

      // Desactivar la relación usuario-brand en lugar de eliminar
      await this.prisma.userBrand.update({
        where: {
          id: userBrand.id
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error deleting brand user:', error);
      if (error.status === 403 || error.status === 404) {
        throw error;
      }
      throw new Error('Error interno del servidor');
    }
  }

  async updateBrandFeatures(brandId: number, featureIds: number[], requestingUserId: number): Promise<BaseResponseDto<BrandAdminResponseDto>> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Obtener las features existentes del brand
      const existingBrandFeatures = await this.prisma.brandFeature.findMany({
        where: { brandId: brandId }
      });

      // Obtener las features válidas
      const validFeatures = await this.prisma.feature.findMany({
        where: {
          id: { in: featureIds },
          isActive: true
        }
      });

      if (validFeatures.length !== featureIds.length) {
        return BaseResponseDto.singleError(400, 'Algunas features no son válidas o están inactivas');
      }

      // Desactivar todas las features existentes
      await this.prisma.brandFeature.updateMany({
        where: { brandId: brandId },
        data: { isActive: false }
      });

      // Activar o crear las nuevas features
      for (const featureId of featureIds) {
        const existingBrandFeature = existingBrandFeatures.find(bf => bf.featureId === featureId);
        
        if (existingBrandFeature) {
          // Reactivar feature existente
          await this.prisma.brandFeature.update({
            where: { id: existingBrandFeature.id },
            data: { 
              isActive: true,
              updatedAt: new Date()
            }
          });
        } else {
          // Crear nueva relación brand-feature
          await this.prisma.brandFeature.create({
            data: {
              brandId: brandId,
              featureId: featureId,
              isActive: true
            }
          });
        }
      }

      // Devolver la información actualizada del brand
      return this.getBrandAdminInfo(brandId, requestingUserId);

    } catch (error) {
      console.error('Error updating brand features:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }

  async getBrandPlanDetails(brandId: number, requestingUserId: number): Promise<BaseResponseDto<BrandPlanResponseDto>> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Obtener el plan actual del brand
      const currentBrandPlan = await this.prisma.brandPlan.findFirst({
        where: { 
          brandId: brandId,
          isActive: true 
        },
        include: {
          plan: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!currentBrandPlan) {
        return BaseResponseDto.singleError(404, 'No se encontró un plan activo para este brand');
      }

      // Obtener historial de planes
      const planHistory = await this.prisma.brandPlan.findMany({
        where: { brandId: brandId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Obtener planes disponibles para upgrade
      const availablePlans = await this.prisma.plan.findMany({
        where: { 
          isActive: true,
          id: { not: currentBrandPlan.planId }
        },
        orderBy: { basePrice: 'asc' }
      });

      const response: BrandPlanResponseDto = {
        id: currentBrandPlan.id,
        planId: currentBrandPlan.planId,
        planType: currentBrandPlan.plan.type,
        planName: currentBrandPlan.plan.name,
        planDescription: currentBrandPlan.plan.description || '',
        basePrice: Number(currentBrandPlan.plan.basePrice),
        currentPrice: Number(currentBrandPlan.price),
        billingPeriod: currentBrandPlan.billingPeriod,
        startDate: currentBrandPlan.startDate.toISOString(),
        endDate: currentBrandPlan.endDate?.toISOString(),
        isActive: currentBrandPlan.isActive,
        nextBillingDate: undefined, // TODO: Calcular fecha de próximo pago
        daysUntilNextBilling: 0, // TODO: Calcular días restantes
        history: planHistory.map(bp => ({
          id: bp.id,
          planId: bp.planId,
          planName: bp.plan.name,
          planType: bp.plan.type,
          price: Number(bp.price),
          billingPeriod: bp.billingPeriod,
          startDate: bp.startDate.toISOString(),
          endDate: bp.endDate?.toISOString(),
          isActive: bp.isActive,
          changeReason: bp.id === currentBrandPlan.id ? 'current' : 'upgrade'
        })),
        availableUpgrades: availablePlans.map(plan => ({
          planId: plan.id,
          name: plan.name,
          description: plan.description || '',
          type: plan.type,
          basePrice: Number(plan.basePrice),
          totalPriceWithFeatures: Number(plan.basePrice), // TODO: Calcular con features
          includedFeatures: [], // TODO: Implementar features del plan
          isRecommended: false,
          isCurrentPlan: false
        }))
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error getting brand plan:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }

  async updateBrandPlan(brandId: number, updateData: UpdateBrandPlanDto, requestingUserId: number): Promise<BaseResponseDto<BrandPlanResponseDto>> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Verificar que el plan nuevo existe
      const newPlan = await this.prisma.plan.findUnique({
        where: { 
          id: updateData.planId,
          isActive: true 
        }
      });

      if (!newPlan) {
        return BaseResponseDto.singleError(404, 'Plan no encontrado o inactivo');
      }

      // Desactivar el plan actual
      await this.prisma.brandPlan.updateMany({
        where: { 
          brandId: brandId,
          isActive: true 
        },
        data: { 
          isActive: false,
          endDate: new Date()
        }
      });

      // Calcular próxima fecha de facturación
      const startDate = new Date();
      let nextBillingDate = new Date(startDate);
      
      switch (updateData.billingPeriod || BillingPeriod.MONTHLY) {
        case BillingPeriod.MONTHLY:
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case BillingPeriod.ANNUAL:
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      // Crear nuevo plan activo
      const newBrandPlan = await this.prisma.brandPlan.create({
        data: {
          brandId: brandId,
          planId: updateData.planId,
          price: newPlan.basePrice,
          billingPeriod: updateData.billingPeriod || BillingPeriod.MONTHLY,
          startDate: startDate,
          isActive: true
        },
        include: {
          plan: true
        }
      });

      // Calcular días hasta próxima facturación
      const daysUntilNextBilling = Math.ceil((nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

      const response: BrandPlanResponseDto = {
        id: newBrandPlan.id,
        planId: newBrandPlan.planId,
        planType: newBrandPlan.plan.type,
        planName: newBrandPlan.plan.name,
        planDescription: newBrandPlan.plan.description || '',
        basePrice: Number(newBrandPlan.plan.basePrice),
        currentPrice: Number(newBrandPlan.price),
        billingPeriod: newBrandPlan.billingPeriod,
        startDate: newBrandPlan.startDate.toISOString(),
        endDate: newBrandPlan.endDate?.toISOString(),
        isActive: newBrandPlan.isActive,
        nextBillingDate: nextBillingDate.toISOString(),
        daysUntilNextBilling: daysUntilNextBilling,
        history: [],
        availableUpgrades: []
      };

      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('Error updating brand plan:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }

  async getBrandStats(brandId: number, period: string, requestingUserId: number): Promise<BaseResponseDto<any>> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Calcular fechas según el período
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Obtener estadísticas básicas del brand
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        include: {
          userBrands: {
            where: { isActive: true },
            include: { user: true }
          },
          brandFeatures: {
            include: { feature: true }
          },
          brandPlans: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!brand) {
        return BaseResponseDto.singleError(404, 'Brand no encontrado');
      }

      // Contar características activas
      const activeFeatures = brand.brandFeatures.filter(bf => bf.isActive).length;

      // Calcular estadísticas
      const stats = {
        totalUsers: brand.userBrands.length,
        totalFeatures: brand.brandFeatures.length,
        activeFeatures: activeFeatures,
        totalRevenue: 0, // TODO: Calcular desde pagos cuando se implemente
        monthlyRevenue: 0,
        subscriptionStatus: brand.brandPlans.length > 0 ? 'active' : 'inactive',
        lastActivity: brand.updatedAt,
        createdAt: brand.createdAt,
        daysActive: Math.floor((endDate.getTime() - brand.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        userGrowth: {
          period: period,
          totalUsers: brand.userBrands.length,
          newUsers: brand.userBrands.filter(ub => 
            ub.createdAt >= startDate && ub.createdAt <= endDate
          ).length
        },
        featureUsage: brand.brandFeatures.map(brandFeature => ({
          id: brandFeature.id,
          key: brandFeature.feature.key,
          title: brandFeature.feature.title,
          isActive: brandFeature.isActive,
          activatedAt: brandFeature.createdAt,
          price: brandFeature.feature.price
        }))
      };

      return BaseResponseDto.success(stats);

    } catch (error) {
      console.error('Error getting brand stats:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }

  async getBrandPayments(brandId: number, page: number, limit: number, status: string, requestingUserId: number): Promise<BaseResponseDto<any>> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Construir filtros
      const where: any = {
        brandId: brandId
      };

      // Aplicar filtro de status si no es "all"
      if (status && status !== 'all') {
        where.status = status;
      }

      // Calcular offset
      const skip = (page - 1) * limit;

      // Obtener pagos con paginación
      const [payments, totalCount] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            brandPlan: {
              include: {
                plan: true
              }
            }
          }
        }),
        this.prisma.payment.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return BaseResponseDto.success({
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.tilopayTransactionId,
          reference: payment.tilopayReference,
          processedAt: payment.processedAt,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          plan: payment.brandPlan?.plan ? {
            id: payment.brandPlan.plan.id,
            name: payment.brandPlan.plan.name,
            type: payment.brandPlan.plan.type
          } : null
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      console.error('Error getting brand payments:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }

  async getBrandActivity(brandId: number, page: number, limit: number, requestingUserId: number): Promise<BaseResponseDto<any>> {
    try {
      // Verificar acceso al brand
      await this.validateBrandAccess(brandId, requestingUserId);

      // Como no tenemos un modelo de Activity, vamos a crear actividades basadas en otros eventos
      const skip = (page - 1) * limit;

      // Obtener actividades de diferentes fuentes
      const [recentUsers, recentFeatures, recentPayments] = await Promise.all([
        this.prisma.userBrand.findMany({
          where: { brandId, isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: true }
        }),
        this.prisma.brandFeature.findMany({
          where: { brandId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { feature: true }
        }),
        this.prisma.payment.findMany({
          where: { brandId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { brandPlan: { include: { plan: true } } }
        })
      ]);

      // Crear actividades combinadas
      const activities: any[] = [];

      // Actividades de usuarios
      recentUsers.forEach(userBrand => {
        activities.push({
          id: `user-${userBrand.id}`,
          type: 'user_joined',
          title: 'Usuario se unió al brand',
          description: `${userBrand.user.firstName} ${userBrand.user.lastName} (${userBrand.user.email}) se unió como ${userBrand.user.role}`,
          createdAt: userBrand.createdAt,
          metadata: {
            userId: userBrand.user.id,
            userName: `${userBrand.user.firstName} ${userBrand.user.lastName}`,
            userRole: userBrand.user.role
          }
        });
      });

      // Actividades de features
      recentFeatures.forEach(brandFeature => {
        activities.push({
          id: `feature-${brandFeature.id}`,
          type: 'feature_activated',
          title: 'Feature activada',
          description: `Se activó la feature "${brandFeature.feature.title}"`,
          createdAt: brandFeature.createdAt,
          metadata: {
            featureId: brandFeature.feature.id,
            featureName: brandFeature.feature.title,
            featurePrice: brandFeature.feature.price
          }
        });
      });

      // Actividades de pagos
      recentPayments.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment_processed',
          title: 'Pago procesado',
          description: `Pago de ${payment.currency} ${payment.amount} - ${payment.status}`,
          createdAt: payment.createdAt,
          metadata: {
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            planName: payment.brandPlan?.plan?.name
          }
        });
      });

      // Ordenar por fecha descendente y paginar
      activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const totalCount = activities.length;
      const paginatedActivities = activities.slice(skip, skip + limit);
      const totalPages = Math.ceil(totalCount / limit);

      return BaseResponseDto.success({
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      console.error('Error getting brand activity:', error);
      if (error.status === 403) {
        return BaseResponseDto.singleError(403, 'No tienes permisos para acceder a este brand');
      }
      return BaseResponseDto.singleError(500, 'Error interno del servidor');
    }
  }
}