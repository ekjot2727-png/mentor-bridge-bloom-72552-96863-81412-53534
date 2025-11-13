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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SendConnectionRequestDto } from './dto/send-connection-request.dto';
import { RespondConnectionRequestDto } from './dto/respond-connection-request.dto';

@ApiTags('Connections')
@ApiBearerAuth()
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  sendConnectionRequest(@Request() req, @Body() sendConnectionRequestDto: SendConnectionRequestDto) {
    return this.connectionsService.sendConnectionRequest(
      req.user.id,
      sendConnectionRequestDto.receiverId,
      sendConnectionRequestDto.message,
    );
  }

  @Put(':connectionId')
  @UseGuards(JwtAuthGuard)
  respondToConnection(
    @Param('connectionId') connectionId: string,
    @Body() respondConnectionRequestDto: RespondConnectionRequestDto,
  ) {
    return this.connectionsService.respondToConnection(
      connectionId,
      respondConnectionRequestDto.accepted,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getConnections(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.connectionsService.getConnections(req.user.id, page, limit);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPendingRequests(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.connectionsService.getPendingRequests(req.user.id, page, limit);
  }

  @Get('status/:userId')
  @UseGuards(JwtAuthGuard)
  getConnectionStatus(@Request() req, @Param('userId') userId: string) {
    return this.connectionsService.getConnectionStatus(req.user.id, userId);
  }
}
