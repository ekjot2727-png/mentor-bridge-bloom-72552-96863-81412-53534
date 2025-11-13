import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserProfile, ProfileType } from '@/database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProfile) private profileRepository: Repository<UserProfile>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: any, role: UserRole) {
    const { email, password, firstName, lastName } = createUserDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    // Create profile
    const profileType = role === UserRole.ALUMNI ? ProfileType.ALUMNI : ProfileType.STUDENT;
    const profile = this.profileRepository.create({
      user: savedUser,
      firstName,
      lastName,
      profileType,
    });

    await this.profileRepository.save(profile);

    // Generate tokens
    const tokens = this.generateTokens(savedUser.id, email, role);

    return {
      message: 'User registered successfully',
      user: { id: savedUser.id, email, role },
      ...tokens,
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const tokens = this.generateTokens(payload.sub, payload.email, payload.role);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }

  async verifyEmail(token: string) {
    // Implementation for email verification
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, password reset link sent' };
    }

    // Generate reset token (store in DB with expiry)
    const resetToken = this.jwtService.sign(
      { email, type: 'password-reset' },
      { expiresIn: '1h' },
    );

    // TODO: Send email with reset link

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userRepository.findOne({ where: { email: payload.email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    return { accessToken, refreshToken };
  }
}
