import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationPreference } from './entities/notification-preference.entity';

class UpdatePreferencesDto {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestEnabled?: boolean;
  digestFrequency?: 'daily' | 'weekly' | 'monthly';
}

class RegisterPushTokenDto {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getNotifications(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    return this.notificationsService.getUserNotifications(req.user.id, {
      page: page || 1,
      limit: limit || 20,
      unreadOnly: unreadOnly || false,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: any) {
    const count = await this.notificationsService.markAllAsRead(req.user.id);
    return { updated: count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    const deleted = await this.notificationsService.delete(id, req.user.id);
    return { deleted };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@Req() req: any) {
    return this.notificationsService.getOrCreatePreferences(req.user.id);
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.notificationsService.updatePreferences(req.user.id, dto);
  }

  @Post('push-token')
  @ApiOperation({ summary: 'Register push notification token' })
  async registerPushToken(@Req() req: any, @Body() dto: RegisterPushTokenDto) {
    await this.notificationsService.registerPushToken(
      req.user.id,
      dto.token,
      dto.platform,
    );
    return { success: true };
  }
}
