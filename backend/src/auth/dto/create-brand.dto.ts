import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum PlanType {
  WEB = 'web',
  APP = 'app',
  COMPLETO = 'completo',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  ownerName: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString({ each: true })
  @IsOptional()
  selectedServices?: string[];

  @IsString()
  @IsOptional()
  colorPalette?: string;

  @IsString({ each: true })
  @IsOptional()
  customColors?: string[];

  @IsEnum(PlanType)
  planType: PlanType;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  isotopoUrl?: string;

  @IsString()
  @IsOptional()
  imagotipoUrl?: string;
}
