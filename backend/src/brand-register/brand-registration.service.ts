// backend/src/brand-register/brand-registration.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BaseResponseDto, ErrorDetail } from '../common/dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';
import { UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { createAccessToken } from '../lib/crypto';

// Response interface actualizada
interface BrandRegistrationResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  brand: {
    id: number;
    name: string;
    description?: string;
    phone?: string;
    businessType?: string;
    features?: string[];
  };
  colorPalette: {
    id: number;
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };
  plan: {
    id: number;
    type: string;
    price: number;
    features: string[];
    billingPeriod: string;
  };
  appointmentSettings?: {
    useServiceTypes: boolean;
    defaultDuration: number;
    serviceTypesCreated: number;
  };
  payment?: {
    status: string;
    tilopayReference?: string;
    processedAt?: string;
  };
  token: string;
}

@Injectable()
export class BrandRegistrationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async registerBrand(createBrandDto: CreateBrandDto): Promise<BaseResponseDto<BrandRegistrationResponse>> {
    const errors: ErrorDetail[] = [];
    
    try {
      console.log('🔄 Processing registration for:', createBrandDto.email);

      // Validar contraseña
      const passwordValidation = this.validatePassword(createBrandDto.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }

      // Verificar que el email no exista
      const existingUserByEmail = await this.prisma.user.findFirst({
        where: { email: createBrandDto.email }
      });
      if (existingUserByEmail) {
        errors.push({
          code: ERROR_CODES.EMAIL_EXISTS,
          description: ERROR_MESSAGES.EMAIL_EXISTS
        });
      }

      // Verificar que el username no exista
      const existingUserByUsername = await this.prisma.user.findFirst({
        where: { username: createBrandDto.username }
      });
      if (existingUserByUsername) {
        errors.push({
          code: ERROR_CODES.USERNAME_EXISTS,
          description: ERROR_MESSAGES.USERNAME_EXISTS
        });
      }

      // Validar que businessTypeId existe
      const businessType = await this.prisma.businessType.findUnique({
        where: { id: createBrandDto.businessTypeId }
      });
      if (!businessType) {
        errors.push({
          code: ERROR_CODES.INVALID_BUSINESS_TYPE,
          description: 'Business type not found'
        });
      }

      // Validar que el planId existe
      const plan = await this.prisma.plan.findUnique({
        where: { id: createBrandDto.planId }
      });
      if (!plan) {
        errors.push({
          code: ERROR_CODES.INVALID_PLAN,
          description: 'Plan not found'
        });
      }

      // Validar que las features existen
      const features = await this.prisma.feature.findMany({
        where: { id: { in: createBrandDto.selectedFeatureIds } }
      });
      if (features.length !== createBrandDto.selectedFeatureIds.length) {
        errors.push({
          code: ERROR_CODES.INVALID_FEATURES,
          description: 'Some features not found'
        });
      }

      // Validar tipos de servicio si están configurados
      if (createBrandDto.appointmentSettings?.useServiceTypes && 
          createBrandDto.appointmentSettings?.serviceTypes) {
        for (const serviceType of createBrandDto.appointmentSettings.serviceTypes) {
          if (serviceType.duration % 15 !== 0) {
            errors.push({
              code: ERROR_CODES.VALIDATION_ERROR || 400,
              description: `La duración de "${serviceType.name}" debe ser múltiplo de 15 minutos`
            });
          }
        }
      }

      // Validar precio total
      const calculatedPrice = this.calculateTotalPrice(plan, features, createBrandDto.planBillingPeriod);
      if (Math.abs(calculatedPrice - createBrandDto.totalPrice) > 0.01) {
        errors.push({
          code: ERROR_CODES.PRICE_MISMATCH,
          description: `Price mismatch. Expected: ${calculatedPrice}, Received: ${createBrandDto.totalPrice}`
        });
      }

      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        return BaseResponseDto.error(errors);
      }

      console.log('✅ All validations passed, creating brand...');

      // Crear la marca, usuario, plan y procesamiento en una transacción
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Crear el usuario ROOT/propietario
        const hashedPassword = await bcrypt.hash(createBrandDto.password, 12);
        const user = await prisma.user.create({
          data: {
            email: createBrandDto.email,
            username: createBrandDto.username,
            firstName: createBrandDto.firstName,
            lastName: createBrandDto.lastName,
            role: UserRole.ROOT
          }
        });
        console.log('✅ User created:', user.id);

        // 2. Crear la marca
        const brand = await prisma.brand.create({
          data: {
            name: createBrandDto.brandName,
            description: createBrandDto.brandDescription,
            phone: createBrandDto.brandPhone,
            address: createBrandDto.brandAddress, // Agregar dirección si existe
            ownerId: user.id,
            businessType: businessType?.key,
            selectedFeatures: features.map(f => f.key)
          }
        });
        console.log('✅ Brand created:', brand.id);

        // 3. Crear paleta de colores
        const colorPalette = await prisma.colorPalette.create({
          data: {
            brandId: brand.id,
            primary: createBrandDto.colorPalette.primary,
            secondary: createBrandDto.colorPalette.secondary,
            accent: createBrandDto.colorPalette.accent,
            neutral: createBrandDto.colorPalette.neutral,
            success: createBrandDto.colorPalette.success
          }
        });
        console.log('✅ Color palette created:', colorPalette.id);

        // 4. Crear relaciones Brand-Feature
        const brandFeatures = await Promise.all(
          features.map(feature =>
            prisma.brandFeature.create({
              data: {
                brandId: brand.id,
                featureId: feature.id
              }
            })
          )
        );
        console.log('✅ Brand features created:', brandFeatures.length);

        // 5. Crear plan de suscripción
        const brandPlan = await prisma.brandPlan.create({
          data: {
            brandId: brand.id,
            planId: createBrandDto.planId,
            billingPeriod: createBrandDto.planBillingPeriod || 'monthly',
            price: createBrandDto.totalPrice
          }
        });
        console.log('✅ Brand plan created:', brandPlan.id);

        // 6. Crear configuración de citas
        const appointmentSettings = await prisma.appointmentSettings.create({
          data: {
            brandId: brand.id,
            useServiceTypes: createBrandDto.appointmentSettings?.useServiceTypes || false,
            defaultDuration: createBrandDto.appointmentSettings?.defaultDuration || 30,
            bufferTime: 5,
            maxAdvanceBookingDays: 30,
            minAdvanceBookingHours: 2,
            allowSameDayBooking: true
          }
        });
        console.log('✅ Appointment settings created:', appointmentSettings.id);

        // 7. Crear tipos de servicio si están configurados
        let serviceTypesCreated = 0;
        if (createBrandDto.appointmentSettings?.useServiceTypes) {
          if (createBrandDto.appointmentSettings.serviceTypes && 
              createBrandDto.appointmentSettings.serviceTypes.length > 0) {
            // Crear los tipos de servicio proporcionados
            for (let i = 0; i < createBrandDto.appointmentSettings.serviceTypes.length; i++) {
              const serviceType = createBrandDto.appointmentSettings.serviceTypes[i];
              await prisma.serviceType.create({
                data: {
                  brandId: brand.id,
                  name: serviceType.name,
                  description: serviceType.description,
                  duration: serviceType.duration,
                  price: serviceType.price,
                  color: serviceType.color,
                  icon: serviceType.icon,
                  isActive: true,
                  order: i
                }
              });
              serviceTypesCreated++;
            }
            console.log(`✅ ${serviceTypesCreated} service types created`);
          } else {
            // Crear tipo de servicio por defecto
            await prisma.serviceType.create({
              data: {
                brandId: brand.id,
                name: 'Cita General',
                description: 'Servicio por defecto',
                duration: appointmentSettings.defaultDuration,
                isActive: true,
                order: 0
              }
            });
            serviceTypesCreated = 1;
            console.log('✅ Default service type created');
          }
        }

        // 8. Crear UserBrand para el acceso del propietario
        const salt = randomBytes(32).toString('hex') + Date.now().toString();
        await prisma.userBrand.create({
          data: {
            userId: user.id,
            brandId: brand.id,
            passwordHash: hashedPassword,
            salt: salt
          }
        });
        console.log('✅ UserBrand relation created');

        return {
          brand,
          user,
          colorPalette,
          brandPlan: { ...brandPlan, plan },
          features,
          appointmentSettings,
          serviceTypesCreated
        };
      });

      console.log('✅ Transaction completed successfully');

      // Generar JWT token
      const payload = {
        userId: result.user.id,
        email: result.user.email,
        username: result.user.username,
        brandId: result.brand.id,
        role: result.user.role
      };
      const token = createAccessToken(payload);

      // Construir respuesta completa
      const response: BrandRegistrationResponse = {
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          role: result.user.role
        },
        brand: {
          id: result.brand.id,
          name: result.brand.name,
          description: result.brand.description || undefined,
          phone: result.brand.phone || undefined,
          businessType: result.brand.businessType || undefined,
          features: result.features.map(f => f.key)
        },
        colorPalette: {
          id: result.colorPalette.id,
          primary: result.colorPalette.primary,
          secondary: result.colorPalette.secondary,
          accent: result.colorPalette.accent,
          neutral: result.colorPalette.neutral,
          success: result.colorPalette.success
        },
        plan: {
          id: result.brandPlan.id,
          type: result.brandPlan.plan?.type || 'unknown',
          price: Number(result.brandPlan.price),
          features: result.features.map(f => f.title),
          billingPeriod: result.brandPlan.billingPeriod
        },
        token
      };

      // Agregar información de configuración de citas si existe
      if (result.appointmentSettings) {
        response.appointmentSettings = {
          useServiceTypes: result.appointmentSettings.useServiceTypes,
          defaultDuration: result.appointmentSettings.defaultDuration,
          serviceTypesCreated: result.serviceTypesCreated
        };
      }

      console.log('🎉 Registration completed successfully for brand:', result.brand.id);
      return BaseResponseDto.success(response);

    } catch (error) {
      console.error('💥 Error en registerBrand:', error);
      errors.push({
        code: ERROR_CODES.INTERNAL_ERROR,
        description: `Registration failed: ${error.message}`
      });
      return BaseResponseDto.error(errors);
    }
  }

  private validatePassword(password: string): { isValid: boolean; errors: ErrorDetail[] } {
    const errors: ErrorDetail[] = [];
    
    if (!password || password.length < 8) {
      errors.push({
        code: ERROR_CODES.INVALID_PASSWORD,
        description: 'Password must be at least 8 characters long'
      });
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push({
        code: ERROR_CODES.INVALID_PASSWORD,
        description: 'Password must contain at least one lowercase letter'
      });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push({
        code: ERROR_CODES.INVALID_PASSWORD,
        description: 'Password must contain at least one uppercase letter'
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push({
        code: ERROR_CODES.INVALID_PASSWORD,
        description: 'Password must contain at least one number'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private calculateTotalPrice(plan: any, features: any[], billingPeriod: string = 'monthly'): number {
    const planPrice = Number(plan.basePrice) || 0;
    const featuresPrice = features.reduce((total, feature) => total + Number(feature.price), 0);
    const monthlyTotal = planPrice + featuresPrice;
    
    // Apply 20% discount for annual billing
    if (billingPeriod === 'annual') {
      return monthlyTotal * 12 * 0.8;
    }
    
    return monthlyTotal;
  }
}