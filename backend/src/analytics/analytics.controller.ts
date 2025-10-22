import { Controller, Get, Param, Query, UseGuards, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { BaseResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOwnerGuard } from '../common/guards/brand-owner.guard';
import { RevenueAnalyticsQueryDto, RevenueAnalyticsResponseDto } from './dto/revenue-analytics.dto';
import { KpisQueryDto, KpisResponseDto } from './dto/kpis.dto';

@ApiTags('Analytics')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue/:brandId')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get comprehensive revenue metrics for a brand',
    description: `
      Retrieves detailed financial metrics for a specific brand including:
      - Daily revenue (today vs yesterday)
      - Weekly revenue (current week vs previous week)
      - Monthly revenue (current month vs previous month)
      - Annual revenue (current year vs previous year)
      
      Each metric includes:
      - Absolute values for current and previous periods
      - Difference in currency
      - Percentage change
      - Breakdown by revenue source (payments and appointments)
      
      **Security**: Only accessible by ROOT or ADMIN users of the specified brand.
    `,
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID of the brand to get revenue metrics for',
    example: 1,
    type: 'integer',
  })
  @ApiQuery({
    name: 'referenceDate',
    description: 'Optional reference date (ISO 8601 format) to calculate metrics from. Defaults to current date/time.',
    required: false,
    example: '2025-10-20T00:00:00Z',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue metrics retrieved successfully',
    type: RevenueAnalyticsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have ROOT/ADMIN permissions for this brand',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getRevenueMetrics(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query() query: RevenueAnalyticsQueryDto,
  ): Promise<BaseResponseDto<RevenueAnalyticsResponseDto>> {
    const referenceDate = query.referenceDate ? new Date(query.referenceDate) : undefined;
    return this.analyticsService.getRevenueMetrics(brandId, referenceDate);
  }

  @Get('kpis/:brandId')
  @UseGuards(BrandOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get key performance indicators (KPIs) for a brand',
    description: 'Retrieves KPIs including average revenue per client, completed appointments, total active clients, total revenue, and completion rate.',
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID of the brand to get KPIs for',
    example: 1,
    type: 'integer',
  })
  @ApiQuery({
    name: 'referenceDate',
    description: 'Optional reference date (ISO 8601 format). Defaults to current date.',
    required: false,
    example: '2025-10-20T00:00:00Z',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'KPIs retrieved successfully',
    type: KpisResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have ROOT/ADMIN permissions for this brand',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  async getKpis(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query() query: KpisQueryDto,
  ): Promise<BaseResponseDto<KpisResponseDto>> {
    const referenceDate = query.referenceDate ? new Date(query.referenceDate) : undefined;
    return this.analyticsService.getKpis(brandId, referenceDate);
  }
}
