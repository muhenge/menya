import { Injectable } from '@nestjs/common';
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
    });
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: id } });
    return user || null;
  }

  async getUserBySlug(slug: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { slug: slug } });
    return user || null;
  }
}
