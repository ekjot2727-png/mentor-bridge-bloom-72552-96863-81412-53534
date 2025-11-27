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
import { NotificationChannel, NotificationType } from './notification.entity';

@Entity('notification_preferences')
@Index(['userId'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Channel preferences
  @Column({ type: 'boolean', default: true })
  emailEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  pushEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  inAppEnabled: boolean;

  // Notification type preferences (which types to receive)
  @Column({ type: 'jsonb', default: {} })
  typePreferences: Record<NotificationType, boolean>;

  // Quiet hours
  @Column({ type: 'boolean', default: false })
  quietHoursEnabled: boolean;

  @Column({ type: 'time', nullable: true })
  quietHoursStart: string; // e.g., "22:00"

  @Column({ type: 'time', nullable: true })
  quietHoursEnd: string; // e.g., "08:00"

  // Email digest preferences
  @Column({ type: 'boolean', default: false })
  digestEnabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'daily' })
  digestFrequency: 'daily' | 'weekly' | 'monthly';

  // Push notification token (for mobile)
  @Column({ type: 'text', nullable: true })
  pushToken: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pushPlatform: 'ios' | 'android' | 'web';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
