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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.id, sendMessageDto.receiverId, sendMessageDto.content);
  }

  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  getConversation(
    @Request() req,
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messagesService.getConversation(req.user.id, userId, page, limit);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getConversations(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messagesService.getConversations(req.user.id, page, limit);
  }

  @Put(':messageId/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('messageId') messageId: string) {
    return this.messagesService.markAsRead(messageId);
  }

  @Delete(':messageId')
  @UseGuards(JwtAuthGuard)
  deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.messagesService.deleteMessage(messageId, req.user.id);
  }
}
