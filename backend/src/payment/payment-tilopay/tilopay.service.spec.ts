import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { TilopayService } from './tilopay.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../../common/services/pricing.service';
import { of, throwError } from 'rxjs';

describe('TilopayService', () => {
  let service: TilopayService;
  let httpService: any;
  let configService: any;
  let prismaService: any;
  let pricingService: any;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          TILOPAY_BASE_URL: 'https://api.tilopay.com',
          TILOPAY_API_KEY: 'test-key',
          TILOPAY_API_USER: 'test-user',
          TILOPAY_API_PASSWORD: 'test-password',
          FRONTEND_URL: 'http://localhost:3001',
        };
        return config[key];
      }),
    };

    const mockPrismaService = {
      brand: {
        findFirst: jest.fn(),
      },
      payment: {
        create: jest.fn(),
      },
      brandPlan: {
        update: jest.fn(),
      },
    };

    const mockPricingService = {
      calculateTotalPrice: jest.fn().mockReturnValue(100),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TilopayService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PricingService, useValue: mockPricingService },
      ],
    }).compile();

    service = module.get<TilopayService>(TilopayService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    pricingService = module.get(PricingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthToken', () => {
    it('should get auth token successfully', async () => {
      // Arrange
      const mockResponse = {
        data: { access_token: 'test-token' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      httpService.post.mockReturnValue(of(mockResponse));

      // Act
      const token = await service.getAuthToken();

      // Assert
      expect(token).toBe('test-token');
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.tilopay.com/login',
        {
          apiuser: 'test-user',
          password: 'test-password',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should throw HttpException on auth error', async () => {
      // Arrange
      httpService.post.mockReturnValue(throwError(() => new Error('Auth failed')));

      // Act & Assert
      await expect(service.getAuthToken()).rejects.toThrow(HttpException);
    });
  });

  describe('processPayment', () => {
    const mockPaymentData = {
      amount: '100.00',
      currency: 'USD',
      orderNumber: 'ORDER-123',
      redirect: 'http://localhost:3001/callback',
      billToEmail: 'test@example.com',
      billToFirstName: 'John',
      billToLastName: 'Doe',
      billToAddress: 'Test Address',
      billToAddress2: 'N/A',
      billToCity: 'San José',
      billToState: 'San José',
      billToZipPostCode: '10101',
      billToCountry: 'CR',
      billToTelephone: '12345678',
      subscription: '0',
      platform: 'api',
      capture: '1',
      returnData: 'encoded-data',
    };

    it('should process payment successfully', async () => {
      // Arrange
      const mockLoginResponse = {
        data: { access_token: 'test-token' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const mockPaymentResponse = {
        data: { url: 'https://checkout.tilopay.com/pay/123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      httpService.post
        .mockReturnValueOnce(of(mockLoginResponse))
        .mockReturnValueOnce(of(mockPaymentResponse));

      // Act
      const result = await service.processPayment(mockPaymentData);

      // Assert
      expect(result.url).toBe('https://checkout.tilopay.com/pay/123');
      expect(httpService.post).toHaveBeenCalledTimes(2);
    });

    it('should throw HttpException for incomplete payment data', async () => {
      // Arrange
      const incompleteData = { ...mockPaymentData, amount: '' };

      // Act & Assert
      await expect(service.processPayment(incompleteData)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException on payment error', async () => {
      // Arrange
      httpService.post.mockReturnValue(throwError(() => new Error('Payment failed')));

      // Act & Assert
      await expect(service.processPayment(mockPaymentData)).rejects.toThrow(HttpException);
    });
  });

  describe('createPayment', () => {
    const mockCreatePaymentDto = {
      name: 'Test Brand',
      planType: 'basic',
      selectedServices: ['service1'],
      billingCycle: 'monthly',
      ownerName: 'John Doe',
      email: 'john@example.com',
      phone: '12345678',
    };

    it('should create payment successfully', async () => {
      // Arrange
      const mockLoginResponse = {
        data: { access_token: 'test-token' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const mockPaymentResponse = {
        data: { url: 'https://checkout.tilopay.com/pay/123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      httpService.post
        .mockReturnValueOnce(of(mockLoginResponse))
        .mockReturnValueOnce(of(mockPaymentResponse));

      // Act
      const result = await service.createPayment(mockCreatePaymentDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.paymentUrl).toBe('https://checkout.tilopay.com/pay/123');
      expect(pricingService.calculateTotalPrice).toHaveBeenCalled();
    });

    it('should handle payment creation error', async () => {
      // Arrange
      httpService.post.mockReturnValue(throwError(() => new Error('API Error')));

      // Act
      const result = await service.createPayment(mockCreatePaymentDto);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('handlePaymentCallback', () => {
    it('should handle successful payment callback', async () => {
      // Arrange
      const mockQuery = {
        code: '1',
        description: 'Payment successful',
        order: 'ORDER-123',
        'tilopay-transaction': 'TXN-456',
        auth: 'AUTH-789',
        returnData: Buffer.from(JSON.stringify({
          brandData: { email: 'john@example.com' },
          amount: 100,
        })).toString('base64'),
      };

      const mockResponse = {
        redirect: jest.fn(),
      };

      const mockBrand = {
        id: 1,
        name: 'Test Brand',
        brandPlans: [{
          id: 1,
          isActive: true,
          plan: { name: 'Basic Plan' }
        }],
      };

      prismaService.brand.findFirst.mockResolvedValue(mockBrand);
      prismaService.payment.create.mockResolvedValue({ id: 1 });
      prismaService.brandPlan.update.mockResolvedValue({});

      // Act
      await service.handlePaymentCallback(mockQuery, mockResponse as any);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalled();
    });

    it('should handle failed payment callback', async () => {
      // Arrange
      const mockQuery = {
        code: '0',
        description: 'Payment failed',
        order: 'ORDER-123',
      };

      const mockResponse = {
        redirect: jest.fn(),
      };

      // Act
      await service.handlePaymentCallback(mockQuery, mockResponse as any);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });
});