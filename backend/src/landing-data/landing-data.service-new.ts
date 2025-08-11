import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { BusinessTypeDto, FeatureDto, PlanDto, LandingConfigDto } from './types';

@Injectable()
export class LandingDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getLandingConfig(): Promise<BaseResponseDto<LandingConfigDto>> {
    try {
      // Optimized: Get all data in parallel
      const [businessTypes, features, plans] = await Promise.all([
        this.prisma.businessType.findMany({
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { title: 'asc' }],
        }),
        this.prisma.feature.findMany({
          where: { isActive: true },
          orderBy: [
            { category: 'asc' },
            { order: 'asc' },
            { title: 'asc' }
          ],
        }),
        this.prisma.plan.findMany({
          where: { isActive: true },
          orderBy: { type: 'asc' },
        }),
      ]);

      // Transform data
      const transformedBusinessTypes: BusinessTypeDto[] = businessTypes.map(bt => ({
        id: bt.id,
        key: bt.key,
        title: bt.title,
        subtitle: bt.subtitle || undefined,
        description: bt.description,
        icon: bt.icon,
        order: bt.order,
      }));

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      const transformedPlans: PlanDto[] = plans.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        description: p.description || undefined,
        basePrice: Number(p.basePrice),
      }));

      const config: LandingConfigDto = {
        businessTypes: transformedBusinessTypes,
        features: transformedFeatures,
        plans: transformedPlans,
      };

      return BaseResponseDto.success(config);
    } catch (error) {
      console.error('Error getting landing config:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getBusinessTypes(): Promise<BaseResponseDto<BusinessTypeDto[]>> {
    try {
      const businessTypes = await this.prisma.businessType.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { title: 'asc' }],
      });

      const transformedBusinessTypes: BusinessTypeDto[] = businessTypes.map(bt => ({
        id: bt.id,
        key: bt.key,
        title: bt.title,
        subtitle: bt.subtitle || undefined,
        description: bt.description,
        icon: bt.icon,
        order: bt.order,
      }));

      return BaseResponseDto.success(transformedBusinessTypes);
    } catch (error) {
      console.error('Error getting business types:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' }
        ],
      });

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      return BaseResponseDto.success(transformedFeatures);
    } catch (error) {
      console.error('Error getting features:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getFeaturesForBusinessType(businessTypeKey: string): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: {
          isActive: true,
          businessTypes: {
            has: businessTypeKey,
          },
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' }
        ],
      });

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      return BaseResponseDto.success(transformedFeatures);
    } catch (error) {
      console.error('Error getting features for business type:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getPlans(): Promise<BaseResponseDto<PlanDto[]>> {
    try {
      const plans = await this.prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { type: 'asc' },
      });

      const transformedPlans: PlanDto[] = plans.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        description: p.description || undefined,
        basePrice: Number(p.basePrice),
      }));

      return BaseResponseDto.success(transformedPlans);
    } catch (error) {
      console.error('Error getting plans:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getBusinessTypeWithFeatures(businessTypeKey: string): Promise<BaseResponseDto<BusinessTypeDto>> {
    try {
      const businessType = await this.prisma.businessType.findUnique({
        where: { key: businessTypeKey, isActive: true },
      });

      if (!businessType) {
        return BaseResponseDto.singleError(404, `Business type with key '${businessTypeKey}' not found`);
      }

      // Get recommended features for this business type
      const features = await this.prisma.feature.findMany({
        where: {
          isActive: true,
          businessTypes: {
            has: businessTypeKey,
          },
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { title: 'asc' }
        ],
      });

      const transformedFeatures: FeatureDto[] = features.map(f => ({
        id: f.id,
        key: f.key,
        title: f.title,
        subtitle: f.subtitle || undefined,
        description: f.description,
        price: Number(f.price),
        category: f.category,
        isRecommended: f.isRecommended,
        isPopular: f.isPopular,
        order: f.order,
        businessTypes: f.businessTypes,
      }));

      const transformedBusinessType: BusinessTypeDto = {
        id: businessType.id,
        key: businessType.key,
        title: businessType.title,
        subtitle: businessType.subtitle || undefined,
        description: businessType.description,
        icon: businessType.icon,
        order: businessType.order,
        recommendedFeatures: transformedFeatures,
      };

      return BaseResponseDto.success(transformedBusinessType);
    } catch (error) {
      console.error('Error getting business type with features:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
