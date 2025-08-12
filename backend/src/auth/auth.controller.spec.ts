import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerClient: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerClient', () => {
    it('should call authService.registerClient', async () => {
      const registerDto = {
        email: 'test@gmail.com',
        username: 'testuser',
        password: 'password',
        branchId: 1,
      };

      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@gmail.com', username: 'testuser', role: 'CLIENT' },
          brand: { id: 1, name: 'Test Branch' },
          token: 'mock-jwt-token',
          rememberMe: false,
        },
      };

      jest.spyOn(authService, 'registerClient').mockResolvedValue(mockResponse);

      const result = await controller.registerClient(registerDto);

      expect(authService.registerClient).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
