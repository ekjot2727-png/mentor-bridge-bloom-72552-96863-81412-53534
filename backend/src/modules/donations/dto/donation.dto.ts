import { IsNumber, IsString, IsOptional, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationType } from '../entities/donation.entity';

export class CreateDonationDto {
  @ApiProperty({ description: 'Donation amount', example: 50.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiPropertyOptional({ description: 'Donation type', enum: DonationType })
  @IsEnum(DonationType)
  @IsOptional()
  type?: DonationType = DonationType.ONE_TIME;

  @ApiPropertyOptional({ description: 'Optional message with donation' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ description: 'Make donation anonymous', default: false })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;

  @ApiPropertyOptional({ description: 'Campaign ID to attribute donation to' })
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreatePaymentIntentDto extends CreateDonationDto {}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Stripe payment intent ID' })
  @IsString()
  paymentIntentId: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Recurring donation amount per period' })
  @IsNumber()
  @Min(5)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiPropertyOptional({ description: 'Billing interval', enum: ['month', 'year'] })
  @IsString()
  @IsOptional()
  interval?: 'month' | 'year' = 'month';

  @ApiPropertyOptional({ description: 'Make donation anonymous' })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;
}

export class RefundDonationDto {
  @ApiPropertyOptional({ description: 'Refund reason' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Partial refund amount (full refund if not specified)' })
  @IsNumber()
  @IsOptional()
  amount?: number;
}
