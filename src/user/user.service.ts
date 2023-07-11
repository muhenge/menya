import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async registerUser(createUser: CreateUserDto): Promise<{ user: User }> {
    const user = this.usersRepository.create(createUser);
    const createdUser = await this.usersRepository.save(user);
    return { user: createdUser };
  }

  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getUserByEmail(email): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email: email },
      select: ['id', 'email', 'firstName', 'lastName', 'about', 'jti'],
    });
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      select: ['id', 'username', 'email', 'jti'],
    });
    return user || null;
  }

  async getUserBySlug(slug: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { slug: slug },
      select: ['id', 'username', 'email', 'slug', 'firstName', 'lastName'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserProfile(slug: string, id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { slug: slug, id: id },
      select: ['id', 'slug'],
    });

    return user || null;
  }
}
