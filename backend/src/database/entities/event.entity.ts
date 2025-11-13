import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('events')
@Index(['status'])
@Index(['eventDate'])
@Index(['createdAt'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  eventDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  eventType: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  @Column({ default: 0 })
  capacity: number;

  @Column({ default: 0 })
  registeredCount: number;

  @Column({ nullable: true })
  organizerName: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
