import { Test, TestingModule } from '@nestjs/testing';
import { LandingDataService } from './landing-data.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { BusinessTypeDto, FeatureDto, PlanDto, LandingConfigDto } from './types';

// Mock data
const mockBusinessTypes = [
  {
    id: 1,
    key: 'restaurant',
    title: 'Restaurant',
    subtitle: 'Food service',
    description: 'Restaurant business',
    icon: 'restaurant-icon',
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    key: 'retail',
    title: 'Retail',
    subtitle: null,
    description: 'Retail business',
    icon: 'retail-icon',
    order: 2,
    isActive: true,
  },
];

const mockFeatures = [
  {
    id: 1,
    key: 'inventory',
    title: 'Inventory Management',
    subtitle: 'Track stock',
    description: 'Manage your inventory',
    price: 29.99,
    category: 'ESSENTIAL' as const,
    isRecommended: true,
    isPopular: false,
    order: 1,
    businessTypes: ['restaurant', 'retail'],
    isActive: true,
  },
  {
    id: 2,
    key: 'analytics',
    title: 'Analytics',
    subtitle: null,
    description: 'Business analytics',
    price: 49.99,
    category: 'ADVANCED' as const,
    isRecommended: false,
    isPopular: true,
    order: 2,
    businessTypes: ['retail'],
    isActive: true,
  },
];

const mockPlans = [
  {
    id: 1,
    type: 'web' as const,
    name: 'Web Plan',
    description: 'Web solution',
    basePrice: 99.99,
    isActive: true,
  },
  {
    id: 2,
    type: 'app' as const,
    name: 'Mobile App',
    description: null,
    basePrice: 199.99,
    isActive: true,
  },
];

// Mock PrismaService
const mockPrismaService = {
  businessType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  feature: {
    findMany: jest.fn(),
  },
  plan: {
    findMany: jest.fn(),
  },
} as any;

describe('LandingDataService', () => {
  let service: LandingDataService;
  let prismaService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandingDataService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LandingDataService>(LandingDataService);
    prismaService = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getLandingConfig', () => {
    it('should return complete landing configuration successfully', async () => {
      // Arrange
      prismaService.businessType.findMany.mockResolvedValue(mockBusinessTypes);
      prismaService.feature.findMany.mockResolvedValue(mockFeatures);
      prismaService.plan.findMany.mockResolvedValue(mockPlans);

      // Act
      const result = await service.getLandingConfig();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.businessTypes).toHaveLength(2);
      expect(result.data?.features).toHaveLength(2);
      expect(result.data?.plans).toHaveLength(2);
      expect(result.data?.businessTypes[0]).toEqual({
        id: 1,
        key: 'restaurant',
        title: 'Restaurant',
        subtitle: 'Food service',
        description: 'Restaurant business',
        icon: 'restaurant-icon',
        order: 1,
      });
      expect(result.data?.features[0].price).toBe(29.99);
      expect(result.data?.plans[0].basePrice).toBe(99.99);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      prismaService.businessType.findMany.mockRejectedValue(error);

      // Act
      const result = await service.getLandingConfig();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].code).toBe(500);
      expect(result.errors![0].description).toBe('Database connection failed');
    });
  });

  describe('getBusinessTypes', () => {
    it('should return business types successfully', async () => {
      // Arrange
      prismaService.businessType.findMany.mockResolvedValue(mockBusinessTypes);

      // Act
      const result = await service.getBusinessTypes();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].subtitle).toBe('Food service');
      expect(result.data![1].subtitle).toBeUndefined();
      expect(prismaService.businessType.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { title: 'asc' }],
      });
    });

    it('should handle errors when fetching business types', async () => {
      // Arrange
      prismaService.businessType.findMany.mockRejectedValue(new Error('Query failed'));

      // Act
      const result = await service.getBusinessTypes();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors![0].description).toBe('Query failed');
    });
  });

  describe('getFeatures', () => {
    it('should return features successfully', async () => {
      // Arrange
      prismaService.feature.findMany.mockResolvedValue(mockFeatures);

      // Act
      const result = await service.getFeatures();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].price).toBe(29.99);
      expect(result.data![0].subtitle).toBe('Track stock');
      expect(result.data![1].subtitle).toBeUndefined();
      expect(prismaService.feature.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' },
        ],
      });
    });
  });

  describe('getFeaturesForBusinessType', () => {
    it('should return features for specific business type', async () => {
      // Arrange
      const restaurantFeatures = [mockFeatures[0]];
      prismaService.feature.findMany.mockResolvedValue(restaurantFeatures);

      // Act
      const result = await service.getFeaturesForBusinessType('restaurant');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].businessTypes).toContain('restaurant');
      expect(prismaService.feature.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          businessTypes: {
            has: 'restaurant',
          },
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' },
        ],
      });
    });
  });

  describe('getPlans', () => {
    it('should return plans successfully', async () => {
      // Arrange
      prismaService.plan.findMany.mockResolvedValue(mockPlans);

      // Act
      const result = await service.getPlans();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].basePrice).toBe(99.99);
      expect(result.data![0].description).toBe('Web solution');
      expect(result.data![1].description).toBeUndefined();
      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { type: 'asc' },
      });
    });
  });

  describe('getBusinessTypeWithFeatures', () => {
    it('should return business type with recommended features', async () => {
      // Arrange
      const businessType = mockBusinessTypes[0];
      const features = [mockFeatures[0]];
      prismaService.businessType.findUnique.mockResolvedValue(businessType);
      prismaService.feature.findMany.mockResolvedValue(features);

      // Act
      const result = await service.getBusinessTypeWithFeatures('restaurant');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data!.key).toBe('restaurant');
      expect(result.data!.recommendedFeatures).toHaveLength(1);
      expect(result.data!.recommendedFeatures![0].businessTypes).toContain('restaurant');
      expect(prismaService.businessType.findUnique).toHaveBeenCalledWith({
        where: { key: 'restaurant', isActive: true },
      });
    });

    it('should return error when business type not found', async () => {
      // Arrange
      prismaService.businessType.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getBusinessTypeWithFeatures('nonexistent');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors![0].code).toBe(404);
      expect(result.errors![0].description).toContain('nonexistent');
    });

    it('should handle database errors when fetching business type with features', async () => {
      // Arrange
      prismaService.businessType.findUnique.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.getBusinessTypeWithFeatures('restaurant');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors![0].description).toBe('Database error');
    });
  });

  describe('Data transformation', () => {
    it('should properly transform decimal prices to numbers', async () => {
      // Arrange
      const featureWithDecimal = {
        ...mockFeatures[0],
        price: 29.995, // Simulating Prisma Decimal
      };
      prismaService.feature.findMany.mockResolvedValue([featureWithDecimal]);

      // Act
      const result = await service.getFeatures();

      // Assert
      expect(result.data![0].price).toBe(29.995);
      expect(typeof result.data![0].price).toBe('number');
    });

    it('should handle null subtitle and description fields', async () => {
      // Arrange
      const businessTypeWithNulls = {
        ...mockBusinessTypes[0],
        subtitle: null,
      };
      prismaService.businessType.findMany.mockResolvedValue([businessTypeWithNulls]);

      // Act
      const result = await service.getBusinessTypes();

      // Assert
      expect(result.data![0].subtitle).toBeUndefined();
      expect(result.data![0].title).toBe('Restaurant');
    });
  });
});