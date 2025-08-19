// src/appointments/tests/appointments.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    userBrand: {
      findFirst: jest.fn(),
    },
    appointmentSettings: {
      findUnique: jest.fn(),
    },
    businessHours: {
      findMany: jest.fn(),
    },
    specialHours: {
      findMany: jest.fn(),
    },
    appointment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('validateAppointmentAvailability', () => {
    it('should throw error if business is closed on that day', async () => {
      // Configurar mocks
      mockPrismaService.appointmentSettings.findUnique.mockResolvedValue({
        defaultDuration: 30,
        bufferTime: 5,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowSameDayBooking: true,
      });

      mockPrismaService.businessHours.findMany.mockResolvedValue([
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 0, isOpen: false }, // Domingo cerrado
      ]);

      mockPrismaService.specialHours.findMany.mockResolvedValue([]);

      const startTime = new Date('2024-08-18T10:00:00Z'); // Domingo
      const endTime = new Date('2024-08-18T10:30:00Z');

      await expect(
        service['validateAppointmentAvailability'](1, startTime, endTime)
      ).rejects.toThrow('El negocio está cerrado este día');
    });

    it('should throw error if appointment is outside business hours', async () => {
      mockPrismaService.appointmentSettings.findUnique.mockResolvedValue({
        defaultDuration: 30,
        bufferTime: 5,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowSameDayBooking: true,
      });

      mockPrismaService.businessHours.findMany.mockResolvedValue([
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      ]);

      mockPrismaService.specialHours.findMany.mockResolvedValue([]);

      // Lunes 8 AM (antes de abrir)
      const startTime = new Date('2024-08-19T08:00:00Z');
      const endTime = new Date('2024-08-19T08:30:00Z');

      await expect(
        service['validateAppointmentAvailability'](1, startTime, endTime)
      ).rejects.toThrow('La cita debe estar entre 09:00 y 18:00');
    });

    it('should throw error if appointment conflicts with existing one', async () => {
      mockPrismaService.appointmentSettings.findUnique.mockResolvedValue({
        defaultDuration: 30,
        bufferTime: 5,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowSameDayBooking: true,
      });

      mockPrismaService.businessHours.findMany.mockResolvedValue([
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      ]);

      mockPrismaService.specialHours.findMany.mockResolvedValue([]);

      // Mock de cita existente que se superpone
      mockPrismaService.appointment.findFirst.mockResolvedValue({
        id: 1,
        startTime: new Date('2024-08-19T10:00:00Z'),
        endTime: new Date('2024-08-19T10:30:00Z'),
      });

      const startTime = new Date('2024-08-19T10:15:00Z'); // Se superpone
      const endTime = new Date('2024-08-19T10:45:00Z');

      await expect(
        service['validateAppointmentAvailability'](1, startTime, endTime)
      ).rejects.toThrow('Ya existe una cita programada en este horario');
    });
  });

  describe('createAppointment', () => {
    it('should create appointment successfully', async () => {
      const mockAppointment = {
        id: 1,
        brandId: 1,
        clientId: 2,
        startTime: new Date('2024-08-19T10:00:00Z'),
        endTime: new Date('2024-08-19T10:30:00Z'),
        duration: 30,
        status: 'SCHEDULED',
        description: 'Test appointment',
        clientNotes: 'First visit',
        createdBy: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        creator: {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      };

      // Mock configuraciones
      mockPrismaService.appointmentSettings.findUnique.mockResolvedValue({
        defaultDuration: 30,
        bufferTime: 5,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowSameDayBooking: true,
      });

      mockPrismaService.businessHours.findMany.mockResolvedValue([
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      ]);

      mockPrismaService.specialHours.findMany.mockResolvedValue([]);
      mockPrismaService.appointment.findFirst.mockResolvedValue(null); // No conflictos
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

      const createData = {
        startTime: '2024-08-19T10:00:00Z',
        description: 'Test appointment',
        clientNotes: 'First visit',
      };

      const result = await service.createAppointment(1, createData, 2);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(1);
      expect(mockPrismaService.appointment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          brandId: 1,
          clientId: 2,
          duration: 30,
          description: 'Test appointment',
          clientNotes: 'First visit',
          createdBy: 2,
          status: 'SCHEDULED',
        }),
        include: expect.any(Object),
      });
    });
  });
});
