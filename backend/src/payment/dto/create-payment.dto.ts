import { IsString, IsEmail, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum PlanType {
  WEB = 'web',
  APP = 'app',
  COMPLETO = 'completo',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export class CreatePaymentDto {
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
  @IsOptional()
  location?: string;

  @IsEnum(PlanType)
  planType: PlanType;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedServices?: string[];
}
