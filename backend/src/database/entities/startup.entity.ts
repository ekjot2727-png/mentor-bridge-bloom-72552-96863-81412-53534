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

export enum StartupStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum StartupStage {
  IDEA = 'idea',
  MVP = 'mvp',
  EARLY_STAGE = 'early_stage',
  GROWTH = 'growth',
  SCALING = 'scaling',
}

export enum FundingStage {
  BOOTSTRAPPED = 'bootstrapped',
  PRE_SEED = 'pre_seed',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
  SERIES_C_PLUS = 'series_c_plus',
}

@Entity('startups')
@Index(['status'])
@Index(['stage'])
@Index(['industry'])
export class Startup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  industry: string;

  @Column({
    type: 'enum',
    enum: StartupStage,
    default: StartupStage.IDEA,
  })
  stage: StartupStage;

  @Column({
    type: 'enum',
    enum: FundingStage,
    default: FundingStage.BOOTSTRAPPED,
  })
  fundingStage: FundingStage;

  @Column({
    type: 'enum',
    enum: StartupStatus,
    default: StartupStatus.PENDING,
  })
  status: StartupStatus;

  @Column({ nullable: true })
  foundedDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-array', nullable: true })
  teamMembers: string[];

  @Column({ nullable: true })
  teamSize: number;

  @Column({ type: 'simple-array', nullable: true })
  technologies: string[];

  @Column({ nullable: true })
  pitchDeck: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  twitterUrl: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Column({ nullable: true })
  lookingFor: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'founderId' })
  founder: User;

  @Column()
  founderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
