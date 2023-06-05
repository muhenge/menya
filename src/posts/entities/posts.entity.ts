import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import { isNotEmpty, IsOptional } from 'class-validator';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: '' })
  title: string;
  @Column({ default: '' })
  content: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column()
  author: string;
}
