import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_ACCESS = 'DATA_ACCESS',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  DATA = 'DATA',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['category', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditCategory })
  category: AuditCategory;

  @Column({ type: 'varchar', length: 255 })
  resource: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestPath: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  requestMethod: string;

  @Column({ type: 'boolean', default: false })
  isSensitive: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
