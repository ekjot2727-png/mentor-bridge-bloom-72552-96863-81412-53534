import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('analytics')
@Index(['userId'])
@Index(['eventType'])
@Index(['createdAt'])
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  eventType: string; // 'login', 'profile_view', 'message_sent', 'connection_request', etc.

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
