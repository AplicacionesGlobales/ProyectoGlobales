// src/subscription/subscription.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma/prisma.service';
import { TilopayService } from '../payment/payment-tilopay/tilopay.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: SubscriptionService;

  beforeEach(async () => {
    const mockPrismaService = {
      brand: {
        findFirst: jest.fn(),
      },
      feature: {
        findUnique: jest.fn(),
      },
      brandFeature: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const mockTilopayService = {
      createPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TilopayService, useValue: mockTilopayService },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    service = module.get<SubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('activateFeature', () => {
    it('should activate a feature successfully', async () => {
      const mockUser = { userId: 1 };
      const mockRequest = { user: mockUser };
      const mockDto = {
        featureId: 1,
        billingPeriod: 'monthly' as any,
      };

      const mockResponse = {
        success: true,
        data: {
          featureActivated: {
            id: 1,
            key: 'test_feature',
            title: 'Test Feature',
            description: 'A test feature',
            category: 'BUSINESS',
            price: 15.0,
            activatedAt: new Date().toISOString(),
          },
          updatedSubscription: {
            totalMonthlyPrice: 44.0,
            subtotalFeatures: 15.0,
            basePlanPrice: 29.0,
            totalFeatures: 1,
          },
          payment: {
            status: 'completed',
            tilopayReference: 'FEAT_123_1',
            amount: 15.0,
            currency: 'USD',
            processedAt: new Date().toISOString(),
          },
          message: 'Funcionalidad "Test Feature" activada exitosamente',
        },
      };

      jest.spyOn(service, 'activateFeature').mockResolvedValue(mockResponse);

      const result = await controller.activateFeature(mockRequest, mockDto);

      expect(result).toEqual(mockResponse);
      expect(service.activateFeature).toHaveBeenCalledWith(
        mockUser.userId,
        mockDto,
      );
    });
  });
});
