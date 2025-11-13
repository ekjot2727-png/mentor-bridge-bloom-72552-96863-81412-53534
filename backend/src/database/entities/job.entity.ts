import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
}

@Entity('jobs')
@Index(['status'])
@Index(['jobType'])
@Index(['postedDate'])
@Index(['createdAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  companyName: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @Column({ nullable: true })
  salary: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  requiredSkills: string[];

  @Column({ nullable: true })
  applicationDeadline: Date;

  @Column()
  postedDate: Date;

  @Column({ nullable: true })
  postedByUserId: string;

  @Column({ default: 0 })
  applicationsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
