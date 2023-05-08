import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body('new') createUser: CreateUserDto,
  ): Promise<{ user: UserDto }> {
    const { user } = await this.userService.create(createUser);
    const { id, username, email, firstName, lastName, created_at, updated_at } = user;
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

  @Get('all')
  async getUsers(): Promise<{ data: number, users: UserDto[] }> {
    const users = await this.userService.getUsers();
    const userDtos = users.map(
      ({
        id,
        username,
        email,
        firstName,
        lastName,
        created_at,
        updated_at,
      }) => ({
        id,
        username,
        email,
        firstName,
        lastName,
        created_at,
        updated_at,
      }),
    );
    return { data: userDtos.length, users: userDtos };
  }
}
