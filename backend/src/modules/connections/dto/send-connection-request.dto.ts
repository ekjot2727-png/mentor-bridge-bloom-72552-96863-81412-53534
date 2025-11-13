import { IsString, IsOptional, IsUUID } from 'class-validator';

export class SendConnectionRequestDto {
  @IsUUID()
  receiverId: string;

  @IsOptional()
  @IsString()
  message?: string;
}
