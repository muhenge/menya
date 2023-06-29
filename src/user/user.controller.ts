import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from 'src/auth/guards';
import { GetAuthUser } from 'src/auth/decorators';

@Controller('users/')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Get('profile/:slug')
  @UseGuards(JwtGuard)
  async profile(@Param('slug') slug: string): Promise<{ user: User }> {
    const user = await this.userService.getUserBySlug(slug);
    return { user };
  }
}
