import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Job, JobStatus, User, UserRole } from '@/database/entities';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from './dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createJob(userId: string, createJobDto: CreateJobDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ALUMNI && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only alumni and admins can post jobs');
    }

    const job = this.jobRepository.create({
      ...createJobDto,
      postedByUserId: userId,
      postedDate: new Date(),
      status: JobStatus.OPEN,
      applicationDeadline: createJobDto.applicationDeadline 
        ? new Date(createJobDto.applicationDeadline) 
        : null,
    });

    return this.jobRepository.save(job);
  }

  async getJobs(filterDto: JobFilterDto) {
    const { keyword, jobType, status, location, company, skill, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (keyword) {
      queryBuilder.andWhere(
        '(job.title ILIKE :keyword OR job.description ILIKE :keyword OR job.companyName ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (jobType) {
      queryBuilder.andWhere('job.jobType = :jobType', { jobType });
    }

    if (status) {
      queryBuilder.andWhere('job.status = :status', { status });
    } else {
      // Default to open jobs only
      queryBuilder.andWhere('job.status = :status', { status: JobStatus.OPEN });
    }

    if (location) {
      queryBuilder.andWhere('job.location ILIKE :location', { location: `%${location}%` });
    }

    if (company) {
      queryBuilder.andWhere('job.companyName ILIKE :company', { company: `%${company}%` });
    }

    if (skill) {
      queryBuilder.andWhere('job.requiredSkills ILIKE :skill', { skill: `%${skill}%` });
    }

    queryBuilder
      .orderBy('job.postedDate', 'DESC')
      .skip(skip)
      .take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      data: jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getJobById(jobId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async updateJob(jobId: string, userId: string, updateJobDto: UpdateJobDto) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (job.postedByUserId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to update this job');
    }

    if (updateJobDto.applicationDeadline) {
      updateJobDto.applicationDeadline = new Date(updateJobDto.applicationDeadline).toISOString();
    }

    Object.assign(job, updateJobDto);
    return this.jobRepository.save(job);
  }

  async deleteJob(jobId: string, userId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (job.postedByUserId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to delete this job');
    }

    await this.jobRepository.remove(job);
    return { message: 'Job deleted successfully' };
  }

  async getMyPostedJobs(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [jobs, total] = await this.jobRepository.findAndCount({
      where: { postedByUserId: userId },
      order: { postedDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async closeJob(jobId: string, userId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (job.postedByUserId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to close this job');
    }

    job.status = JobStatus.CLOSED;
    return this.jobRepository.save(job);
  }

  async incrementApplicationCount(jobId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    job.applicationsCount += 1;
    return this.jobRepository.save(job);
  }

  // Job Applications - Using a simple tracking in User entity or separate table
  // For now, we'll store saved jobs in memory (in production, use a separate table)
  
  async getJobStatistics() {
    const totalJobs = await this.jobRepository.count();
    const openJobs = await this.jobRepository.count({ where: { status: JobStatus.OPEN } });
    const closedJobs = await this.jobRepository.count({ where: { status: JobStatus.CLOSED } });
    const filledJobs = await this.jobRepository.count({ where: { status: JobStatus.FILLED } });

    const jobsByType = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.jobType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.jobType')
      .getRawMany();

    return {
      total: totalJobs,
      open: openJobs,
      closed: closedJobs,
      filled: filledJobs,
      byType: jobsByType,
    };
  }
}
