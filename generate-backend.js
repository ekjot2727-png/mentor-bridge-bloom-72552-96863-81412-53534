#!/usr/bin/env node

/**
 * Backend Generation Script
 * Generates complete NestJS backend structure for Mentor Bridge Bloom
 */

const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, '../backend');

// Helper function to create directories
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper function to write file
function writeFile(file, content) {
  const dir = path.dirname(file);
  createDir(dir);
  fs.writeFileSync(file, content, 'utf8');
}

console.log('🚀 Generating Mentor Bridge Bloom Backend...\n');

// 1. Create directory structure
const dirs = [
  'src/common/guards',
  'src/common/interceptors',
  'src/common/pipes',
  'src/common/decorators',
  'src/modules/auth/dto',
  'src/modules/auth/strategies',
  'src/modules/users/dto',
  'src/modules/profiles/dto',
  'src/modules/messages/dto',
  'src/modules/connections/dto',
  'src/modules/analytics/dto',
  'src/modules/jobs/dto',
  'src/modules/events/dto',
  'src/websockets',
];

dirs.forEach(dir => {
  createDir(path.join(backendDir, dir));
});

console.log('✅ Directories created\n');

// 2. Create essential DTOs
const createUserDto = `import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@/database/entities';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
`;

const loginDto = `import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
`;

const updateProfileDto = `import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  currentCompany?: string;

  @IsOptional()
  @IsString()
  currentPosition?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @IsOptional()
  @IsString()
  degreeType?: string;

  @IsOptional()
  @IsString()
  departmentOrCourse?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  headline?: string;
}
`;

const sendMessageDto = `import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
`;

writeFile(path.join(backendDir, 'src/modules/auth/dto/create-user.dto.ts'), createUserDto);
writeFile(path.join(backendDir, 'src/modules/auth/dto/login.dto.ts'), loginDto);
writeFile(path.join(backendDir, 'src/modules/profiles/dto/update-profile.dto.ts'), updateProfileDto);
writeFile(path.join(backendDir, 'src/modules/messages/dto/send-message.dto.ts'), sendMessageDto);

console.log('✅ DTOs created\n');

// 3. Create guards
const jwtAuthGuard = `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`;

writeFile(path.join(backendDir, 'src/common/guards/jwt-auth.guard.ts'), jwtAuthGuard);

console.log('✅ Guards created\n');

// 4. Create response interceptor
const responseInterceptor = `import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
`;

writeFile(path.join(backendDir, 'src/common/interceptors/response.interceptor.ts'), responseInterceptor);

console.log('✅ Interceptors created\n');

// 5. Create validation pipe
const validationPipe = `import { BadRequestException, PipeTransform, ValidationPipe } from '@nestjs/common';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });
}
`;

writeFile(path.join(backendDir, 'src/common/pipes/validation.pipe.ts'), validationPipe);

console.log('✅ Pipes created\n');

// 6. Create main.ts
const mainFile = `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Mentor Bridge Bloom API')
    .setDescription('Alumni networking platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(\`🚀 Application is running on: http://localhost:\${port}\`);
}

bootstrap();
`;

writeFile(path.join(backendDir, 'src/main.ts'), mainFile);

console.log('✅ Main file created\n');

// 7. Create app.module.ts
const appModule = `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    // Import modules here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
`;

writeFile(path.join(backendDir, 'src/app.module.ts'), appModule);

console.log('✅ App module created\n');

// 8. Create .env file if it doesn't exist
const envContent = `NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mentor_bridge_bloom
DB_LOGGING=true

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=7d

FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

FRONTEND_URL=http://localhost:5173

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-password
`;

if (!fs.existsSync(path.join(backendDir, '.env'))) {
  writeFile(path.join(backendDir, '.env'), envContent);
  console.log('✅ .env file created\n');
}

// 9. Create nest-cli.json
const nestCli = `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
`;

writeFile(path.join(backendDir, 'nest-cli.json'), nestCli);

console.log('✅ NestJS CLI config created\n');

console.log('✨ Backend structure generated successfully!\n');
console.log('📝 Next steps:');
console.log('   1. cd backend');
console.log('   2. npm install');
console.log('   3. Update .env with your database credentials');
console.log('   4. npm run start:dev\n');
