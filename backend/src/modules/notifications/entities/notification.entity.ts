import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../database/entities/user.entity';

export enum NotificationType {
  // Connection notifications
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',
  
  // Message notifications
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGE_REPLY = 'MESSAGE_REPLY',
  
  // Job notifications
  NEW_JOB_POSTING = 'NEW_JOB_POSTING',
  JOB_APPLICATION_RECEIVED = 'JOB_APPLICATION_RECEIVED',
  JOB_APPLICATION_STATUS = 'JOB_APPLICATION_STATUS',
  
  // Event notifications
  EVENT_INVITATION = 'EVENT_INVITATION',
  EVENT_REMINDER = 'EVENT_REMINDER',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  
  // System notifications
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  PROFILE_VIEWED = 'PROFILE_VIEWED',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',
  
  // Donation notifications
  DONATION_RECEIVED = 'DONATION_RECEIVED',
  DONATION_THANKYOU = 'DONATION_THANKYOU',
  
  // Other
  GENERAL = 'GENERAL',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('notifications')
@Index(['userId', 'isRead', 'createdAt'])
@Index(['type', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.IN_APP })
  channel: NotificationChannel;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority: NotificationPriority;

  @Column({ type: 'boolean', default: false })
  @Index()
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actionLabel: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relatedEntityType: string;

  @Column({ type: 'uuid', nullable: true })
  senderId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
