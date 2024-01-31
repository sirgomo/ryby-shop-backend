import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('logs')
export class LogsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ebay_transaction_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paypal_transaction_id: string;

  @Column({ type: 'varchar', length: 255 })
  error_class: string;

  @Column({ type: 'varchar', length: 10000 })
  error_message: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
export enum LOGS_CLASS {
  PAYPAL = 'PAYPAL',
  EBAY = 'EBAY',
  EBAY_ERROR = 'EBAY_ERROR',
  PAYPAL_ERROR = 'PAYPAL_ERROR',
  SERVER_LOG = 'SERVER_LOG',
  SUCCESS_LOG = 'SUCCESS_LOG',
}
