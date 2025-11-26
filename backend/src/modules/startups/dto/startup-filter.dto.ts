import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StartupStage, StartupStatus, FundingStage } from '@/database/entities';

export class StartupFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: StartupStage, description: 'Filter by stage' })
  @IsOptional()
  @IsEnum(StartupStage)
  stage?: StartupStage;

  @ApiPropertyOptional({ enum: StartupStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(StartupStatus)
  status?: StartupStatus;

  @ApiPropertyOptional({ enum: FundingStage, description: 'Filter by funding stage' })
  @IsOptional()
  @IsEnum(FundingStage)
  fundingStage?: FundingStage;

  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Filter by technology' })
  @IsOptional()
  @IsString()
  technology?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
