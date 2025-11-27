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

export enum DonationType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}

export enum DonationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

@Entity('donations')
@Index(['userId', 'status'])
@Index(['status', 'createdAt'])
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: DonationType, default: DonationType.ONE_TIME })
  type: DonationType;

  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.PENDING })
  status: DonationStatus;

  @Column({ type: 'enum', enum: PaymentProvider, default: PaymentProvider.STRIPE })
  provider: PaymentProvider;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  stripePaymentIntentId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  campaignId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
