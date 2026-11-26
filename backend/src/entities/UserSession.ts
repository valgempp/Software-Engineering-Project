import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';

@Entity({ name: 'user_sessions' })
export class UserSession {
  @PrimaryColumn({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;
}
