import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { IsUUID } from '../../../node_modules/class-validator/esm2015/decorator/string/IsUUID';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Generated()
  slug: string;
  @Column({ nullable: true })
  @IsOptional()
  firstName: string;
  @Column({ nullable: true })
  @IsOptional()
  lastName: string;
  @Column({ unique: true, nullable: false })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;
  @Column({ unique: true, nullable: false })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @Column({ select: false })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @BeforeInsert()
  @BeforeUpdate()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      const salt = await bcrypt.genSaltSync(10);
      this.password = bcrypt.hashSync(this.password, salt);
    } catch (error) {
      console.log(error);
    }
  }
  @BeforeInsert()
  generateSlug() {
    this.slug = this.slugify(this.username);
  }
  slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}
