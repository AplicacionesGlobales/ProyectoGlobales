import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TilopayService } from './tilopay.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

// Mock data
const mockConfig = {
  TILOPAY_BASE_URL: 'https://api.tilopay.com',
  TILOPAY_API_KEY: 'test-api-key',
  TILOPAY_API_USER: 'test-user',
  TILOPAY_API_PASSWORD: 'test-password',
};

const mockLoginResponse = {
  access_token: 'mock-access-token',
  token_type: 'Bearer',
  expires_in: 3600,
};

const mockPaymentRequest = {
  redirect: 'https://example.com/callback',
  amount: '100.00',
  currency: 'USD',
  orderNumber: 'ORDER-123',
  capture: 'true',
  billToFirstName: 'John',
  billToLastName: 'Doe',
  billToAddress: '123 Main St',
  billToAddress2: '',
  billToCity: 'San Jose',
  billToState: 'SJ',
  billToZipPostCode: '10101',
  billToCountry: 'CR',
  billToTelephone: '+50612345678',
  billToEmail: 'john@example.com',
  subscription: 'false',
  platform: 'web',
};

const mockPaymentResponse = {
  type: 'redirect',
  html: '<form>...</form>',
  url: 'https://checkout.tilopay.com/pay/123',
};

// Mock services
const mockHttpService = {
  post: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('TilopayService', () => {
  let service: TilopayService;
  let httpService: any;
  let configService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup config mock before module creation
    mockConfigService.get.mockImplementation((key: string) => mockConfig[key]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TilopayService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TilopayService>(TilopayService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  describe('getAuthToken', () => {
    it('should get auth token successfully', async () => {
      // Arrange
      const mockResponse: AxiosResponse = {
        data: mockLoginResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      httpService.post.mockReturnValue(of(mockResponse));

      // Act
      const token = await service.getAuthToken();

      // Assert
      expect(token).toBe('mock-access-token');
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
        },
      );
    });

    it('should throw HttpException on login error', async () => {
      // Arrange
      httpService.post.mockReturnValue(throwError(() => new Error('Network error')));

      // Act & Assert
      await expect(service.getAuthToken()).rejects.toThrow(HttpException);
      await expect(service.getAuthToken()).rejects.toThrow('Error obteniendo token de Tilopay');
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      // Arrange
      const loginResponse: AxiosResponse = {
        data: mockLoginResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const paymentResponse: AxiosResponse = {
        data: mockPaymentResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.post
        .mockReturnValueOnce(of(loginResponse))  // First call for login
        .mockReturnValueOnce(of(paymentResponse)); // Second call for payment

      // Act
      const result = await service.processPayment(mockPaymentRequest);

      // Assert
      expect(result).toEqual(mockPaymentResponse);
      expect(httpService.post).toHaveBeenCalledTimes(2);
      
      // Verify login call
      expect(httpService.post).toHaveBeenNthCalledWith(1,
        'https://api.tilopay.com/login',
        expect.any(Object),
        expect.any(Object)
      );

      // Verify payment call
      expect(httpService.post).toHaveBeenNthCalledWith(2,
        'https://api.tilopay.com/processPayment',
        {
          ...mockPaymentRequest,
          key: 'test-api-key',
        },
        {
          headers: {
            'Authorization': 'Bearer mock-access-token',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should throw HttpException on payment error', async () => {
      // Arrange
      httpService.post.mockReturnValue(throwError(() => new Error('Payment failed')));

      // Act & Assert
      await expect(service.processPayment(mockPaymentRequest)).rejects.toThrow(HttpException);
      await expect(service.processPayment(mockPaymentRequest)).rejects.toThrow('Error procesando pago con Tilopay');
    });

    it('should throw HttpException when login fails during payment', async () => {
      // Arrange
      httpService.post.mockReturnValue(throwError(() => new Error('Login failed')));

      // Act & Assert
      await expect(service.processPayment(mockPaymentRequest)).rejects.toThrow(HttpException);
    });
  });

  describe('configuration', () => {
    it('should handle missing configuration gracefully', () => {
      // Arrange
      configService.get.mockReturnValue('');

      // Act & Assert
      expect(() => new TilopayService(httpService, configService)).not.toThrow();
    });

    it('should use default empty strings for missing config', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const newService = new TilopayService(httpService, configService);

      // Assert - Just verify service can be instantiated
      expect(newService).toBeDefined();
    });
  });
});
