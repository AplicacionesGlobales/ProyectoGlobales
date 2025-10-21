// src/sprint11/sprint11.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto';

@Injectable()
export class Sprint11Service {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida coordenadas geográficas
   */
  private validateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }
  }

  /**
   * Verifica si el usuario tiene permiso para modificar la ubicación de la cita
   * Puede ser el cliente de la cita o un usuario del brand (owner o admin)
   */
  private async validateUserAccess(
    appointmentId: number,
    userId: number,
  ): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        brand: {
          include: {
            owner: true,
            userBrands: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    // Verificar si es el cliente de la cita
    const isAppointmentClient = appointment.clientId === userId;

    // Verificar si es el owner del brand
    const isBrandOwner = appointment.brand.ownerId === userId;

    // Verificar si es un usuario del brand (admin/colaborador)
    const isBrandUser = appointment.brand.userBrands.length > 0;

    if (!isAppointmentClient && !isBrandOwner && !isBrandUser) {
      throw new ForbiddenException(
        'You do not have permission to modify this appointment location',
      );
    }
  }

  /**
   * Crea una ubicación para una cita
   */
  async createLocation(
    appointmentId: number,
    dto: CreateLocationDto,
    userId: number,
  ) {
    // Validar que el usuario tiene permiso
    await this.validateUserAccess(appointmentId, userId);

    // Validar coordenadas
    this.validateCoordinates(dto.latitude, dto.longitude);

    // Verificar si ya existe una ubicación para esta cita
    const existingLocation = await this.prisma.appointmentLocation.findUnique({
      where: { appointmentId },
    });

    if (existingLocation) {
      throw new ConflictException(
        `Location already exists for appointment ${appointmentId}`,
      );
    }

    // Crear la ubicación
    return this.prisma.appointmentLocation.create({
      data: {
        appointmentId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        postalCode: dto.postalCode,
        notes: dto.notes,
      },
    });
  }

  /**
   * Obtiene la ubicación de una cita por ID de cita
   */
  async getLocationByAppointmentId(appointmentId: number, userId: number) {
    // Validar que el usuario tiene permiso
    await this.validateUserAccess(appointmentId, userId);

    const location = await this.prisma.appointmentLocation.findUnique({
      where: { appointmentId },
    });

    if (!location) {
      throw new NotFoundException(
        `Location not found for appointment ${appointmentId}`,
      );
    }

    return location;
  }

  /**
   * Obtiene una ubicación por su ID
   */
  async getLocationById(locationId: number, userId: number) {
    const location = await this.prisma.appointmentLocation.findUnique({
      where: { id: locationId },
      include: {
        appointment: true,
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    // Validar que el usuario tiene permiso
    await this.validateUserAccess(location.appointmentId, userId);

    // Retornar solo la ubicación sin el appointment completo
    const { appointment, ...locationData } = location;
    return locationData;
  }
}
