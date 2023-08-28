import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { genSalt, hash } from 'bcrypt';
import { Posts } from '../../posts/entities/posts.entity';
import { Exclude } from 'class-transformer';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ default: '' })
  slug: string;
  @Column({ nullable: true })
  @IsOptional()
  firstName: string;
  @Column({ nullable: true })
  @IsOptional()
  lastName: string;
  @Column({ unique: true, nullable: false, type: 'varchar', length: 50 })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;
  @Column({ unique: true, nullable: false })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @Column({ select: false })
  @IsNotEmpty({ message: 'Password is required' })
  @Exclude()
  @MinLength(6)
  password: string;
  @CreateDateColumn({ type: 'timestamp' })
  readonly created_at?: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  readonly updated_at?: Date;
  @BeforeInsert()
  @BeforeUpdate()
  emailToLowerCase() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await genSalt(10);
      this.password = await hash(this.password, salt);
    }
  }
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = this.slugify(this.username);
  }
  slugify(text: string) {
    return text
      ?.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  @OneToMany(() => Posts, (post) => post.author, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: true,
    eager: true,
  })
  posts: Posts[];

  @Column({ nullable: true })
  @IsOptional()
  avatar: string;

  @Column({ nullable: true })
  @IsOptional()
  about: string;
  @Column({ unique: true, nullable: false })
  jti: string;
  @Column({ nullable: false })
  isConfirmed: boolean;
}
