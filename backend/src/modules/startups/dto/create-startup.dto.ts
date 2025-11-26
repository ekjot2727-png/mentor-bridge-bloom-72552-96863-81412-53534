import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsDateString, IsNumber, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StartupStage, FundingStage } from '@/database/entities';

export class CreateStartupDto {
  @ApiProperty({ description: 'Startup name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Startup description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Short tagline' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Industry sector' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ enum: StartupStage, description: 'Current stage' })
  @IsOptional()
  @IsEnum(StartupStage)
  stage?: StartupStage;

  @ApiPropertyOptional({ enum: FundingStage, description: 'Funding stage' })
  @IsOptional()
  @IsEnum(FundingStage)
  fundingStage?: FundingStage;

  @ApiPropertyOptional({ description: 'Founded date' })
  @IsOptional()
  @IsDateString()
  foundedDate?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ type: [String], description: 'Team member names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teamMembers?: string[];

  @ApiPropertyOptional({ description: 'Team size' })
  @IsOptional()
  @IsNumber()
  teamSize?: number;

  @ApiPropertyOptional({ type: [String], description: 'Technologies used' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({ description: 'Pitch deck URL' })
  @IsOptional()
  @IsString()
  pitchDeck?: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'Twitter URL' })
  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Achievements' })
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiPropertyOptional({ description: 'What the startup is looking for' })
  @IsOptional()
  @IsString()
  lookingFor?: string;
}
