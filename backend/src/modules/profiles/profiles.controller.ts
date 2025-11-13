import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Request() req) {
    return this.profilesService.getProfile(req.user.id);
  }

  @Get(':userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.profilesService.getPublicProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('me/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePhoto(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.profilesService.uploadProfilePhoto(req.user.id, file);
  }

  @Delete('me/photo')
  @UseGuards(JwtAuthGuard)
  deleteProfilePhoto(@Request() req) {
    return this.profilesService.deleteProfilePhoto(req.user.id);
  }

  @Get('search/alumni')
  searchAlumni(
    @Query('keyword') keyword?: string,
    @Query('skills') skills?: string,
    @Query('company') company?: string,
    @Query('location') location?: string,
    @Query('graduationYear') graduationYear?: number,
    @Query('industry') industry?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.profilesService.searchAlumni(
      {
        keyword,
        skills: skills ? skills.split(',') : [],
        company,
        location,
        graduationYear: graduationYear ? parseInt(graduationYear.toString()) : undefined,
        industry,
      },
      page,
      limit,
      sortBy,
      order,
    );
  }

  @Get('directory/alumni')
  getAlumniDirectory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.profilesService.getAlumniDirectory(page, limit);
  }
}
