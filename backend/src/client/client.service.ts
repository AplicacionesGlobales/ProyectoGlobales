// client/client.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ClientValidationService } from './services/client-validation.service';
import { ClientStatsService } from './services/client-stats.service';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateClientProfileDto,
  ClientResponseDto,
  ClientListResponseDto,
  CheckEmailResponseDto,
  ClientStatsResponseDto,
  ImportClientsDto,
  ImportClientsResponseDto,
  ClientActivityResponseDto,
  ClientAppointmentListResponseDto,
  GetClientAppointmentsQueryDto,
  ClientFilters,
} from './dto';
import { BaseResponseDto, ErrorDetail } from '../common/dto';
import { UserRole, AppointmentStatus } from '../../generated/prisma';
import { randomBytes } from 'crypto';
import { ERROR_CODES, ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private clientValidationService: ClientValidationService,
    private clientStatsService: ClientStatsService,
    private emailService: EmailService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
  ) {}

  private get appName(): string {
    return this.configService.get<string>('APP_NAME') || 'WhiteLabel';
  }

  // ==================== CREATE CLIENT ====================

  async createClient(
    brandId: number,
    createClientDto: CreateClientDto,
    ownerId: number,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    console.log('\n🔍 === REGISTRO DE CLIENTE INICIADO ===');
    console.log('📧 Email:', createClientDto.email);
    console.log(
      '👤 Nombre:',
      createClientDto.firstName,
      createClientDto.lastName,
    );
    console.log('📱 Teléfono:', createClientDto.phone);
    console.log('🏢 BrandId:', brandId);
    console.log('👔 OwnerId:', ownerId);
    console.log('📅 Timestamp:', new Date().toISOString());

    const errors: ErrorDetail[] = [];

    try {
      // Verificar permisos del owner sobre el brand
      console.log('\n🔐 Verificando permisos del owner...');
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );

      if (!hasPermission) {
        console.log('❌ Sin permisos para este brand');
        errors.push({
          code: ERROR_CODES.FORBIDDEN,
          description:
            'No tienes permisos para registrar clientes en este negocio',
        });
        return BaseResponseDto.error(errors);
      }
      console.log('✅ Permisos verificados');

      // Verificar marca existe
      console.log('\n🏢 Verificando marca existe...');
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
        select: { id: true, name: true },
      });

      if (!brand) {
        console.log('❌ Marca no encontrada:', brandId);
        errors.push({
          code: ERROR_CODES.BRANCH_NOT_EXISTS,
          description: ERROR_MESSAGES.BRANCH_NOT_EXISTS,
        });
        return BaseResponseDto.error(errors);
      }
      console.log('✅ Marca encontrada:', brand);

      // Validar formato de teléfono si se proporciona
      console.log('\n📱 Validando formato de teléfono...');
      if (
        createClientDto.phone &&
        !this.clientValidationService.validatePhoneFormat(createClientDto.phone)
      ) {
        console.log('❌ Formato de teléfono inválido');
        errors.push({
          code: ERROR_CODES.INVALID_PLAN,
          description: 'Formato de teléfono inválido',
        });
      } else if (createClientDto.phone) {
        console.log('✅ Formato de teléfono válido');
      } else {
        console.log('ℹ️ Teléfono no proporcionado');
      }

      // Verificar email único en el brand
      console.log('\n📧 Verificando email único en marca...');
      const emailValidation =
        await this.clientValidationService.validateEmailForBrand(
          createClientDto.email,
          brandId,
        );

      if (!emailValidation.isAvailable) {
        console.log('❌ EMAIL YA REGISTRADO EN ESTA MARCA');
        errors.push({
          code: ERROR_CODES.EMAIL_EXISTS_IN_BRANCH,
          description: ERROR_MESSAGES.EMAIL_EXISTS_IN_BRANCH,
        });
      } else if (emailValidation.existingClient) {
        console.log('✅ Usuario existe pero no en esta marca - se asociará');
      } else {
        console.log('✅ Email completamente nuevo en el sistema');
      }

      if (errors.length > 0) {
        console.log('\n❌ ERRORES ENCONTRADOS:', errors);
        return BaseResponseDto.error(errors);
      }

      // Crear o obtener usuario
      console.log('\n👤 Creando/obteniendo usuario...');
      let user;

      if (emailValidation.existingClient) {
        console.log('🔄 Usando usuario existente:', {
          id: emailValidation.existingClient.id,
          email: emailValidation.existingClient.email,
        });
        user = emailValidation.existingClient;

        // Actualizar información si es necesario
        if (
          createClientDto.firstName ||
          createClientDto.lastName ||
          createClientDto.phone
        ) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              firstName: createClientDto.firstName || user.firstName,
              lastName: createClientDto.lastName || user.lastName,
            },
          });
          console.log('✅ Información del usuario actualizada');
        }
      } else {
        console.log('🆕 Creando nuevo usuario...');

        // Generar username único
        const username =
          await this.clientValidationService.generateUniqueUsername(
            createClientDto.email,
          );

        user = await this.prisma.user.create({
          data: {
            email: createClientDto.email.toLowerCase(),
            username,
            firstName: createClientDto.firstName,
            lastName: createClientDto.lastName || null,
            role: UserRole.CLIENT,
          },
        });
        console.log('✅ Usuario creado:', {
          id: user.id,
          email: user.email,
          username: user.username,
        });
      }

      // Crear UserBrand con datos adicionales del cliente
      console.log('\n🔗 Creando relación UserBrand...');

      // Generar contraseña temporal si no existe
      const tempPassword = this.generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      const salt = randomBytes(32).toString('hex');

      const userBrand = await this.prisma.userBrand.create({
        data: {
          userId: user.id,
          brandId: brandId,
          passwordHash,
          salt,
        },
      });

      console.log('✅ UserBrand creado:', {
        id: userBrand.id,
        userId: userBrand.userId,
        brandId: userBrand.brandId,
      });

      // Obtener estadísticas del cliente
      const stats = await this.clientStatsService.getClientStats(
        user.id,
        brandId,
      );

      // Enviar email de bienvenida si es nuevo
      if (!emailValidation.existingClient) {
        await this.sendWelcomeClientEmail(user, brand, tempPassword);
      }

      const response: ClientResponseDto = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || null,
        phone: createClientDto.phone || '',
        notes: createClientDto.notes || null,
        isActive: true,
        brandId: brandId,
        totalAppointments: stats.totalAppointments,
        lastVisit: stats.lastVisit || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      console.log('\n🎉 === REGISTRO DE CLIENTE EXITOSO ===');
      console.log('✅ Cliente registrado:', user.email);
      console.log('✅ En marca:', brand.name);

      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('\n💥 === ERROR EN REGISTRO DE CLIENTE ===');
      console.error('Error en createClient:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== LIST CLIENTS ====================
  async listClients(
    brandId: number,
    ownerId: number,
    filters: ClientFilters,
  ): Promise<BaseResponseDto<ClientListResponseDto>> {
    console.log('\n🔍 === LISTADO DE CLIENTES INICIADO ===');
    console.log('🏢 BrandId:', brandId);
    console.log('📄 Página:', filters.page);
    console.log('📊 Límite:', filters.limit);
    console.log('🔎 Búsqueda:', filters.search);
    console.log('✅ Solo activos:', filters.active);
    console.log('📋 Ordenar por:', filters.sortBy);
    console.log('🔄 Orden:', filters.sortOrder);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver los clientes de este negocio',
        );
      }

      // Construir where clause
      const where: any = {
        brandId,
        user: {
          role: 'CLIENT', // Usar string en lugar de enum para evitar problemas
          ...(filters.active !== undefined && { isActive: filters.active }),
          ...(filters.search && {
            OR: [
              { email: { contains: filters.search, mode: 'insensitive' } },
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
              { phone: { contains: filters.search, mode: 'insensitive' } },
            ],
          }),
        },
      };

      // Obtener total
      const total = await this.prisma.userBrand.count({ where });

      // Valores por defecto para paginación
      const page = filters.page || 1;
      const limit = filters.limit || 10;

      // Calcular paginación
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Configurar ordenamiento
      let orderBy: any = { createdAt: 'desc' }; // default

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'firstName':
          case 'email':
            orderBy = {
              user: {
                [filters.sortBy]: filters.sortOrder || 'asc',
              },
            };
            break;
          case 'createdAt':
            orderBy = {
              createdAt: filters.sortOrder || 'desc',
            };
            break;
          case 'lastVisit':
            // Para lastVisit necesitamos un orderBy más complejo, por ahora usar createdAt
            orderBy = { createdAt: filters.sortOrder || 'desc' };
            break;
          default:
            orderBy = { createdAt: 'desc' };
        }
      }

      // Obtener clientes
      const userBrands = await this.prisma.userBrand.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy,
      });

      console.log('📊 UserBrands encontrados:', userBrands.length);

      // Obtener estadísticas para cada cliente
      const clients: ClientResponseDto[] = await Promise.all(
        userBrands.map(async (ub) => {
          try {
            const stats = await this.clientStatsService.getClientStats(
              ub.userId,
              brandId,
            );

            return {
              id: ub.user.id,
              email: ub.user.email,
              firstName: ub.user.firstName || '',
              lastName: ub.user.lastName || null,
              phone: ub.user.phone || '', // Usar el campo phone del User
              notes: ub.notes || null, // Usar el campo notes del UserBrand
              isActive: ub.user.isActive,
              brandId: brandId,
              totalAppointments: stats.totalAppointments,
              lastVisit: stats.lastVisit || null,
              createdAt: ub.createdAt,
              updatedAt: ub.updatedAt,
            };
          } catch (statsError) {
            console.error(
              'Error obteniendo stats para usuario:',
              ub.userId,
              statsError,
            );
            // Devolver cliente con stats por defecto si falla
            return {
              id: ub.user.id,
              email: ub.user.email,
              firstName: ub.user.firstName || '',
              lastName: ub.user.lastName || null,
              phone: ub.user.phone || '',
              notes: ub.notes || null,
              isActive: ub.user.isActive,
              brandId: brandId,
              totalAppointments: 0,
              lastVisit: null,
              createdAt: ub.createdAt,
              updatedAt: ub.updatedAt,
            };
          }
        }),
      );

      const response: ClientListResponseDto = {
        clients,
        pagination: {
          total,
          page: page,
          limit: limit,
          totalPages,
        },
      };

      console.log('✅ Clientes obtenidos exitosamente:', clients.length);
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('❌ Error en listClients:', error);
      console.error('Stack trace:', error.stack);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET CLIENT ====================
  async getClient(
    brandId: number,
    clientId: number,
    ownerId: number,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    console.log('\n🔍 === OBTENER CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver este cliente',
        );
      }

      // Buscar cliente
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId: clientId,
          brandId: brandId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!userBrand) {
        console.log('❌ Cliente no encontrado');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado',
        );
      }

      // Obtener estadísticas
      const stats = await this.clientStatsService.getClientStats(
        clientId,
        brandId,
      );

      const response: ClientResponseDto = {
        id: userBrand.user.id,
        email: userBrand.user.email,
        firstName: userBrand.user.firstName || '',
        lastName: userBrand.user.lastName || null,
        phone: userBrand.user.phone || '', // Usar el campo phone del User
        notes: userBrand.notes || null, // Usar el campo notes del UserBrand
        isActive: userBrand.user.isActive,
        brandId: brandId,
        totalAppointments: stats.totalAppointments,
        lastVisit: stats.lastVisit || null,
        createdAt: userBrand.user.createdAt,
        updatedAt: userBrand.user.updatedAt,
      };

      console.log('✅ Cliente obtenido:', userBrand.user.email);
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('❌ Error en getClient:', error);
      console.error('Stack trace:', error.stack);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET MY PROFILE (CLIENT SELF-ACCESS) ====================

  async getMyProfile(
    brandId: number,
    clientId: number,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    console.log('\n👤 === OBTENER MI PERFIL ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);

    try {
      // Para el perfil propio, no necesitamos validateBrandOwnership
      // Solo verificamos que el cliente exista y esté activo en el brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId: clientId,
          brandId: brandId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!userBrand) {
        console.log('❌ Cliente no encontrado o inactivo');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado o inactivo',
        );
      }

      // Verificar que sea realmente un cliente
      if (userBrand.user.role !== 'CLIENT') {
        console.log('❌ Usuario no es cliente');
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'Solo los clientes pueden acceder a su perfil',
        );
      }

      // Obtener estadísticas
      const stats = await this.clientStatsService.getClientStats(
        clientId,
        brandId,
      );

      const response: ClientResponseDto = {
        id: userBrand.user.id,
        email: userBrand.user.email,
        firstName: userBrand.user.firstName || '',
        lastName: userBrand.user.lastName || null,
        phone: userBrand.user.phone || '',
        notes: userBrand.notes || null,
        isActive: userBrand.user.isActive,
        brandId: brandId,
        totalAppointments: stats.totalAppointments,
        lastVisit: stats.lastVisit || null,
        createdAt: userBrand.user.createdAt,
        updatedAt: userBrand.user.updatedAt,
      };

      console.log('✅ Mi perfil obtenido:', userBrand.user.email);
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('❌ Error en getMyProfile:', error);
      console.error('Stack trace:', error.stack);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== UPDATE CLIENT ====================

  async updateClient(
    brandId: number,
    clientId: number,
    updateClientDto: UpdateClientDto,
    ownerId: number,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    console.log('\n🔍 === ACTUALIZAR CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('📝 Datos a actualizar:', updateClientDto);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para actualizar este cliente',
        );
      }

      // Verificar que el cliente existe en este brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId: clientId,
          brandId: brandId,
        },
      });

      if (!userBrand) {
        console.log('❌ Cliente no encontrado en este brand');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado',
        );
      }

      // Validar teléfono si se está actualizando
      if (
        updateClientDto.phone &&
        !this.clientValidationService.validatePhoneFormat(updateClientDto.phone)
      ) {
        return BaseResponseDto.singleError(
          ERROR_CODES.INVALID_PLAN,
          'Formato de teléfono inválido',
        );
      }

      // Actualizar usuario
      const updatedUser = await this.prisma.user.update({
        where: { id: clientId },
        data: {
          firstName: updateClientDto.firstName,
          lastName: updateClientDto.lastName,
          phone: updateClientDto.phone,
          isActive: updateClientDto.isActive,
        },
      });

      // Actualizar notes en UserBrand
      const updatedUserBrand = await this.prisma.userBrand.update({
        where: { id: userBrand.id },
        data: {
          notes: updateClientDto.notes,
        },
      });

      // Obtener estadísticas
      const stats = await this.clientStatsService.getClientStats(
        clientId,
        brandId,
      );

      const response: ClientResponseDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || null,
        phone: updatedUser.phone || '',
        notes: updatedUserBrand.notes || null,
        isActive: updatedUser.isActive,
        brandId: brandId,
        totalAppointments: stats.totalAppointments,
        lastVisit: stats.lastVisit || null,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      console.log('✅ Cliente actualizado:', updatedUser.email);
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error en updateClient:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== DELETE CLIENT ====================

  async deleteClient(
    brandId: number,
    clientId: number,
    ownerId: number,
  ): Promise<BaseResponseDto> {
    console.log('\n🔍 === ELIMINAR CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para eliminar este cliente',
        );
      }

      // Verificar que el cliente existe en este brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId: clientId,
          brandId: brandId,
        },
      });

      if (!userBrand) {
        console.log('❌ Cliente no encontrado en este brand');
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado',
        );
      }

      // Soft delete - solo desactivar
      await this.prisma.userBrand.update({
        where: { id: userBrand.id },
        data: { isActive: false },
      });

      console.log('✅ Cliente desactivado exitosamente');
      return BaseResponseDto.success(null);
    } catch (error) {
      console.error('Error en deleteClient:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== CHECK EMAIL AVAILABILITY ====================

  async checkEmailAvailability(
    brandId: number,
    email: string,
    ownerId: number,
  ): Promise<BaseResponseDto<CheckEmailResponseDto>> {
    console.log('\n🔍 === VERIFICAR EMAIL ===');
    console.log('📧 Email:', email);
    console.log('🏢 BrandId:', brandId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para verificar emails en este negocio',
        );
      }

      const validation =
        await this.clientValidationService.validateEmailForBrand(
          email,
          brandId,
        );

      const response: CheckEmailResponseDto = {
        available: validation.isAvailable,
        message: validation.isAvailable
          ? 'Email disponible'
          : 'Email ya registrado en este negocio',
        existingClient: validation.existingClient
          ? {
              id: validation.existingClient.id,
              email: validation.existingClient.email,
              firstName: validation.existingClient.firstName,
              lastName: validation.existingClient.lastName,
            }
          : undefined,
      };

      console.log(
        '✅ Verificación completada:',
        response.available ? 'Disponible' : 'No disponible',
      );
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error en checkEmailAvailability:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== CHECK PHONE AVAILABILITY ====================

  async checkPhoneAvailability(
    brandId: number,
    phone: string,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === VERIFICAR TELÉFONO ===');
    console.log('📱 Teléfono:', phone);
    console.log('🏢 BrandId:', brandId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para verificar teléfonos en este negocio',
        );
      }

      // Validar formato de teléfono
      if (!this.clientValidationService.validatePhoneFormat(phone)) {
        return BaseResponseDto.singleError(
          ERROR_CODES.INVALID_PLAN,
          'Formato de teléfono inválido',
        );
      }

      // TODO: Implementar búsqueda por teléfono cuando se agregue el campo

      const response = {
        available: true,
        message: 'Teléfono disponible',
      };

      console.log('✅ Verificación completada');
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error en checkPhoneAvailability:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET CLIENT STATS DETAILED ====================

  async getClientStatsDetailed(
    brandId: number,
    clientId: number,
    period: string,
    ownerId: number,
  ): Promise<BaseResponseDto<ClientStatsResponseDto>> {
    console.log('\n🔍 === ESTADÍSTICAS DETALLADAS DE CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('📅 Período:', period);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver estadísticas de este negocio',
        );
      }

      // Llamar al servicio con el orden correcto de parámetros
      const stats = await this.clientStatsService.getClientStatsDetailed(
        clientId,
        brandId,
        period,
      );

      console.log('✅ Estadísticas obtenidas');
      return BaseResponseDto.success(stats);
    } catch (error) {
      console.error('Error en getClientStatsDetailed:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET TOP CLIENTS ====================

  async getTopClients(
    brandId: number,
    limit: number,
    period: string,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === TOP CLIENTES ===');
    console.log('🏢 BrandId:', brandId);
    console.log('📊 Límite:', limit);
    console.log('📅 Período:', period);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver clientes de este negocio',
        );
      }

      const topClients = await this.clientStatsService.getTopClients(
        brandId,
        limit,
        period,
      );

      console.log('✅ Top clientes obtenidos:', topClients.length);
      return BaseResponseDto.success({ clients: topClients });
    } catch (error) {
      console.error('Error en getTopClients:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET CLIENTS SUMMARY ====================

  async getClientsSummary(
    brandId: number,
    period: string,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === RESUMEN DE CLIENTES ===');
    console.log('🏢 BrandId:', brandId);
    console.log('📅 Período:', period);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver resúmenes de este negocio',
        );
      }

      const summary = await this.clientStatsService.getClientsSummary(
        brandId,
        period,
      );

      console.log('✅ Resumen obtenido');
      return BaseResponseDto.success(summary);
    } catch (error) {
      console.error('Error en getClientsSummary:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== IMPORT CLIENTS ====================

  async importClients(
    brandId: number,
    importClientsDto: ImportClientsDto,
    ownerId: number,
  ): Promise<BaseResponseDto<ImportClientsResponseDto>> {
    console.log('\n🔍 === IMPORTAR CLIENTES ===');
    console.log('🏢 BrandId:', brandId);
    console.log('📊 Clientes a importar:', importClientsDto.clients.length);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para importar clientes en este negocio',
        );
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as any[],
      };

      // Procesar cada cliente
      for (const clientData of importClientsDto.clients) {
        try {
          // Preparar datos con valores por defecto si es necesario
          const createData: CreateClientDto = {
            email: clientData.email,
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            phone: clientData.phone || '', // Proporcionar string vacío si no hay phone
            notes: clientData.notes,
          };

          const result = await this.createClient(brandId, createData, ownerId);
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push({
              email: clientData.email,
              errors: result.errors,
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            email: clientData.email,
            error: 'Error procesando cliente',
          });
        }
      }

      const response: ImportClientsResponseDto = {
        total: importClientsDto.clients.length,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors,
      };

      console.log('✅ Importación completada:', response);
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error en importClients:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== EXPORT CLIENTS ====================

  async exportClients(
    brandId: number,
    format: string,
    active: boolean | undefined,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === EXPORTAR CLIENTES ===');
    console.log('🏢 BrandId:', brandId);
    console.log('📄 Formato:', format);
    console.log('✅ Solo activos:', active);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para exportar clientes de este negocio',
        );
      }

      // Obtener todos los clientes
      const where: any = {
        brandId,
        user: {
          role: UserRole.CLIENT,
          ...(active !== undefined && { isActive: active }),
        },
      };

      const userBrands = await this.prisma.userBrand.findMany({
        where,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Formatear datos para exportación
      const clients = await Promise.all(
        userBrands.map(async (ub) => {
          // Obtener estadísticas básicas del cliente
          const stats = await this.clientStatsService.getClientStats(
            ub.userId,
            brandId,
          );

          return {
            id: ub.user.id,
            email: ub.user.email,
            firstName: ub.user.firstName || '',
            lastName: ub.user.lastName,
            phone: '', // TODO: Agregar campo phone
            isActive: ub.user.isActive,
            createdAt: ub.createdAt,
            updatedAt: ub.updatedAt,
            totalAppointments: stats.totalAppointments,
            totalRevenue: 0, // TODO: Calcular cuando esté el módulo de payments
            lastVisit: stats.lastVisit,
          };
        }),
      );

      if (format === 'json') {
        console.log('✅ Exportación JSON completada');
        return BaseResponseDto.success({
          clients,
          total: clients.length,
          format: 'json',
          exportedAt: new Date(),
        });
      } else {
        // Generar CSV
        const csvHeader =
          'id,email,firstName,lastName,phone,isActive,createdAt,updatedAt,totalAppointments,totalRevenue,lastVisit';
        const csvRows = clients.map(
          (c) =>
            `${c.id},${c.email},${c.firstName || ''},${c.lastName || ''},${c.phone || ''},${c.isActive},${c.createdAt.toISOString()},${c.updatedAt.toISOString()},${c.totalAppointments},${c.totalRevenue},${c.lastVisit?.toISOString() || ''}`,
        );
        const csvContent = [csvHeader, ...csvRows].join('\n');

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');

        console.log('✅ Exportación CSV completada');
        return BaseResponseDto.success({
          csv: csvContent,
          total: clients.length,
          format: 'csv',
          filename: `clients_export_${dateStr}.csv`,
        });
      }
    } catch (error) {
      console.error('Error en exportClients:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET CLIENT APPOINTMENTS ====================

  async getClientAppointments(
    brandId: number,
    clientId: number,
    filters: any,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === CITAS DEL CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver citas de este negocio',
        );
      }

      // TODO: Implementar cuando esté el módulo de appointments
      const appointments = [];

      console.log('✅ Citas obtenidas');
      return BaseResponseDto.success({ appointments });
    } catch (error) {
      console.error('Error en getClientAppointments:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET CLIENT ACTIVITY ====================

  async getClientActivity(
    brandId: number,
    clientId: number,
    page: number,
    limit: number,
    ownerId: number,
  ): Promise<BaseResponseDto<ClientActivityResponseDto>> {
    console.log('\n🔍 === ACTIVIDAD DEL CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('👔 OwnerId:', ownerId);

    try {
      // Verificar permisos: Owner del brand O el cliente viendo su propia actividad
      let hasPermission = false;
      
      // Caso 1: Es el mismo cliente viendo su propia actividad
      if (ownerId === clientId) {
        console.log('🔍 Cliente viendo su propia actividad');
        // Verificar que el usuario esté registrado en este brand
        const userBrand = await this.prisma.userBrand.findFirst({
          where: {
            userId: clientId,
            brandId: brandId,
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

        if (userBrand && userBrand.user.role === 'CLIENT' && userBrand.user.isActive) {
          hasPermission = true;
          console.log('✅ Cliente tiene acceso a su propia actividad');
        }
      } else {
        // Caso 2: Es un owner/admin del brand
        console.log('🔍 Owner/Admin viendo actividad de cliente');
        hasPermission = await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      }

      if (!hasPermission) {
        console.log('❌ Sin permisos para ver actividad');
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver esta actividad',
        );
      }

      // TODO: Implementar sistema de actividad/logs
      const activities: any[] = [];

      const response: ClientActivityResponseDto = {
        activities,
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };

      console.log('✅ Actividad obtenida');
      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('Error en getClientActivity:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== CLIENT NOTES ====================

  async getClientNotes(
    brandId: number,
    clientId: number,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === NOTAS DEL CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para ver notas de este negocio',
        );
      }

      // Obtener las notas de la base de datos
      const notes = await this.prisma.clientNote.findMany({
        where: {
          clientId: clientId,
          brandId: brandId,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log('✅ Notas obtenidas:', notes.length);
      return BaseResponseDto.success({ notes });
    } catch (error) {
      console.error('Error en getClientNotes:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  async addClientNote(
    brandId: number,
    clientId: number,
    note: string,
    isPrivate: boolean,
    ownerId: number,
  ): Promise<BaseResponseDto<any>> {
    console.log('\n🔍 === AGREGAR NOTA AL CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('📝 Nota:', note);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        return BaseResponseDto.singleError(
          ERROR_CODES.FORBIDDEN,
          'No tienes permisos para agregar notas en este negocio',
        );
      }

      // Verificar que el cliente existe
      const client = await this.prisma.user.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado',
        );
      }

      // Crear la nota en la base de datos
      const newNote = await this.prisma.clientNote.create({
        data: {
          clientId: clientId,
          brandId: brandId,
          note: note,
          isPrivate: isPrivate,
          createdBy: ownerId,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('✅ Nota agregada con ID:', newNote.id);
      return BaseResponseDto.success(newNote);
    } catch (error) {
      console.error('Error en addClientNote:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  async deleteClientNote(
    brandId: number,
    clientId: number,
    noteId: number,
    ownerId: number,
  ): Promise<void> {
    console.log('\n🔍 === ELIMINAR NOTA DEL CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('📝 NoteId:', noteId);

    try {
      // Verificar permisos
      const hasPermission =
        await this.clientValidationService.validateBrandOwnership(
          ownerId,
          brandId,
        );
      if (!hasPermission) {
        throw new Error(
          'No tienes permisos para eliminar notas en este negocio',
        );
      }

      // Verificar que la nota existe y pertenece al brand/cliente correcto
      const existingNote = await this.prisma.clientNote.findFirst({
        where: {
          id: noteId,
          clientId: clientId,
          brandId: brandId,
        },
      });

      if (!existingNote) {
        throw new Error(
          'Nota no encontrada o no tienes permisos para eliminarla',
        );
      }

      // Eliminar la nota
      await this.prisma.clientNote.delete({
        where: {
          id: noteId,
        },
      });

      console.log('✅ Nota eliminada');
    } catch (error) {
      console.error('Error en deleteClientNote:', error);
      throw error;
    }
  }

  // ==================== UPDATE CLIENT PROFILE (SELF) ====================

  async updateClientProfile(
    brandId: number,
    clientId: number,
    updateClientProfileDto: UpdateClientProfileDto,
  ): Promise<BaseResponseDto<ClientResponseDto>> {
    console.log('\n🔍 === CLIENTE ACTUALIZANDO SU PROPIO PERFIL ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('📝 Datos a actualizar:', updateClientProfileDto);

    const errors: ErrorDetail[] = [];

    try {
      // Verificar que el cliente existe y tiene acceso a este brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId: clientId,
          brandId: brandId,
          isActive: true,
          user: {
            role: UserRole.CLIENT,
            isActive: true,
          },
        },
        include: {
          user: true,
        },
      });

      if (!userBrand) {
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado o sin acceso a este negocio',
        );
      }

      // Validar email único si se está actualizando
      if (
        updateClientProfileDto.email &&
        updateClientProfileDto.email !== userBrand.user.email
      ) {
        const emailValidation =
          await this.clientValidationService.validateEmailForBrand(
            updateClientProfileDto.email,
            brandId,
            clientId, // Excluir el cliente actual de la verificación
          );

        if (!emailValidation.isAvailable) {
          errors.push({
            code: ERROR_CODES.EMAIL_EXISTS_IN_BRANCH,
            message:
              'Este email ya está en uso por otro cliente en este negocio',
          });
        }
      }

      // Validar teléfono si se proporciona
      if (
        updateClientProfileDto.phone &&
        !this.clientValidationService.validatePhoneFormat(
          updateClientProfileDto.phone,
        )
      ) {
        errors.push({
          code: ERROR_CODES.INVALID_PASSWORD, // Usar un código existente como alternativa
          message: 'Formato de teléfono inválido',
        });
      }

      if (errors.length > 0) {
        return BaseResponseDto.error(errors);
      }

      // Actualizar datos del usuario
      const updateData: any = {};

      if (updateClientProfileDto.firstName !== undefined) {
        updateData.firstName = updateClientProfileDto.firstName;
      }

      if (updateClientProfileDto.lastName !== undefined) {
        updateData.lastName = updateClientProfileDto.lastName;
      }

      if (updateClientProfileDto.email !== undefined) {
        updateData.email = updateClientProfileDto.email;
      }

      // Actualizar usuario
      const updatedUser = await this.prisma.user.update({
        where: { id: clientId },
        data: updateData,
      });

      // TODO: Actualizar teléfono cuando se implemente en el schema
      // if (updateClientProfileDto.phone !== undefined) {
      //   // Actualizar teléfono en UserBrand o donde corresponda
      // }

      // Obtener estadísticas actualizadas
      const stats = await this.clientStatsService.getClientStats(
        clientId,
        brandId,
      );

      const response: ClientResponseDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || null,
        phone: updateClientProfileDto.phone || '', // Temporal hasta implementar en DB
        notes: null, // Los clientes no pueden ver/editar sus notas
        isActive: updatedUser.isActive,
        brandId: brandId,
        totalAppointments: stats.totalAppointments,
        lastVisit: stats.lastVisit || null,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      console.log('\n🎉 === PERFIL ACTUALIZADO EXITOSAMENTE ===');
      console.log('✅ Cliente:', updatedUser.email);
      console.log('✅ En marca:', brandId);

      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('\n💥 === ERROR EN ACTUALIZACIÓN DE PERFIL ===');
      console.error('Error en updateClientProfile:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== GET CLIENT APPOINTMENTS HISTORY (SELF) ====================

  async getClientAppointmentsHistory(
    brandId: number,
    clientId: number,
    queryFilters: GetClientAppointmentsQueryDto,
  ): Promise<BaseResponseDto<ClientAppointmentListResponseDto>> {
    console.log('\n🔍 === HISTORIAL DE CITAS DEL CLIENTE ===');
    console.log('🏢 BrandId:', brandId);
    console.log('👤 ClientId:', clientId);
    console.log('📅 Filtros:', queryFilters);

    try {
      // Verificar que el cliente existe y tiene acceso a este brand
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId: clientId,
          brandId: brandId,
          isActive: true,
          user: {
            role: UserRole.CLIENT,
            isActive: true,
          },
        },
        include: {
          user: true,
        },
      });

      if (!userBrand) {
        return BaseResponseDto.singleError(
          ERROR_CODES.USER_NOT_FOUND,
          'Cliente no encontrado o sin acceso a este negocio',
        );
      }

      // Construir filtros de fecha
      const where: any = {
        brandId,
        clientId,
      };

      // Filtros de fecha según el período
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (queryFilters.period) {
        switch (queryFilters.period) {
          case 'upcoming':
            where.startTime = { gte: now };
            break;
          case 'past':
            where.startTime = { lt: today };
            break;
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            where.startTime = {
              gte: today,
              lt: tomorrow,
            };
            break;
          // 'all' no necesita filtro adicional
        }
      }

      // Filtros de fecha específicos si se proporcionan
      if (queryFilters.startDate || queryFilters.endDate) {
        where.startTime = {};
        if (queryFilters.startDate) {
          where.startTime.gte = new Date(queryFilters.startDate);
        }
        if (queryFilters.endDate) {
          const endDate = new Date(queryFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          where.startTime.lte = endDate;
        }
      }

      // Filtro de estado
      if (queryFilters.status) {
        where.status = queryFilters.status;
      }

      // Obtener total de citas
      const total = await this.prisma.appointment.count({ where });

      // Paginación
      const page = queryFilters.page || 1;
      const limit = queryFilters.limit || 10;
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Obtener citas
      const appointments = await this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startTime: 'desc', // Más recientes primero
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          duration: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Obtener estadísticas de resumen
      const summaryStats = await this.prisma.appointment.groupBy({
        by: ['status'],
        where: {
          brandId,
          clientId,
        },
        _count: {
          id: true,
        },
      });

      // Procesar estadísticas
      const summary = {
        totalAppointments: total,
        completedAppointments:
          summaryStats.find((s) => s.status === 'COMPLETED')?._count.id || 0,
        cancelledAppointments:
          summaryStats.find((s) => s.status === 'CANCELLED')?._count.id || 0,
        pendingAppointments:
          summaryStats.find((s) => s.status === 'PENDING')?._count.id || 0,
      };

      // Formatear respuesta
      const formattedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes || undefined, // Convertir null a undefined
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      }));

      const response = {
        appointments: formattedAppointments,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
        summary,
      };

      console.log('✅ Historial de citas obtenido:', {
        totalCitas: total,
        citasEnPagina: formattedAppointments.length,
        pagina: page,
      });

      return BaseResponseDto.success(response);
    } catch (error) {
      console.error('\n💥 === ERROR EN HISTORIAL DE CITAS ===');
      console.error('Error en getClientAppointmentsHistory:', error);
      return BaseResponseDto.singleError(
        ERROR_CODES.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
      );
    }
  }

  // ==================== PRIVATE METHODS ====================

  private generateTempPassword(): string {
    // Generar contraseña temporal de 8 caracteres
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async sendWelcomeClientEmail(
    user: any,
    brand: any,
    tempPassword: string,
  ): Promise<void> {
    try {
      console.log('📧 Enviando email de bienvenida a:', user.email);

      await this.emailService.sendEmail({
        to: user.email,
        subject: `Bienvenido a ${brand.name}`,
        html: this.emailService.loadTemplate('client-welcome', {
          appName: this.appName,
          brandName: brand.name,
          userName: user.firstName || 'Cliente',
          userEmail: user.email,
          tempPassword: tempPassword,
          loginUrl: `${this.configService.get('FRONTEND_URL')}/login`,
          supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tuapp.com',
          currentYear: new Date().getFullYear().toString(),
        }),
      });

      console.log('✅ Email de bienvenida enviado');
    } catch (error) {
      // No fallar el proceso principal si el email falla
      console.error('Error enviando email de bienvenida:', error);
    }
  }
}
