import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto, UpdateFeatureDto, FeatureDto, FeatureCategory } from './dto';
import { BaseResponseDto } from '../common/dto';

@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async getAllFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: { isActive: true },
        orderBy: [
          { order: 'asc' },
          { category: 'asc' },
          { title: 'asc' }
        ]
      });

      const formattedFeatures: FeatureDto[] = features.map(feature => ({
        id: feature.id,
        key: feature.key,
        title: feature.title,
        subtitle: feature.subtitle || undefined,
        description: feature.description,
        price: Number(feature.price),
        category: feature.category as FeatureCategory,
        isRecommended: feature.isRecommended,
        isPopular: feature.isPopular,
        order: feature.order,
        businessTypes: feature.businessTypes,
        isActive: feature.isActive
      }));

      return BaseResponseDto.success(formattedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      return BaseResponseDto.error([{
        code: 500,
        description: 'Error fetching features'
      }]);
    }
  }

  async getFeaturesByBusinessType(businessType: string): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const features = await this.prisma.feature.findMany({
        where: {
          isActive: true,
          OR: [
            { businessTypes: { has: businessType } },
            { businessTypes: { isEmpty: true } } // Features without specific business types (general)
          ]
        },
        orderBy: [
          { order: 'asc' },
          { category: 'asc' },
          { title: 'asc' }
        ]
      });

      const formattedFeatures: FeatureDto[] = features.map(feature => ({
        id: feature.id,
        key: feature.key,
        title: feature.title,
        subtitle: feature.subtitle || undefined,
        description: feature.description,
        price: Number(feature.price),
        category: feature.category as FeatureCategory,
        isRecommended: feature.isRecommended,
        isPopular: feature.isPopular,
        order: feature.order,
        businessTypes: feature.businessTypes,
        isActive: feature.isActive
      }));

      return BaseResponseDto.success(formattedFeatures);
    } catch (error) {
      console.error('Error fetching features by business type:', error);
      return BaseResponseDto.error([{
        code: 500,
        description: 'Error fetching features by business type'
      }]);
    }
  }

  async getRecommendedFeatures(businessType?: string): Promise<BaseResponseDto<FeatureDto[]>> {
    try {
      const whereCondition: any = {
        isActive: true,
        isRecommended: true
      };

      if (businessType) {
        whereCondition.OR = [
          { businessTypes: { has: businessType } },
          { businessTypes: { isEmpty: true } }
        ];
      }

      const features = await this.prisma.feature.findMany({
        where: whereCondition,
        orderBy: [
          { order: 'asc' },
          { category: 'asc' },
          { title: 'asc' }
        ]
      });

      const formattedFeatures: FeatureDto[] = features.map(feature => ({
        id: feature.id,
        key: feature.key,
        title: feature.title,
        subtitle: feature.subtitle || undefined,
        description: feature.description,
        price: Number(feature.price),
        category: feature.category as FeatureCategory,
        isRecommended: feature.isRecommended,
        isPopular: feature.isPopular,
        order: feature.order,
        businessTypes: feature.businessTypes,
        isActive: feature.isActive
      }));

      return BaseResponseDto.success(formattedFeatures);
    } catch (error) {
      console.error('Error fetching recommended features:', error);
      return BaseResponseDto.error([{
        code: 500,
        description: 'Error fetching recommended features'
      }]);
    }
  }

  async createFeature(createFeatureDto: CreateFeatureDto): Promise<BaseResponseDto<FeatureDto>> {
    try {
      const feature = await this.prisma.feature.create({
        data: {
          key: createFeatureDto.key,
          title: createFeatureDto.title,
          subtitle: createFeatureDto.subtitle,
          description: createFeatureDto.description,
          price: createFeatureDto.price,
          category: createFeatureDto.category,
          isRecommended: createFeatureDto.isRecommended ?? false,
          isPopular: createFeatureDto.isPopular ?? false,
          order: createFeatureDto.order ?? 0,
          businessTypes: createFeatureDto.businessTypes ?? []
        }
      });

      const formattedFeature: FeatureDto = {
        id: feature.id,
        key: feature.key,
        title: feature.title,
        subtitle: feature.subtitle || undefined,
        description: feature.description,
        price: Number(feature.price),
        category: feature.category as FeatureCategory,
        isRecommended: feature.isRecommended,
        isPopular: feature.isPopular,
        order: feature.order,
        businessTypes: feature.businessTypes,
        isActive: feature.isActive
      };

      return BaseResponseDto.success(formattedFeature);
    } catch (error) {
      console.error('Error creating feature:', error);
      return BaseResponseDto.error([{
        code: 500,
        description: 'Error creating feature'
      }]);
    }
  }

  async updateFeature(id: number, updateFeatureDto: UpdateFeatureDto): Promise<BaseResponseDto<FeatureDto>> {
    try {
      const feature = await this.prisma.feature.update({
        where: { id },
        data: {
          key: updateFeatureDto.key,
          title: updateFeatureDto.title,
          subtitle: updateFeatureDto.subtitle,
          description: updateFeatureDto.description,
          price: updateFeatureDto.price,
          category: updateFeatureDto.category,
          isRecommended: updateFeatureDto.isRecommended,
          isPopular: updateFeatureDto.isPopular,
          order: updateFeatureDto.order,
          businessTypes: updateFeatureDto.businessTypes,
          isActive: updateFeatureDto.isActive
        }
      });

      const formattedFeature: FeatureDto = {
        id: feature.id,
        key: feature.key,
        title: feature.title,
        subtitle: feature.subtitle || undefined,
        description: feature.description,
        price: Number(feature.price),
        category: feature.category as FeatureCategory,
        isRecommended: feature.isRecommended,
        isPopular: feature.isPopular,
        order: feature.order,
        businessTypes: feature.businessTypes,
        isActive: feature.isActive
      };

      return BaseResponseDto.success(formattedFeature);
    } catch (error) {
      console.error('Error updating feature:', error);
      return BaseResponseDto.error([{
        code: 500,
        description: 'Error updating feature'
      }]);
    }
  }

  async deleteFeature(id: number): Promise<BaseResponseDto<{ deleted: boolean }>> {
    try {
      await this.prisma.feature.update({
        where: { id },
        data: { isActive: false }
      });

      return BaseResponseDto.success({ deleted: true });
    } catch (error) {
      console.error('Error deleting feature:', error);
      return BaseResponseDto.error([{
        code: 500,
        description: 'Error deleting feature'
      }]);
    }
  }
}
