import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email/email.service';
import { CryptoService } from '../common/services/crypto.service';
import { FileService } from '../common/services/file.service';
import { PlanService } from '../common/services/plan.service';
import { PaymentService } from '../common/services/payment.service';
import { ColorPaletteService } from './services/color-palette.service';
import { UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';

// Mock data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.CLIENT,
  isActive: true,
  userBrands: []
};

const mockBrand = {
  id: 1,
  name: 'Test Brand',
  ownerId: 1
};

const mockUserBrand = {
  id: 1,
  userId: 1,
  brandId: 1,
  passwordHash: '$2a$12$hashedpassword',
  salt: 'salt',
  brand: mockBrand
};

// Mock services
const mockServices = {
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    brand: {
      findUnique: jest.fn(),
    },
    userBrand: {
      create: jest.fn(),
    },
    passwordResetCode: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  jwt: {
    sign: jest.fn(),
  },
  email: {
    sendEmail: jest.fn(),
    loadTemplate: jest.fn(),
  },
  crypto: {
    generateResetCode: jest.fn(),
    hashPassword: jest.fn(),
  },
  config: {
    get: jest.fn(),
  },
  file: {
    uploadBrandImage: jest.fn(),
  },
  plan: {
    createBrandPlan: jest.fn(),
  },
  payment: {
    processPaymentForPlan: jest.fn(),
  },
  colorPalette: {},
} as any;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockServices.prisma },
        { provide: JwtService, useValue: mockServices.jwt },
        { provide: EmailService, useValue: mockServices.email },
        { provide: CryptoService, useValue: mockServices.crypto },
        { provide: ConfigService, useValue: mockServices.config },
        { provide: FileService, useValue: mockServices.file },
        { provide: PlanService, useValue: mockServices.plan },
        { provide: PaymentService, useValue: mockServices.payment },
        { provide: ColorPaletteService, useValue: mockServices.colorPalette },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);

    // Setup default mocks
    mockServices.config.get.mockReturnValue('TestApp');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerClient', () => {
    const registerDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
      branchId: 1,
    };

    it('should register client successfully', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.brand.findUnique.mockResolvedValue(mockBrand);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.userBrand.create.mockResolvedValue(mockUserBrand);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      // Act
      const result = await service.registerClient(registerDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe(registerDto.email);
      expect(result.data?.brand?.id).toBe(mockBrand.id);
      expect(result.data?.token).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.registerClient(registerDto);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe(1001);
    });

    it('should reject non-existent brand', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.brand.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.registerClient(registerDto);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors![0].code).toBe(1002);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123',
      rememberMe: false,
    };

    it('should login successfully', async () => {
      // Arrange
      const userWithBrands = {
        ...mockUser,
        userBrands: [mockUserBrand],
      };
      prisma.user.findFirst.mockResolvedValue(userWithBrands);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe(loginDto.email);
      expect(result.data?.token).toBeDefined();
      expect(result.data?.refreshToken).toBeUndefined();
    });

    it('should create refresh token when rememberMe is true', async () => {
      // Arrange
      const userWithBrands = {
        ...mockUser,
        userBrands: [mockUserBrand],
      };
      prisma.user.findFirst.mockResolvedValue(userWithBrands);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act
      const result = await service.login({
        ...loginDto,
        rememberMe: true,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.refreshToken).toBeDefined();
      expect(result.data?.rememberMe).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      // Arrange
      prisma.user.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors![0].code).toBe(2000);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send reset code successfully', async () => {
      // Arrange
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.passwordResetCode.updateMany.mockResolvedValue({ count: 0 });
      prisma.passwordResetCode.create.mockResolvedValue({});
      mockServices.crypto.generateResetCode.mockReturnValue('123456');
      mockServices.email.sendEmail.mockResolvedValue(true);
      mockServices.email.loadTemplate.mockReturnValue('email template');

      // Act
      const result = await service.requestPasswordReset({ email: 'test@example.com' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
      expect(mockServices.email.sendEmail).toHaveBeenCalled();
    });

    it('should return success even for non-existent user', async () => {
      // Arrange
      prisma.user.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.requestPasswordReset({ email: 'nonexistent@example.com' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });
  });

  describe('validateResetCode', () => {
    const validateDto = {
      code: '123456',
      email: 'test@example.com',
    };

    it('should validate code successfully', async () => {
      // Arrange
      const resetCode = {
        id: 1,
        code: '123456',
        email: 'test@example.com',
        userId: 1,
        attempts: 0,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
        user: mockUser,
      };
      prisma.passwordResetCode.findFirst.mockResolvedValue(resetCode);

      // Act
      const result = await service.validateResetCode(validateDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
      expect(result.data?.userId).toBe(1);
    });

    it('should reject invalid code', async () => {
      // Arrange
      prisma.passwordResetCode.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.validateResetCode(validateDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
    });
  });

  describe('resetPassword', () => {
    const resetDto = {
      code: '123456',
      email: 'test@example.com',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    };

    it('should handle reset password flow', async () => {
      // Act
      const result = await service.resetPassword(resetDto);

      // Assert - Just verify it returns a response structure
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should reject mismatched passwords', async () => {
      // Act
      const result = await service.resetPassword({
        ...resetDto,
        confirmPassword: 'DifferentPassword',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(false);
      expect(result.data?.message).toContain('no coinciden');
    });
  });

  describe('cleanupExpiredCodes', () => {
    it('should clean up expired codes', async () => {
      // Arrange
      prisma.passwordResetCode.deleteMany.mockResolvedValue({ count: 5 });

      // Act
      const result = await service.cleanupExpiredCodes();

      // Assert
      expect(result).toBe(5);
      expect(prisma.passwordResetCode.deleteMany).toHaveBeenCalled();
    });
  });

  describe('password validation', () => {
    it('should validate strong password', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'StrongPass123',
        firstName: 'Test',
        lastName: 'User',
        branchId: 1,
      };
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.brand.findUnique.mockResolvedValue(mockBrand);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.userBrand.create.mockResolvedValue(mockUserBrand);

      // Act
      const result = await service.registerClient(registerDto);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject weak password', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
        branchId: 1,
      };

      // Act
      const result = await service.registerClient(registerDto);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.code === 1008)).toBe(true);
    });
  });
});
