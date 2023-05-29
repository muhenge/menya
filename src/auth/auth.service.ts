import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userService.getUserById(payload.id);
    if (!user) return null;

    return user;
  }

  async register(createUser: CreateUserDto): Promise<{ user: User }> {
    const user = this.UserRepository.create(createUser);
    const createdUser = await this.UserRepository.save(user);
    return { user: createdUser };
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashedPassword);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.UserRepository.findOne({
      where: { email: email },
      select: ['id', 'email', 'username', 'password'],
    });

    if (!user) return null;
    const isMatch = await this.comparePasswords(password, user.password);
    if (!isMatch) return null;

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      sub: user.id,
    };
    return this.jwtService.sign(payload);
  }
}
