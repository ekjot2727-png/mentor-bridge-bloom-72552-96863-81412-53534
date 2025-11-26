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
import { StartupsService } from './startups.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateStartupDto, UpdateStartupDto, StartupFilterDto } from './dto';

@ApiTags('Startups')
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new startup' })
  @ApiResponse({ status: 201, description: 'Startup registered successfully' })
  createStartup(@Request() req, @Body() createStartupDto: CreateStartupDto) {
    return this.startupsService.createStartup(req.user.id, createStartupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all approved startups with filters' })
  @ApiResponse({ status: 200, description: 'List of startups' })
  getStartups(@Query() filterDto: StartupFilterDto) {
    return this.startupsService.getStartups(filterDto);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get startup statistics (admin)' })
  getStartupStatistics() {
    return this.startupsService.getStartupStatistics();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending startups (admin)' })
  getPendingStartups(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.startupsService.getPendingStartups(page, limit);
  }

  @Get('my-startup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user startup' })
  getMyStartup(@Request() req) {
    return this.startupsService.getMyStartup(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get startup by ID' })
  @ApiResponse({ status: 200, description: 'Startup details' })
  @ApiResponse({ status: 404, description: 'Startup not found' })
  getStartupById(@Param('id') id: string) {
    return this.startupsService.getStartupById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a startup' })
  @ApiResponse({ status: 200, description: 'Startup updated successfully' })
  updateStartup(
    @Param('id') id: string,
    @Request() req,
    @Body() updateStartupDto: UpdateStartupDto,
  ) {
    return this.startupsService.updateStartup(id, req.user.id, updateStartupDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a startup' })
  @ApiResponse({ status: 200, description: 'Startup deleted successfully' })
  deleteStartup(@Param('id') id: string, @Request() req) {
    return this.startupsService.deleteStartup(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a startup (admin)' })
  approveStartup(@Param('id') id: string, @Request() req) {
    return this.startupsService.approveStartup(id, req.user.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a startup (admin)' })
  rejectStartup(@Param('id') id: string, @Request() req) {
    return this.startupsService.rejectStartup(id, req.user.id);
  }
}
