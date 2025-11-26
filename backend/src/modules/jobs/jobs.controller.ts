import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from './dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  createJob(@Request() req, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(req.user.id, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with filters' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  getJobs(@Query() filterDto: JobFilterDto) {
    return this.jobsService.getJobs(filterDto);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job statistics' })
  getJobStatistics() {
    return this.jobsService.getJobStatistics();
  }

  @Get('my-postings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get jobs posted by current user' })
  getMyPostedJobs(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.jobsService.getMyPostedJobs(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  getJobById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job posting' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  updateJob(
    @Param('id') id: string,
    @Request() req,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(id, req.user.id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job posting' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  deleteJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.deleteJob(id, req.user.id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close a job posting' })
  closeJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.closeJob(id, req.user.id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to a job' })
  @ApiResponse({ status: 200, description: 'Application submitted' })
  applyToJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.incrementApplicationCount(id);
  }
}
