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

export enum ProfileType {
  STUDENT = 'student',
  ALUMNI = 'alumni',
}

@Entity('user_profiles')
@Index(['user'])
@Index(['profileType'])
@Index(['graduationYear'])
@Index(['skills'])
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: ProfileType,
  })
  profileType: ProfileType;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column({ nullable: true })
  currentCompany: string;

  @Column({ nullable: true })
  currentPosition: string;

  @Column({ nullable: true })
  industry: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  skills: string[];

  @Column({ nullable: true })
  graduationYear: number;

  @Column({ nullable: true })
  degreeType: string;

  @Column({ nullable: true })
  departmentOrCourse: string;

  @Column({ nullable: true })
  yearsOfExperience: number;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  seekingMentorship: boolean;

  @Column({ default: false })
  offeringMentorship: boolean;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  mentorshipTopics: string[];

  @Column({ nullable: true })
  headline: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
