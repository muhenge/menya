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
    const { id, username, email, firstName, lastName, slug } = user;
    const userDto = { id, username, email, firstName, lastName, slug };
    return { user: userDto };
  }

  @Get('users')
  async getUsers(): Promise<{ data: number, users: UserDto[] }> {
    const users = await this.userService.getUsers();
    const userDtos = users.map(
      ({ id, username, email, firstName, lastName }) => ({
        id,
        username,
        email,
        firstName,
        lastName,
        slug: username,
      }),
    );
    return { data: userDtos.length, users: userDtos };
  }
}
