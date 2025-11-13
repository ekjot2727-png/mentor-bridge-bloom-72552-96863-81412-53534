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
import { User } from './user.entity';

export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

@Entity('connections')
@Index(['requester'])
@Index(['receiver'])
@Index(['status'])
@Index(['createdAt'])
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentConnections, { onDelete: 'CASCADE' })
  @JoinColumn()
  requester: User;

  @ManyToOne(() => User, (user) => user.receivedConnections, { onDelete: 'CASCADE' })
  @JoinColumn()
  receiver: User;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING,
  })
  status: ConnectionStatus;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
