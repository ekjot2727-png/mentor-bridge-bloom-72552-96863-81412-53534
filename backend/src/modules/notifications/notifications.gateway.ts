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
import { LoggerService } from '../../common/services/logger.service';

interface ConnectedUser {
  socketId: string;
  userId: string;
  connectedAt: Date;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(private logger: LoggerService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Notification client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, user] of this.connectedUsers.entries()) {
      if (user.socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected from notifications`);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    
    // Store user connection
    this.connectedUsers.set(userId, {
      socketId: client.id,
      userId,
      connectedAt: new Date(),
    });

    // Join user-specific room
    client.join(`user:${userId}`);
    
    this.logger.log(`User ${userId} joined notification room`);
    
    return { success: true, message: 'Joined notification room' };
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    
    this.connectedUsers.delete(userId);
    client.leave(`user:${userId}`);
    
    this.logger.log(`User ${userId} left notification room`);
    
    return { success: true, message: 'Left notification room' };
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Sent notification to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('notification', notification);
    });
    this.logger.log(`Sent notification to ${userIds.length} users`);
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcast(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Broadcast notification sent');
  }

  /**
   * Send unread count update to user
   */
  sendUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unreadCount', { count });
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get all online user IDs
   */
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Get connection stats
   */
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      users: Array.from(this.connectedUsers.values()).map((u) => ({
        userId: u.userId,
        connectedAt: u.connectedAt,
      })),
    };
  }
}
