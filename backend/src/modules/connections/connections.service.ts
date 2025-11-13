import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection, ConnectionStatus, User, UserProfile } from '@/database/entities';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection) private connectionRepository: Repository<Connection>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProfile) private profileRepository: Repository<UserProfile>,
  ) {}

  async sendConnectionRequest(requesterId: string, receiverId: string, message?: string) {
    if (requesterId === receiverId) {
      throw new BadRequestException('Cannot send connection request to yourself');
    }

    const requester = await this.userRepository.findOne({ where: { id: requesterId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });

    if (!requester || !receiver) {
      throw new NotFoundException('User not found');
    }

    // Check if connection already exists
    const existingConnection = await this.connectionRepository.findOne({
      where: [
        { requester: { id: requesterId }, receiver: { id: receiverId } },
        { requester: { id: receiverId }, receiver: { id: requesterId } },
      ],
    });

    if (existingConnection) {
      throw new BadRequestException('Connection request already exists');
    }

    const connection = this.connectionRepository.create({
      requester,
      receiver,
      status: ConnectionStatus.PENDING,
      message,
    });

    return this.connectionRepository.save(connection);
  }

  async respondToConnection(connectionId: string, userId: string, accepted: boolean) {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
      relations: ['requester', 'receiver'],
    });

    if (!connection || connection.receiver.id !== userId) {
      throw new NotFoundException('Connection not found');
    }

    connection.status = accepted ? ConnectionStatus.ACCEPTED : ConnectionStatus.REJECTED;
    connection.respondedAt = new Date();

    return this.connectionRepository.save(connection);
  }

  async getConnectionStatus(userId1: string, userId2: string) {
    const connection = await this.connectionRepository.findOne({
      where: [
        { requester: { id: userId1 }, receiver: { id: userId2 } },
        { requester: { id: userId2 }, receiver: { id: userId1 } },
      ],
    });

    if (!connection) {
      return { status: 'none' };
    }

    return {
      status: connection.status,
      initiator: connection.requester.id === userId1 ? 'self' : 'other',
    };
  }

  async getConnections(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [connections, total] = await this.connectionRepository.findAndCount({
      where: [
        { requester: { id: userId }, status: ConnectionStatus.ACCEPTED },
        { receiver: { id: userId }, status: ConnectionStatus.ACCEPTED },
      ],
      relations: ['requester', 'receiver', 'requester.profile', 'receiver.profile'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const connectionProfiles = connections.map(conn => {
      const partner = conn.requester.id === userId ? conn.receiver : conn.requester;
      return {
        connection: conn,
        profile: conn.requester.id === userId ? conn.receiver.profile : conn.requester.profile,
      };
    });

    return {
      data: connectionProfiles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingRequests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [requests, total] = await this.connectionRepository.findAndCount({
      where: {
        receiver: { id: userId },
        status: ConnectionStatus.PENDING,
      },
      relations: ['requester', 'requester.profile'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async removeConnection(userId: string, connectionId: string) {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
      relations: ['requester', 'receiver'],
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.requester.id !== userId && connection.receiver.id !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    await this.connectionRepository.remove(connection);
    return { message: 'Connection removed successfully' };
  }

  async blockUser(userId: string, blockedUserId: string) {
    const connection = await this.connectionRepository.findOne({
      where: [
        { requester: { id: userId }, receiver: { id: blockedUserId } },
        { requester: { id: blockedUserId }, receiver: { id: userId } },
      ],
    });

    if (connection) {
      connection.status = ConnectionStatus.BLOCKED;
      return this.connectionRepository.save(connection);
    }

    const blocker = await this.userRepository.findOne({ where: { id: userId } });
    const blocked = await this.userRepository.findOne({ where: { id: blockedUserId } });

    if (!blocker || !blocked) {
      throw new NotFoundException('User not found');
    }

    const newConnection = this.connectionRepository.create({
      requester: blocker,
      receiver: blocked,
      status: ConnectionStatus.BLOCKED,
    });

    return this.connectionRepository.save(newConnection);
  }
}
