import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MessagesGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(client.id, userId);
      client.join(`user:${userId}`);
      
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      
      // Notify others that user is online
      this.server.emit('user:online', { userId });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.server.emit('user:offline', { userId });
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = this.connectedUsers.get(client.id);
    
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.sendMessage(
        senderId,
        data.receiverId,
        data.content,
      );

      // Send to receiver if online
      this.server.to(`user:${data.receiverId}`).emit('message:new', {
        message,
        from: senderId,
      });

      // Confirm to sender
      return { success: true, message };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('message:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    const senderId = this.connectedUsers.get(client.id);
    
    if (senderId) {
      this.server.to(`user:${data.receiverId}`).emit('message:typing', {
        userId: senderId,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.markAsRead(data.messageId, userId);
      
      // Notify sender that message was read
      this.server.to(`user:${message.sender.id}`).emit('message:read', {
        messageId: data.messageId,
        readBy: userId,
      });

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Helper method to send message to specific user
  sendMessageToUser(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('message:new', message);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    for (const [_, uid] of this.connectedUsers) {
      if (uid === userId) return true;
    }
    return false;
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(new Set(this.connectedUsers.values()));
  }
}
