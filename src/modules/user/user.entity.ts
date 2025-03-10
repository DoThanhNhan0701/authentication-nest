import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from '../files/entities/file.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '', length: 100 })
  first_name: string;

  @Column({ default: '', length: 100 })
  last_name: string;

  @Column({ default: '', length: 100 })
  email: string;

  @Column({
    type: 'text',
  })
  @Exclude()
  password: string;

  @Column({ default: '' })
  avatar: string;

  @CreateDateColumn()
  create_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @OneToMany(() => File, (file) => file.user)
  file: File[];

  @OneToOne(() => File, {
    cascade: true,
  })
  @JoinColumn()
  avatarId: File;
}
