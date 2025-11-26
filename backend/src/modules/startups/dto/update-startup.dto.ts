import { PartialType } from '@nestjs/swagger';
import { CreateStartupDto } from './create-startup.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StartupStatus } from '@/database/entities';

export class UpdateStartupDto extends PartialType(CreateStartupDto) {
  @ApiPropertyOptional({ enum: StartupStatus, description: 'Startup status (admin only)' })
  @IsOptional()
  @IsEnum(StartupStatus)
  status?: StartupStatus;
}
