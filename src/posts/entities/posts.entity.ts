import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { IsNotEmpty, IsOptional } from 'class-validator';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: '' })
  @IsOptional()
  title: string;
  @Column({ default: '' })
  @IsNotEmpty({ message: 'Required' })
  content: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user: User) => user.posts, {
    onDelete: 'CASCADE',
    nullable: false,
    lazy: true,
  })
  @JoinColumn()
  author: User;
}
