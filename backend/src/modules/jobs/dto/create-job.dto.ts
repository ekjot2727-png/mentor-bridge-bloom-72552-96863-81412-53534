import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType } from '@/database/entities';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Company name' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Job location' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ enum: JobType, description: 'Type of job' })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiPropertyOptional({ description: 'Salary range' })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiPropertyOptional({ type: [String], description: 'Required skills' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Application deadline' })
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;
}
