import { FileType } from 'src/enums/files';
import { User } from 'src/modules/user/user.entity';
import {
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'file' })
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cdn: string;

  @Column({
    type: 'enum',
    enum: FileType,
  })
  type: FileType;

  @CreateDateColumn()
  create_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @ManyToOne(() => User, (user) => user.file)
  user: User;
}
