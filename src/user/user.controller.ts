import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Controller('users/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body('signup') createUser: CreateUserDto,
  ): Promise<{ user: UserDto }> {
    const { user } = await this.userService.registerUser(createUser);
    const { id, username, email, firstName, lastName, created_at, updated_at } =
      user;
    const userDto = {
      id,
      username,
      email,
      firstName,
      lastName,
      created_at,
      updated_at,
    };
    return { user: userDto };
  }

  @Get('')
  async getUsers(): Promise<{ data: number; users: UserDto[] }> {
    const users = await this.userService.getUsers();
    const userDtos = users.map(
      ({
        id,
        username,
        email,
        firstName,
        lastName,
        slug,
        created_at,
        updated_at,
      }) => ({
        id,
        username,
        email,
        firstName,
        lastName,
        slug,
        created_at,
        updated_at,
      }),
    );
    return { data: userDtos.length, users: userDtos };
  }

  @Get(':slug')
  async getUserBySlug(@Param('slug') slug: string): Promise<{ user: User }> {
    const user = await this.userService.getUserBySlug(slug);
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user: user };
  }

  @Get('email')
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.getUserByEmail(email);
    return user;
  }
}
