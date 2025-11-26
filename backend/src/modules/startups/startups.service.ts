import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Startup, StartupStatus, User, UserRole } from '@/database/entities';
import { CreateStartupDto, UpdateStartupDto, StartupFilterDto } from './dto';

@Injectable()
export class StartupsService {
  constructor(
    @InjectRepository(Startup) private startupRepository: Repository<Startup>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createStartup(userId: string, createStartupDto: CreateStartupDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a startup
    const existingStartup = await this.startupRepository.findOne({
      where: { founderId: userId },
    });

    if (existingStartup) {
      throw new BadRequestException('You already have a registered startup');
    }

    const startup = this.startupRepository.create({
      ...createStartupDto,
      founderId: userId,
      founder: user,
      status: StartupStatus.PENDING,
      foundedDate: createStartupDto.foundedDate 
        ? new Date(createStartupDto.foundedDate) 
        : null,
    });

    return this.startupRepository.save(startup);
  }

  async getStartups(filterDto: StartupFilterDto) {
    const { keyword, stage, status, fundingStage, industry, location, technology, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.startupRepository.createQueryBuilder('startup')
      .leftJoinAndSelect('startup.founder', 'founder');

    // Only show approved startups by default
    if (status) {
      queryBuilder.andWhere('startup.status = :status', { status });
    } else {
      queryBuilder.andWhere('startup.status = :status', { status: StartupStatus.APPROVED });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(startup.name ILIKE :keyword OR startup.description ILIKE :keyword OR startup.tagline ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (stage) {
      queryBuilder.andWhere('startup.stage = :stage', { stage });
    }

    if (fundingStage) {
      queryBuilder.andWhere('startup.fundingStage = :fundingStage', { fundingStage });
    }

    if (industry) {
      queryBuilder.andWhere('startup.industry ILIKE :industry', { industry: `%${industry}%` });
    }

    if (location) {
      queryBuilder.andWhere('startup.location ILIKE :location', { location: `%${location}%` });
    }

    if (technology) {
      queryBuilder.andWhere('startup.technologies ILIKE :technology', { technology: `%${technology}%` });
    }

    queryBuilder
      .orderBy('startup.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [startups, total] = await queryBuilder.getManyAndCount();

    return {
      data: startups,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStartupById(startupId: string) {
    const startup = await this.startupRepository.findOne({ 
      where: { id: startupId },
      relations: ['founder'],
    });
    
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return startup;
  }

  async getMyStartup(userId: string) {
    const startup = await this.startupRepository.findOne({
      where: { founderId: userId },
      relations: ['founder'],
    });

    return startup;
  }

  async updateStartup(startupId: string, userId: string, updateStartupDto: UpdateStartupDto) {
    const startup = await this.startupRepository.findOne({ where: { id: startupId } });
    
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Only founder or admin can update
    if (startup.founderId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to update this startup');
    }

    // Non-admins cannot change status
    if (updateStartupDto.status && user?.role !== UserRole.ADMIN) {
      delete updateStartupDto.status;
    }

    if (updateStartupDto.foundedDate) {
      (updateStartupDto as any).foundedDate = new Date(updateStartupDto.foundedDate);
    }

    Object.assign(startup, updateStartupDto);
    return this.startupRepository.save(startup);
  }

  async deleteStartup(startupId: string, userId: string) {
    const startup = await this.startupRepository.findOne({ where: { id: startupId } });
    
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (startup.founderId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to delete this startup');
    }

    await this.startupRepository.remove(startup);
    return { message: 'Startup deleted successfully' };
  }

  // Admin functions
  async approveStartup(startupId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can approve startups');
    }

    const startup = await this.startupRepository.findOne({ where: { id: startupId } });
    
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    startup.status = StartupStatus.APPROVED;
    return this.startupRepository.save(startup);
  }

  async rejectStartup(startupId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can reject startups');
    }

    const startup = await this.startupRepository.findOne({ where: { id: startupId } });
    
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    startup.status = StartupStatus.REJECTED;
    return this.startupRepository.save(startup);
  }

  async getPendingStartups(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [startups, total] = await this.startupRepository.findAndCount({
      where: { status: StartupStatus.PENDING },
      relations: ['founder'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: startups,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStartupStatistics() {
    const total = await this.startupRepository.count();
    const pending = await this.startupRepository.count({ where: { status: StartupStatus.PENDING } });
    const approved = await this.startupRepository.count({ where: { status: StartupStatus.APPROVED } });
    const rejected = await this.startupRepository.count({ where: { status: StartupStatus.REJECTED } });

    const byStage = await this.startupRepository
      .createQueryBuilder('startup')
      .select('startup.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where('startup.status = :status', { status: StartupStatus.APPROVED })
      .groupBy('startup.stage')
      .getRawMany();

    const byIndustry = await this.startupRepository
      .createQueryBuilder('startup')
      .select('startup.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('startup.status = :status', { status: StartupStatus.APPROVED })
      .groupBy('startup.industry')
      .getRawMany();

    return {
      total,
      pending,
      approved,
      rejected,
      byStage,
      byIndustry,
    };
  }
}
