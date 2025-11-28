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
    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    
    const query = this.profileRepository.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('profile.profileType = :profileType', { profileType: ProfileType.ALUMNI })
      .andWhere('profile.isPublic = true');

    // Apply filters
    if (filters.keyword) {
      query.andWhere(
        '(profile.firstName ILIKE :keyword OR profile.lastName ILIKE :keyword OR profile.bio ILIKE :keyword OR profile.headline ILIKE :keyword)',
        { keyword: `%${filters.keyword}%` },
      );
    }

    // Skills is stored as simple-array (comma-separated string), so use LIKE
    if (filters.skills && filters.skills.length > 0) {
      const skillConditions = filters.skills.map((skill: string, index: number) => {
        return `profile.skills ILIKE :skill${index}`;
      });
      const skillParams = filters.skills.reduce((acc: any, skill: string, index: number) => {
        acc[`skill${index}`] = `%${skill}%`;
        return acc;
      }, {});
      query.andWhere(`(${skillConditions.join(' OR ')})`, skillParams);
    }

    if (filters.company) {
      query.andWhere('profile.currentCompany ILIKE :company', {
        company: `%${filters.company}%`,
      });
    }

    if (filters.location) {
      query.andWhere(
        '(profile.city ILIKE :location OR profile.country ILIKE :location OR profile.location ILIKE :location)',
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
    const skip = (pageNum - 1) * limitNum;
    query.skip(skip).take(limitNum);

    const [profiles, total] = await query.getManyAndCount();

    // Transform profiles to include user info in the expected format
    const transformedProfiles = profiles.map(profile => ({
      id: profile.user?.id || profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user?.email,
      role: profile.user?.role || profile.profileType,
      profile: {
        id: profile.id,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location || profile.city,
        skills: profile.skills,
        college: profile.departmentOrCourse,
        graduationYear: profile.graduationYear,
        company: profile.currentCompany,
        jobTitle: profile.currentPosition,
        avatarUrl: profile.profilePhotoUrl,
        industry: profile.industry,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
      },
    }));

    return {
      data: transformedProfiles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
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
