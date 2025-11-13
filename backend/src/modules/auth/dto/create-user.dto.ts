import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  ALUMNI = 'alumni',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
