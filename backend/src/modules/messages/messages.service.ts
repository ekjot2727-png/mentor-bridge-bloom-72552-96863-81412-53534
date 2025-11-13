import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus, User } from '@/database/entities';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const message = this.messageRepository.create({
      sender,
      receiver,
      content,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Emit WebSocket event
    // this.messagesGateway.sendMessageToUser(receiverId, savedMessage);

    return savedMessage;
  }

  async getConversation(userId: string, otherUserId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const total = await this.messageRepository.count({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
    });

    return {
      data: messages.reverse(),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const query = this.messageRepository.createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.sender.id = :userId OR message.receiver.id = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .distinct(true);

    const messages = await query.skip(skip).take(limit).getMany();

    // Group by conversation partner
    const conversations = new Map();

    messages.forEach(msg => {
      const partnerId = msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
      if (!conversations.has(partnerId)) {
        const partner = msg.sender.id === userId ? msg.receiver : msg.sender;
        conversations.set(partnerId, {
          partner,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unread: msg.receiver.id === userId && msg.status !== MessageStatus.READ,
        });
      }
    });

    const total = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.sender.id = :userId OR message.receiver.id = :userId', { userId })
      .distinct(true)
      .getCount();

    return {
      data: Array.from(conversations.values()),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['receiver'],
    });

    if (!message || message.receiver.id !== userId) {
      throw new NotFoundException('Message not found');
    }

    message.status = MessageStatus.READ;
    message.readAt = new Date();

    return this.messageRepository.save(message);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message || message.sender.id !== userId) {
      throw new BadRequestException('Cannot delete message');
    }

    message.isDeleted = true;
    return this.messageRepository.save(message);
  }
}
