import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CareerAdvisorQueryDto } from './dto';

@ApiTags('AI Career Advisor')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('career-advisor')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get AI-powered career advice' })
  @ApiResponse({ status: 200, description: 'Career advice response' })
  getCareerAdvice(@Request() req, @Body() queryDto: CareerAdvisorQueryDto) {
    return this.aiService.getCareerAdvice(req.user.id, queryDto);
  }

  @Get('career-advisor/analyze')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get comprehensive career analysis based on profile' })
  @ApiResponse({ status: 200, description: 'Comprehensive career analysis' })
  analyzeCareer(@Request() req) {
    return this.aiService.getCareerAdvice(req.user.id, {});
  }

  @Get('alumni-match')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get AI-suggested alumni matches' })
  @ApiResponse({ status: 200, description: 'Matched alumni list' })
  getAlumniMatch(@Request() req) {
    return this.aiService.getAlumniMatch(req.user.id);
  }
}
