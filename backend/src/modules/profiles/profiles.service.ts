import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, ProfileType } from '../../database/entities';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(UserProfile) private profileRepository: Repository<UserProfile>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Update profile fields
    Object.assign(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }

  async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds maximum limit');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), process.env.FILE_UPLOAD_PATH || './uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueName = `${userId}-${uuidv4()}.webp`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Process image with Sharp (compress and convert to WebP)
    await sharp(file.buffer)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(filePath);

    // Delete old photo if exists
    if (profile.profilePhotoUrl) {
      try {
        const oldPath = path.join(uploadsDir, profile.profilePhotoUrl);
        fs.unlinkSync(oldPath);
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    // Update profile with new photo URL
    profile.profilePhotoUrl = uniqueName;
    await this.profileRepository.save(profile);

    return {
      message: 'Profile photo uploaded successfully',
      photoUrl: `/uploads/${uniqueName}`,
    };
  }

  async deleteProfilePhoto(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.profilePhotoUrl) {
      throw new BadRequestException('No profile photo to delete');
    }

    // Delete file
    const uploadsDir = path.join(process.cwd(), process.env.FILE_UPLOAD_PATH || './uploads');
    const filePath = path.join(uploadsDir, profile.profilePhotoUrl);

    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Update profile
    profile.profilePhotoUrl = null;
    await this.profileRepository.save(profile);

    return { message: 'Profile photo deleted successfully' };
  }

  async searchAlumni(filters: any, page = 1, limit = 20) {
    const query = this.profileRepository.createQueryBuilder('profile')
      .where('profile.profileType = :profileType', { profileType: ProfileType.ALUMNI })
      .andWhere('profile.isPublic = true');

    // Apply filters
    if (filters.keyword) {
      query.andWhere(
        '(profile.firstName ILIKE :keyword OR profile.lastName ILIKE :keyword OR profile.bio ILIKE :keyword OR profile.headline ILIKE :keyword)',
        { keyword: `%${filters.keyword}%` },
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      query.andWhere('profile.skills && :skills', { skills: filters.skills });
    }

    if (filters.company) {
      query.andWhere('profile.currentCompany ILIKE :company', {
        company: `%${filters.company}%`,
      });
    }

    if (filters.location) {
      query.andWhere(
        '(profile.city ILIKE :location OR profile.country ILIKE :location)',
        { location: `%${filters.location}%` },
      );
    }

    if (filters.graduationYear) {
      query.andWhere('profile.graduationYear = :year', {
        year: filters.graduationYear,
      });
    }

    if (filters.industry) {
      query.andWhere('profile.industry ILIKE :industry', {
        industry: `%${filters.industry}%`,
      });
    }

    if (filters.offeringMentorship) {
      query.andWhere('profile.offeringMentorship = true');
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 'ASC' : 'DESC';
    query.orderBy(`profile.${sortBy}`, order);

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [profiles, total] = await query.getManyAndCount();

    return {
      data: profiles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAlumniDirectory(page = 1, limit = 20) {
    return this.searchAlumni({}, page, limit);
  }

  async getPublicProfile(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId }, isPublic: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
