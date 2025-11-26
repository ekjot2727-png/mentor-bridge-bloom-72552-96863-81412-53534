import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareerAdvisorQueryDto {
  @ApiPropertyOptional({ description: 'Direct question to ask the AI' })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Student skills for analysis' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Student interests for analysis' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ description: 'Career goals' })
  @IsOptional()
  @IsString()
  careerGoals?: string;

  @ApiPropertyOptional({ description: 'Current branch/major' })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional({ description: 'Current semester' })
  @IsOptional()
  @IsNumber()
  semester?: number;

  @ApiPropertyOptional({ description: 'CGPA' })
  @IsOptional()
  @IsNumber()
  cgpa?: number;
}
